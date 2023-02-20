import moment from "moment-timezone";
import { Socket } from "net";

import PacketCrypto from "../packet/tools/PacketCrypto";
import PacketReader from "../packet/tools/PacketReader";
import PacketWriter from "../packet/tools/PacketWriter";
import Opcodes from "../packet/tools/Opcodes";
import { Account } from "@prisma/client";
import { MapleCharacter } from "./MapleCharacter";
import Queue from "queue";
import { buffer } from "stream/consumers";
import prisma from "../database/prisma";
import LoginPacket from "../tools/packet/LoginPacket";
import MaplePacketCreator from "../tools/MaplePacketCreator";

// 초기 iv(Initialization vector)값. 랜덤이어도 상관없을듯?
const ivRecv = new Uint8Array([0x65, 0x56, 0x12, 0xfd]);
const ivSend = new Uint8Array([0x2f, 0xa3, 0x65, 0x43]);

// Socket 을 통해 connection 이 생성되면 각 커넥션마다 생성되는 Client 객체
class MapleClient {
	public static LOGIN_NOTLOGGEDIN = 0;
	public static LOGIN_SERVER_TRANSITION = 1;
	public static LOGIN_LOGGEDIN = 2;
	public static CHANGE_CHANNEL = 3;
	public static DEFAULT_CHARSLOT = 6;
	public static CLIENT_KEY = "CLIENT";

	private _player: MapleCharacter;

	private _channel: number = 1;
	private _accId: number = -1;
	private _world: number;
	private _birthday: number;

	private _charslots: number = MapleClient.DEFAULT_CHARSLOT;

	private _loggedIn: boolean = false;
	private _serverTransition: boolean = false;

	// private tempban : Calendar = null;

	private _accName: string; // Login 시 사용하는 계정 ID

	// 핑퐁
	private _pingpongTask: NodeJS.Timeout;
	private _lastPing: moment.Moment | undefined;
	private _lastPong: moment.Moment | undefined;

	private _lastDLLWatch: moment.Moment = moment(0);
	private _lastHashWatch: moment.Moment = moment(0);

	private monitored: boolean = false;
	private receiving: boolean = true;

	private _gm: boolean = false;
	private _greason: number = 1;
	private _gender: number = 0;

	private _chatBlocked = false; // 채팅 금지 여부
	private _chatBlockTime: bigint = 0n;

	public loginAttempt: number = 0; // 로그인 시도 횟수

	private _allowedChar = new Array<number>();

	private _hwid = "";

	// [임시]
	// private _engines = new Map<string, ScriptEngine>();

	private _secondPw: string = null;
	private _salt: string = null;
	private _ip: string = null;
	private _tempIp: string = null;

	// private mutex: Lock = new ReentrantLock();
	// private decodemutex: Lock = new ReentrantLock(true);
	// private npc_mutex: Lock = new ReentrantLock();
	// private static login_mutex: Lock = new ReentrantLock(true);

	private _lastNpcClick: bigint = 0n;

	private _banByClient: string = null;

	private _checkedCRC: boolean = false;
	private _checkedDLL: boolean = false;

	private _modules: Array<number> = null;

	// 패킷 암호화/복호화 클래스
	private _recv: PacketCrypto = null;
	private _send: PacketCrypto = null;

	private _csocket: Socket = null;

	// private static _logger = Logger.getLogger("MapleClient")

	private _stop: boolean = false;
	private _cs = false; // 캐시샵?

	// private _session : MapleSession = null;

	private myCodeHash: string = "";
	private loginState = true; // [임시]
	// private packetQueue = new Queue(); 필요해질지도 모름

	// private socket: Socket;

	constructor(socket: Socket, channel: number) {
		this._csocket = socket;
		this._ip = this._csocket.remoteAddress;

		this._recv = new PacketCrypto(ivRecv, 65);
		this._send = new PacketCrypto(ivSend, 0xffff - 65);

		this.setChannel(channel);

		// 추후 일괄적인 관리를 위해 Custom session 있으면 좋을듯
		// this.session = new MapleSession(this)

		this.run();
	}

