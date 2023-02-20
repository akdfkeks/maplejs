import MapleClient from "@/src/client/Client";
import LittleEndianPacketWriter from "@/src/packet/tools/NewPacketWriter";
import Opcodes from "@/src/packet/tools/Opcodes";
import { server } from "@/config.json";
import { MapleCharacter } from "@/src/client/MapleCharacter";
import PacketHelper from "./PacketHelper";
import fs from "fs";

/**
 * 적절한 패킷을 생성하고 전송하는 역할
 */
class LoginPacket {
	private static version: string;
	static {
		let ret = 0;
		ret ^= 65 & 0x7fff;
		ret ^= 1 << 15;
		ret ^= (1 & 0xff) << 16;
		this.version = ret.toString();
	}

	public static getHello(recvIv: Uint8Array, sendIv: Uint8Array) {
		const ps = 13 + "98369".length; // packect size
		const pm = new LittleEndianPacketWriter(1);
		pm.writeShort(ps);
		pm.writeShort(291); // KMS Static
		// pm.writeMapleAsciiString(this.version);
		pm.writeEuckrString("98369");
		pm.writeBytes(recvIv);
		pm.writeBytes(sendIv);
		pm.writeByte(1); // 1 = KMS, 2 = KMST, 7 = MSEA, 8 = GlobalMS, 5 = Test Server
		return pm.getPacket();
	}

	static addNewCharEntry(char: MapleCharacter, success: boolean) {
		const pm = new LittleEndianPacketWriter();
		pm.writeOpcode(Opcodes.serverOpcodes.ADD_NEW_CHAR_ENTRY);
		pm.writeByte(success ? 0 : 1); // 캐릭터 생성 성공: 0, 실패: 1
		this.addCharEntry(pm, char, false);

		fs.writeFileSync("hex.txt", pm.getPacket().toString("hex"));

		return pm.getPacket();
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
		/*	* 3: ID deleted or blocked
		 * 4: Incorrect password
		 * 5: Not a registered id
		 * 6: System error
		 * 7: Already logged in
		 * 8: System error
		 * 9: System error
		 * 10: Cannot process so many connections
		 * 11: Only users older than 20 can use this channel
		 * 13: Unable to log on as master at this ip
		 * 14: Wrong gateway or personal info and weird korean button
		 * 15: Processing request with that korean button!
		 * 16: Please verify your account through email...
		 * 17: Wrong gateway or personal info
		 * 21: Please verify your account through email...
		 * 23: License agreement
		 * 25: Maple Europe notice
		 * 27: Some weird full client notice, probably for trial versions
		 * 32: IP blocked
		 * 84: please revisit website for pass change --> 0x07 recv with response 00/01*/
	}

	public static getAuthSuccessRequest(client: MapleClient) {
		const packetMaker = new LittleEndianPacketWriter();
		packetMaker.writeOpcode(Opcodes.serverOpcodes.LOGIN_STATUS);
		packetMaker.writeByte(0);
		packetMaker.writeInt(client.getAccId()); // 계정 고유 ID
		packetMaker.writeByte(client.getGender() > 0 ? 1 : 0); // Male: 0, Female: 1
		packetMaker.writeByte(client.isGm() ? 1 : 0); // Admin byte - Find, Trade, etc.
		packetMaker.writeByte(0);
		packetMaker.writeMapleAsciiString(client.getAccName()); // 계정 로그인 ID

		//additional info
		packetMaker.writeInt(0); // ?
		packetMaker.writeByte(0);
		packetMaker.writeByte(0);
		packetMaker.writeByte(0); // 채팅 금지 여부 true: 1, false: 0
		packetMaker.writeLong(0); // 채팅 금지 기간
		packetMaker.writeMapleAsciiString(""); //?
		packetMaker.writeMapleAsciiString(""); //?

		return packetMaker.getPacket();
	}

	public static charNameResponse(name: string, available: boolean) {
		const pm = new LittleEndianPacketWriter();
		pm.writeOpcode(Opcodes.serverOpcodes.CHAR_NAME_RESPONSE);
		pm.writeMapleAsciiString(name);
		pm.writeByte(available ? 0 : 1); // 사용가능: 0, 불가능: 1
		return pm.getPacket();
	}

	public static deleteCharResponse() {
		// console.log("Not yet");
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

	public static getEndOfServerList() {
		const pm = new LittleEndianPacketWriter();
		pm.writeOpcode(Opcodes.serverOpcodes.SERVERLIST);
		pm.writeByte(-1); // End of packect
		return pm.getPacket();
	}

	/**
	 * 캐릭터 목록을 반환하는 패킷을 생성하는 메서드입니다.
	 * @param secondPw [임시] 2차 비밀번호 (구현 필요)
	 * @param characters 캐릭터 목록
	 * @param charSlot [임시] 캐릭터 슬롯 수 (이걸 캐릭터 수랑 같게 둬도 되나?)
	 */
	public static getCharList(secondPw: string, characters: Array<MapleCharacter>, charSlot: number) {
		const pm = new LittleEndianPacketWriter();

		pm.writeOpcode(Opcodes.serverOpcodes.CHARLIST);
		pm.writeByte(0); // ??
		pm.writeInt(0); // IDCODE2 ??
		pm.writeByte(characters.length);

		// [추정] 현재 각 캐릭터 객체에는 인벤토리 데이터가 적재되어 있지 않음
		// 이 코드가 돌기 전에 조회해서 넣어줘야함
		// 여기는 패킷 만들어주는 함수니까 밖에서 하자
		for (const char of characters) {
			this.addCharEntry(pm, char, false);
		}

		pm.writeByte(secondPw != null && secondPw.length > 0 ? 1 : 2); // 2차 비밀번호 1: 있음, 2: 없음
		pm.writeByte(0);
		pm.writeInt(charSlot); // 캐릭터 슬롯 수?

		return pm.getPacket();
	}

	/**
	 * 패킷에 캐릭터 정보를 작성합니다.
	 * @param pm PacketWritter Object
	 * @param char MapleCharater Object
	 * @param ranking 랭킹 표시 여부
	 */
	private static addCharEntry(pm: LittleEndianPacketWriter, char: MapleCharacter, ranking: boolean = false) {
		// 캐릭터 능력치 패킷 등록
		PacketHelper.addCharStats(pm, char);
		// 캐릭터 외형 패킷 등록
		PacketHelper.addCharLook(pm, char, true);

		// if(char.level < 30) {} 랭킹 관련...

		pm.writeByte(ranking ? 1 : 0); // ranking 1: true, 0: false
		// if(ranking){
		// 	pm.writeInt(char.rank)
		// 	pm.writeInt(char.rankMove)
		// 	pm.writeInt(char.jobRank)
		// 	pm.writeInt(char.jobRankMove)
		// }
	}
}

export default LoginPacket;
