import MapleClient from "@/src/client/Client";
import LittleEndianPacketWriter from "@/src/packet/tools/NewPacketWriter";
import Opcodes from "@/src/packet/tools/Opcodes";
import { server } from "@/config.json";

class LoginPacket {
	private static version: string;

	static {
		let ret = 0;
		ret ^= 65 & 0x7fff;
		ret ^= 1 << 15;
		ret ^= (1 & 0xff) << 16;
		this.version = ret.toString();
	}

	public static getHello(sendIv: Uint8Array, recvIv: Uint8Array) {
		const packetSize = 13 + this.version.length;
		const packetMaker = new LittleEndianPacketWriter(packetSize);
		packetMaker.writeShort(packetSize);
		packetMaker.writeShort(291); // KMS Static
		packetMaker.writeMapleAsciiString(this.version);
		packetMaker.writeBytes(recvIv);
		packetMaker.writeBytes(sendIv);
		packetMaker.writeByte(1); // 1 = KMS, 2 = KMST, 7 = MSEA, 8 = GlobalMS, 5 = Test Server
		return packetMaker.getPacket();
	}

	public static getPing() {
		const packetMaker = new LittleEndianPacketWriter(2);
		packetMaker.writeOpcode(Opcodes.serverOpcodes.PING);
		return packetMaker.getPacket();
	}

	public static getLoginFailed(reason: number) {
		const packetMaker = new LittleEndianPacketWriter(16);
		packetMaker.writeOpcode(Opcodes.serverOpcodes.LOGIN_STATUS);
		packetMaker.writeByte(reason);
		if (reason == 7) packetMaker.writeZeroBytes(5); // Already logged in
		return packetMaker.getPacket();
	}

	public static getAuthSuccessRequest(client: MapleClient) {
		const packetMaker = new LittleEndianPacketWriter();
		packetMaker.writeOpcode(Opcodes.serverOpcodes.LOGIN_STATUS);
		packetMaker.writeByte(0);
		packetMaker.writeInt(client.account.id); // 계정 고유 ID
		packetMaker.writeByte(client.account.gender ? 1 : 0); // Male 1, Femail 0
		packetMaker.writeByte(client.account.gm > 0 ? 1 : 0); // Admin byte - Find, Trade, etc.
		packetMaker.writeByte(0);
		packetMaker.writeMapleAsciiString(client.account.name); // 계정 로그인 ID
		//additional info
		packetMaker.writeInt(0); // ?
		packetMaker.writeByte(0);
		packetMaker.writeByte(0);
		packetMaker.writeByte(0); // 채팅 금지 여부
		packetMaker.writeLong(0); // 채팅 금지 기간
		packetMaker.writeMapleAsciiString(""); //?
		packetMaker.writeMapleAsciiString(""); //?

		return packetMaker.getPacket();
	}

	public static deleteCharResponse() {
		console.log("Not yet");
	}

	public static secondPasswordResponse(op1: number, op2: number) {
		// Packet maker
		const pm = new LittleEndianPacketWriter(3);
		pm.writeOpcode(Opcodes.serverOpcodes.SECONDPW_ERROR);
		pm.writeByte(op1);
		pm.writeByte(op2);
		return pm.getPacket();
	}

	public static getServerList(serverId: number = 0, channelLoad?: Map<number, number>) {
		const pm = new LittleEndianPacketWriter();
		pm.writeOpcode(Opcodes.serverOpcodes.SERVERLIST);
		pm.writeByte(serverId); // 0: 스카니아, 1: 베라, 2: 브로아, 3: 카이니, 4: 제니스 5: 크로아, so on...
		pm.writeMapleAsciiString(`${server.name}`);
		pm.writeByte(1); // 서버 깃발 1: on, 0: off
		pm.writeMapleAsciiString(`${server.message.event}`); // 채널 이벤트 메세지
		pm.writeShort(100); // ??
		pm.writeShort(100); // ??
		pm.writeByte(1); // ??

		for (let i = 1; i <= 1; i++) {
			pm.writeMapleAsciiString(`${i == 1 ? "1" : i == 2 ? "20세이상" : (i - 1).toString()}`);
			pm.writeInt(100); // Server load ??
			pm.writeByte(i - 1); // World ID ??
			pm.writeShort(i - 1); // Channel number
		}
		pm.writeShort(1); // ??
		pm.writeShort(400); // ??
		pm.writeShort(300); // ??
		pm.writeMapleAsciiString(`${server.message.login}`); // 로그인 화면 메세지
		//pm.writeShort(0); //size: (short x, short y, string msg) ??
		//pm.writeInt(0); ??
		return pm.getPacket();
	}
}

export default LoginPacket;
