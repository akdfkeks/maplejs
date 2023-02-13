import moment from "moment-timezone";
import { Socket } from "net";

import PacketCrypto from "../packet/tools/PacketCrypto";
import PacketReader from "../packet/tools/PacketReader";
import PacketWriter from "../packet/tools/PacketWriter";
import Opcodes from "../packet/tools/Opcodes";
import { Account as PAccount } from "@prisma/client";
import { Account } from "../database/model/Account";
import { MapleCharacter } from "./MapleCharacter";
import Queue from "queue";
import { buffer } from "stream/consumers";
import prisma from "../database/prisma";
import LoginPacket from "../tools/packet/LoginPacket";

// 초기 iv(Initialization vector)값. 랜덤이어도 상관없을듯?
const ivRecv = new Uint8Array([0x65, 0x56, 0x12, 0xfd]);
const ivSend = new Uint8Array([0x2f, 0xa3, 0x65, 0x43]);

// Socket 을 통해 connection 이 생성되면 각 커넥션마다 생성되는 Client 객체
class MapleClient {
	createdChar(charId: number) {} // allowedChar.add(id) // 접속 허용 목록 같은건가?

	public static LOGIN_NOTLOGGEDIN = 0;
	public static LOGIN_SERVER_TRANSITION = 1;
	public static LOGIN_LOGGEDIN = 2;
	public static CHANGE_CHANNEL = 3;

	public static DEFAULT_CHARSLOT = 6;
	public static CLIENT_KEY = "CLIENT";

	private player: MapleCharacter; // 임시

	public channel: number = 1;

	private world: number;
	private birthday: number;

	public charslots = MapleClient.DEFAULT_CHARSLOT;

	public loggedIn: boolean = false;
	private serverTransition: boolean = false;

	// private tempban : Calendar = null;
	public accId: number = -1;
	public accName: string;

	private lastDLLWatch: number = 0;
	private lastHashWatch: number = 0;

	private monitored: boolean = false;
	private receiving: boolean = true;

	public gm: number = 0;

	private greason: number = 1;
	public gender: number = -1;

	private loginAttempt: number = 0;

	public myCodeHash = "";

	private packetQueue = new Queue();

	private socket: Socket;

	// 패킷암호화
	private inputStream: PacketCrypto;
	private outputStream: PacketCrypto;

	// 핑퐁
	private pingpongTask: NodeJS.Timeout;
	public lastPing: moment.Moment | undefined;
	public lastPong: moment.Moment | undefined;

	// 접속중인 월드/채널 정보
	public worldId: number | undefined;
	public ip: string;

	public cashShop: boolean = false;

	// MapleClient 생성자
	constructor(socket: Socket, channel: number) {
		this.socket = socket;
		this.ip = this.socket.remoteAddress;

		this.inputStream = new PacketCrypto(ivRecv, 65);
		this.outputStream = new PacketCrypto(ivSend, 0xffff - 65);

		this.channel = channel;
		if (channel == -10) this.cashShop = true;

		// 추후 일괄적인 관리를 위해 Custom session 있으면 좋을듯
		// this.session = new MapleSession(this)

		this.run();
	}

	// 가독성을 위해 분리...
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
		this.socket.write(hello); // 주의: sendPacket 으로 보내면 안됨
	}

	private startPingPong() {
		this.pingpongTask = setInterval(() => {
			const pingPacket = new PacketWriter(Opcodes.serverOpcodes.PING);
			this.sendPacket(pingPacket.getBuffer());
			this.lastPing = moment();
		}, 10000);
	}

	public async login(name: string, pw: string) {
		let loginOk = 5;

		// 벤, 채금, 비번 등등 체크
		if (true) {
		}

		try {
			const account = await prisma.account.findUnique({ where: { name } });
			if (!account) loginOk = 5;
			else {
				this.accName = account.name;
				this.accId = account.id;
				this.gm = account.gm;
				this.gender = account.gender;
				this.loggedIn = true;
				loginOk = this.loggedIn ? 0 : 4;
			}
		} catch (err) {
			console.log(err);
			loginOk = 6;
		} finally {
		}
		return loginOk;
	}

	public getPacketReader(packet: Buffer) {
		return this.readPacket(packet);
	}
	// 패킷 수신후 복호화하여 Reader 객체로 리턴
	private readPacket(packet: Buffer) {
		if (packet.length === 0) return null;

		const headerLength = 4; // 4 bytes
		const payloadLength = packet.length - headerLength;

		if (payloadLength < 1) return null;

		const block = packet.slice(headerLength); // 헤더를 제외한 나머지
		const payload = this.inputStream.decrypt(block);

		return new PacketReader(payload);
	}

	// Writer 객체로 된 패킷을 정렬해서 전송
	public sendPacket(packet: Buffer): void {
		// console.log("[SEND]");
		// console.log(packet);
		const header = this.outputStream.getPacketHeader(packet.length);
		this.socket.write(header);

		const encryptedData = this.outputStream.encrypt(packet);
		this.socket.write(encryptedData);
	}

	// 핸드쉐이크 전송 (in constructor)

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

	private async loadCharactersInternal(serverId: number) {
		const chars = await prisma.character.findMany({
			where: {
				world: serverId,
				account_id: this.accId,
			},
			select: {
				id: true,
				name: true,
				gm: true,
			},
		});
		return chars;
	}

	public getSession() {
		return this.socket;
	}
}

export default MapleClient;
