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

// 초기 iv(Initialization vector)값. 랜덤이어도 상관없을듯?
const initialIvReceive = new Uint8Array([0x65, 0x56, 0x12, 0xfd]);
const initialIvSend = new Uint8Array([0x2f, 0xa3, 0x65, 0x43]);

class MapleClient {
	createdChar(charId: number) {
		// allowedChar.add(id) // 접속 허용 목록 같은건가?
	}
	public static LOGIN_NOTLOGGEDIN = 0;
	public static LOGIN_SERVER_TRANSITION = 1;
	public static LOGIN_LOGGEDIN = 2;
	public static CHANGE_CHANNEL = 3;

	public static DEFAULT_CHARSLOT = 3;
	public static CLIENT_KEY = "CLIENT";

	private player: MapleCharacter; // 임시

	private channel: number = 1;

	private world: number;
	private birthday: number;

	public charslots = MapleClient.DEFAULT_CHARSLOT;

	private loggedIn: boolean = false;
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

	// DB Account 객체
	// public account: Account;

	// 패킷암호화
	private inputStream: PacketCrypto;
	private outputStream: PacketCrypto;

	// 핑퐁
	private pingpongTask: NodeJS.Timeout;
	public lastPing: moment.Moment | undefined;
	public lastPong: moment.Moment | undefined;

	// 접속중인 월드/채널 정보
	public worldId: number | undefined;
	public channelId: number;
	public ipv4: string;

	// MapleClient Constructor
	constructor(socket: Socket, channelId = 1) {
		this.socket = socket;
		this.ipv4 = this.socket.remoteAddress;
		// this.channelId = channelId; // 우선 기본 1채널만 개발

		this.inputStream = new PacketCrypto(initialIvReceive, 65);
		this.outputStream = new PacketCrypto(initialIvSend, 0xffff - 65);
		this.sendHandshake();

		// 핑퐁 타이머
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
			const account = await prisma.account.findUnique({
				where: {
					name,
				},
			});
			if (!account) loginOk = 5;

			this.accName = account.name;
			this.accId = account.id;
			this.gm = account.gm;
			this.gender = account.gender;
			this.loggedIn = true;
			loginOk = this.loggedIn ? 0 : 4;
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
		const header = this.outputStream.getPacketHeader(packet.length);
		this.socket.write(header);

		const encryptedData = this.outputStream.encrypt(packet);
		this.socket.write(encryptedData);
	}

	// 핸드쉐이크 전송 (in constructor)
	private sendHandshake(): void {
		const packet = new PacketWriter();
		packet.writeShort(13 + "98369".length);
		packet.writeShort(291);
		packet.writeString("98369");
		packet.writeBytes(initialIvReceive);
		packet.writeBytes(initialIvSend);
		packet.writeByte(1);
		this.socket.write(packet.getBuffer());
	}

	/**
	 * 캐릭터를 조회하여 Array[MapleCharacter] 를 반환합니다
	 * 반환된 목록은 어디선가 쓰입니다
	 */
	public async loadCharacters(serverId: number) {
		let charSlot: Array<MapleCharacter> = [];

		// 캐릭터의 기본 정보를 조회합니다. 굳이 두번으로 나눌 필요가 있을까?
		const rowChars = await this.loadCharactersInternal(serverId);
		/**
		 * 기본 정보를 통해 게임에 필요한 모든 정보를 로딩합니다.
		 * 조회한 데이터를 통해 인게임에 필요한 모든 정보를 담은 MapleCharacter 객체를 생성합니다.
		 * 매우매우매우 중요한 부분입니다.
		 */
		for (const cni of rowChars) {
			const c = await MapleCharacter.loadCharFromDB(this, cni.id, false);
			charSlot.push(c);
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
