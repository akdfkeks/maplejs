import LittleEndianPacketWriter from "@/src/packet/tools/NewPacketWriter";
import MapleClient from "../../client/Client";
import Opcodes from "../../packet/tools/Opcodes";
import PacketReader from "../../packet/tools/PacketReader";
import { getChannelServer } from "../../server/WorldClient";

const CharacterSelectHandler = async (client: MapleClient, reader: PacketReader) => {
	const characterId = reader.readInt();
	const channel = await getChannelServer(client.channelId);

	// const packet = new PacketWriter(Opcodes.serverOpcodes.SERVER_IP);
	const pm = new LittleEndianPacketWriter(Opcodes.serverOpcodes.SERVER_IP);
	pm.writeShort(0);
	pm.writeByte(127);
	pm.writeByte(0);
	pm.writeByte(0);
	pm.writeByte(1);
	pm.writeByte(channel.port);

	pm.writeInt(characterId);
	pm.writeByte(0);
	pm.writeInt(0);
	client.sendPacket(pm.getPacket());
	// packet.writeUByte(channel.ip.split(".")[0]); // 채널서버 아이피
	// packet.writeUByte(channel.ip.split(".")[1]);
	// packet.writeUByte(channel.ip.split(".")[2]);
	// packet.writeUByte(channel.ip.split(".")[3]);
};

export default CharacterSelectHandler;
