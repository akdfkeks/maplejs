import MapleClient from "../client/Client";
import { MapleCharacter } from "../client/MapleCharacter";
import LittleEndianPacketWriter from "../packet/tools/NewPacketWriter";
import Opcodes from "../packet/tools/Opcodes";
import PacketHelper from "./packet/PacketHelper";
import moment from "moment";

class MaplePacketCreator {
	public static getServerIP(client: MapleClient, port: number, clientId: number) {
		const pm = new LittleEndianPacketWriter();
		pm.writeOpcode(Opcodes.serverOpcodes.SERVER_IP);
		pm.writeShort(0);
		// console.log(client.ip);
		if (false) {
			for (const n of client.getSessionIp().split(",")) {
				pm.writeByte(parseInt(n));
			}
		} else {
			pm.writeByte(127);
			pm.writeByte(0);
			pm.writeByte(0);
			pm.writeByte(1);
		}
		pm.writeShort(port);
		pm.writeInt(clientId);
		pm.writeByte(0); // ??
		pm.writeInt(0);

		return pm.getPacket();
	}

	public static getCharInfo(char: MapleCharacter) {
		const pm = new LittleEndianPacketWriter();
		pm.writeOpcode(Opcodes.serverOpcodes.WARP_TO_MAP);
		pm.writeInt(char.client.getChannel() - 1);
		pm.writeByte(0);
		pm.writeByte(1); // first time <- 무슨뜻?

		if (false) {
			// 이벤트 관련 코드가 들어가는거 같은데
		} else {
			pm.writeShort(0);
		}

		char.getRandomStream1().connectData(pm);

		PacketHelper.addCharacterInfo(pm, char);
		pm.writeLong(PacketHelper.getTime(moment().valueOf()));
		return pm.getPacket();
	}

	public static serverNotice(type: number, message: string) {
		return this.serverMessage(type, 0, message, false);
	}

	private static serverMessage(type: number, channel: number, message: string, megaEar: boolean) {
		const pm = new LittleEndianPacketWriter();
		/*	* 0: [Notice]<br>
		 * 1: Popup<br>
		 * 2: Megaphone<br>
		 * 3: Super Megaphone<br>
		 * 4: Scrolling message at top<br>
		 * 5: Pink Text<br>
		 * 6: Lightblue Text
		 * 8: Item megaphone
		 * 9: Heart megaphone
		 * 10: Skull Super megaphone
		 * 11: Green megaphone message?
		 * 12: Three line of megaphone text
		 * 13: End of file =.="
		 * 14: Ani msg
		 * 15: Red Gachapon box
		 * 18: Blue Notice (again)*/
		pm.writeOpcode(Opcodes.serverOpcodes.SERVERMESSAGE);
		pm.writeByte(type);
		if (type == 4) pm.writeByte(1);
		pm.writeMapleAsciiString(message);
		switch (type) {
			case 3:
			case 6:
			case 9:
			case 10:
				pm.writeByte(channel - 1);
				pm.writeByte(megaEar ? 1 : 0);
				break;
			case 18:
				pm.writeInt(channel >= 1000000 && channel < 6000000 ? channel : 0);
		}
		return pm.getPacket();
	}
}

export default MaplePacketCreator;
