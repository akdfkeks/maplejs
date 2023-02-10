import { Account } from "@prisma/client";
import MapleClient from "../../client/Client";
import Opcodes from "../tools/Opcodes";
import PacketWriter from "../tools/PacketWriter";
import config from "@/config.json";

export default class AccountPacketFactory {
	private static version: string;

	static {
		let ret = 0;
		ret ^= 65 & 0x7fff;
		ret ^= 1 << 15;
		ret ^= (1 & 0xff) << 16;
		this.version = ret.toString();
	}

	public static sendHello(): void {}

	public static getLoginFailed() {
		const packet = new PacketWriter(Opcodes.serverOpcodes.LOGIN_STATUS);
		packet.writeByte(5);
		return packet;
	}

	public static getLoginSucceeded(account: Account) {
		const packet = new PacketWriter(Opcodes.serverOpcodes.LOGIN_STATUS);

		// Basic info
		packet.writeByte(0);
		packet.writeInt(account.id); // Account Id
		packet.writeByte(account.gender ? 1 : 0); // Gender 1 or 0
		packet.writeByte(account.gm > 0 ? 1 : 0); // IsGm 1 or 0
		packet.writeByte(0);
		packet.writeString(account.name); // Account name

		// additional
		packet.writeInt(0); // ?
		packet.writeByte(0);
		packet.writeByte(0);
		packet.writeByte(0); // chat block(mute) 1 or 0
		packet.writeLong(0); // chat block time until
		packet.writeString(""); // ?
		packet.writeString(""); // ?

		return packet;
	}

	public static getNameAvailability(name: string, flag: boolean) {
		const packet = new PacketWriter(Opcodes.serverOpcodes.CHAR_NAME_RESPONSE);
		packet.writeString(name);
		packet.writeByte(flag ? 0 : 1);
		return packet;
	}

	public static getServerList() {
		// server list
		const packet = new PacketWriter(Opcodes.serverOpcodes.SERVERLIST);
		packet.writeByte(1); // 0: 스카니아, 1: 베라, 2: 브로아, 3: 카이니, 4: 제니스 5: 크로아, so on...
		packet.writeString(`${config.server.name}`); // Server Name
		packet.writeByte(1); // world flag
		packet.writeString(`${config.server.message.event}`); // 채널 이름 옆에 띄워지는 Event Msg
		packet.writeShort(100);
		packet.writeShort(100);
		packet.writeByte(1);

		// 채널 두개 이상이면 오류, 원인 모름
		for (let i = 1; i <= 1; i++) {
			packet.writeString(`${config.server.name}-` + i); // world-channel (2챈-20세이상)
			packet.writeInt(100); // serverload
			packet.writeByte(i - 1); // world id
			packet.writeShort(i - 1); // channel - 1
		}
		packet.writeShort(1);
		packet.writeShort(400);
		packet.writeShort(300);
		packet.writeString(`${config.server.message.login}`);
		return packet;
	}

	public static getEnd() {
		// end of server list
		const packet3 = new PacketWriter(Opcodes.serverOpcodes.SERVERLIST);
		packet3.writeByte(-1);
		return packet3;
	}
}
