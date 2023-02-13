import MapleClient from "../client/Client";
import LittleEndianPacketWriter from "../packet/tools/NewPacketWriter";
import Opcodes from "../packet/tools/Opcodes";

class MaplePacketCreator {
	public static getServerIP(client: MapleClient, port: number, clientId: number) {
		const pm = new LittleEndianPacketWriter();
		pm.writeOpcode(Opcodes.serverOpcodes.SERVER_IP);
		pm.writeShort(0);
		// console.log(client.ip);
		if (false) {
			for (const n of client.ip.split(",")) {
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
}

export default MaplePacketCreator;
