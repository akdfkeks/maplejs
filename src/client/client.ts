import moment from "moment-timezone";
import { Socket } from "net";

import PacketCrypto from "../packet/tools/PacketCrypto";
import PacketReader from "../packet/tools/PacketReader";
import PacketWriter from "../packet/tools/PacketWriter";
import Opcodes from "../packet/tools/Opcodes";
import { Account as PAccount } from "@prisma/client";
import { Account } from "../database/model/Account";

// 초기 iv(Initialization vector)값. 랜덤이어도 상관없을듯?
const initialIvReceive = new Uint8Array([0x65, 0x56, 0x12, 0xfd]);
const initialIvSend = new Uint8Array([0x2f, 0xa3, 0x65, 0x43]);

class Client {
	private socket: Socket;

	// DB Account 객체
	public account: Account;

	// 패킷암호화
	private receiveCrypto: PacketCrypto;
	private sendCrypto: PacketCrypto;

	// 핑퐁
	private pingpongTask: NodeJS.Timeout;
	public lastPing: moment.Moment | undefined;
	public lastPong: moment.Moment | undefined;

	// 접속중인 월드/채널 정보
	public worldId: number | undefined;
	public channelId: number;

	// 생성자
	constructor(socket: Socket, channelId = -1) {
		this.socket = socket;
		this.channelId = channelId;
		this.receiveCrypto = new PacketCrypto(initialIvReceive, 65);
		this.sendCrypto = new PacketCrypto(initialIvSend, 0xffff - 65);
		console.log(`Connection from (${socket.remoteAddress}:${socket.remotePort})`);
		this.sendHandshake();

		// 핑퐁 타이머
		this.pingpongTask = setInterval(() => {
			const pingPacket = new PacketWriter(Opcodes.serverOpcodes.PING);
			this.sendPacket(pingPacket);
			this.lastPing = moment();
		}, 10000);
	}

	// 패킷 수신후 복호화하여 Reader 객체로 리턴
	public readPacket(packet: Buffer): PacketReader | null {
		if (packet.length === 0) return null;

		const headerLength = 4;
		const packetLength = packet.length - headerLength;

		if (packetLength === 0) return null;

		const block = packet.slice(headerLength); // 헤더를 제외한 나머지 패킷

		const payload = this.receiveCrypto.decrypt(block);

		console.log(`[RECV] ${payload.toString("hex")}\n${payload.toString()}`);

		return new PacketReader(payload);
	}

	// Writer 객체로 된 패킷을 정렬해서 전송
	public sendPacket(packet: PacketWriter): void {
		const header = this.sendCrypto.getPacketHeader(packet.getBuffer().length);
		this.socket.write(header);

		const data = packet.getBuffer();
		console.log(`[SEND] ${data.toString("hex")}\n${data.toString()}`);
		// console.log(`[SEND] ${data.toString("utf8")}\n${data.toString()}`);

		const encryptedData = this.sendCrypto.encrypt(data);
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
}

export default Client;