	//---Do not modify---------------------------------------
	//---Do not modify---------------------------------------
	// ping-pong, hello packet
	private run() {
		try {
			this.sendHandshake();
			this.startPingPong();
		} catch (err) {
			console.log(err);
		}
	}
	private sendHandshake(): void {
		const hello = LoginPacket.getHello(ivRecv, ivSend);
		this._csocket.write(hello); // 주의: sendPacket 으로 보내면 안됨
	}
	private startPingPong() {
		this._pingpongTask = setInterval(() => {
			const pingPacket = new PacketWriter(Opcodes.serverOpcodes.PING);
			this.sendPacket(pingPacket.getBuffer());
			this._lastPing = moment();
		}, 10000);
	}
	public getPacketReader(packet: Buffer) {
		return this.readPacket(packet);
	}
	private readPacket(packet: Buffer) {
		if (packet.length === 0) return null;

		const headerLength = 4; // 4 bytes
		const payloadLength = packet.length - headerLength;

		if (payloadLength < 1) return null;

		const block = packet.slice(headerLength); // 헤더를 제외한 나머지
		const payload = this._recv.decrypt(block);

		return new PacketReader(payload);
	}
	public sendPacket(packet: Buffer): void {
		// console.log("[SEND]");
		// console.log(packet);
		const header = this._send.getPacketHeader(packet.length);
		this._csocket.write(header);

		const encryptedData = this._send.encrypt(packet);
		this._csocket.write(encryptedData);
	}
	public async login(name: string, pw: string) {
		let loginOk = 5;
		try {
			const account = await prisma.account.findUnique({ where: { name } });
			if (!account) {
				const result = await prisma.account.create({ data: { name, password: pw } });
				if (result) {
					this.sendPacket(MaplePacketCreator.serverNotice(1, "계정이 생성되었습니다."));
					loginOk = 20;
					return;
				} else {
					this.sendPacket(MaplePacketCreator.serverNotice(1, "계정 생성 실패"));
					loginOk = 5;
				}
			}
			// 벤, 채금, 비번 등등 체크 if() { } else { }
			this._accName = account.name;
			this._accId = account.id;
			this._secondPw = account.second_password;
			this._salt = account.salt;
			this._gm = account.gm > 0;
			this._gender = account.gender;
			this._loggedIn = true;
			this._chatBlocked = false;
			this._birthday = account.birthday.getTime();

			const loginState = this.getLoginState(account);
			// already loggedIn
			// if (loginState > MapleClient.LOGIN_NOTLOGGEDIN) {
			if (false) {
				this._loggedIn = false;
				loginOk = 7;
			} else {
				loginOk = this._loggedIn ? 0 : 4;
			}
		} catch (err) {
			console.log(err);
			loginOk = 6;
		} finally {
		}
		return loginOk;
	}

	////////////////////////////////////////////
	//////////////  Data Loader    /////////////
	/**
	 * 캐릭터를 조회하여 Array[MapleCharacter] 를 반환합니다
	 */
	public async loadCharacters(worldId: number) {
		let charSlot: Array<MapleCharacter> = [];

		try {
			// 1. 캐릭터가 존재하는지 조회합니다
			const cl = await this.loadCharactersInternal(worldId);

			// 2. 조회된 ID를 통해 플레이어의 데이터가 담긴 MapleCharacter 객체를 생성합니다
			for (const c of cl) {
				const cb = await MapleCharacter.loadCharFromDB(this, c.id, false);
				if (cb !== null) charSlot.push(cb);
			}
		} catch (err) {
			console.log(err);
		}
		return charSlot;
	}

	public async loadChatblockData() {
		try {
			this._chatBlocked = false;
			this._chatBlockTime = 0n;
		} catch (err) {}
	}

	////////////////////////////////////////////
	////////////////  Method    ////////////////
	private async loadCharactersInternal(serverId: number) {
		const chars = await prisma.character.findMany({
			where: {
				world: serverId,
				account_id: this._accId,
			},
			select: {
				id: true,
				name: true,
				gm: true,
			},
		});
		return chars;
	}

	private getLoginState(account: Account) {
		try {
			let state = account.loggedin;
			if (state == MapleClient.LOGIN_SERVER_TRANSITION || state == MapleClient.CHANGE_CHANNEL) {
				if (account.lastlogin.getTime() + 20000 < new Date().getTime()) {
					state = MapleClient.LOGIN_NOTLOGGEDIN;
					this.updateLoginState(state, this.getSessionIp());
				}
			}
			if (state == MapleClient.LOGIN_LOGGEDIN) {
				this._loggedIn = true;
			} else {
				this._loggedIn = false;
			}
			return state;
		} catch (err) {}
	}

	////////////////////////////////////////////
	////////////////  ETC   ////////////////
	public async updateLoginState(state: number, sessionIp: string) {
		const r = await prisma.account.update({
			where: { id: this._accId },
			data: { loggedin: state, lastlogin: new Date() },
		});
	}

	////////////////////////////////////////////
	////////////////  Getter    ////////////////
	public getSession() {
		return this._csocket;
	}

	public getSessionIp() {
		return this._ip;
	}

	public canChat() {
		return !this._chatBlocked;
	}

	public getPlayer() {
		return this._player;
	}

	public getAccName() {
		return this._accName;
	}

	public getAccId() {
		return this._accId;
	}

	public getGender() {
		return this._gender;
	}

	public getChannel() {
		return this._channel;
	}

	public isGm() {
		return this._gm;
	}

	public getCharslots() {
		return this._charslots;
	}

	public isLoggedIn() {
		return this._loggedIn;
	}

	public getWorld() {
		return this._world;
	}

	////////////////////////////////////////////
	////////////////  Setter    ////////////////
	public setPlayer(char: MapleCharacter) {
		this._player = char;
	}

	public setChannel(channel: number) {
		this._channel = channel;
		if (channel == -10) {
			this._cs = true;
		}
	}

	public setAccName(name: string) {
		this._accName = name;
	}

	public setAccId(id: number) {
		this._accId = id;
	}

	public setLastPong(d: moment.Moment) {
		this._lastPong = d;
	}

	public setWord(w: number) {
		this._world = w;
	}

	public setCharslots(s: number) {
		this._charslots = s;
	}
}

export default MapleClient;
