import MapleClient from "../client/Client";
import Opcodes from "../packet/tools/Opcodes";
import PacketReader from "../packet/tools/PacketReader";
import PacketWriter from "../packet/tools/PacketWriter";
import { getChannelServer } from "../server/WorldClient";

const CharacterSelectHandler = async (client: MapleClient, reader: PacketReader) => {
	const characterId = reader.readInt();

	const channel = await getChannelServer(client.channelId);

	const packet = new PacketWriter(Opcodes.serverOpcodes.SERVER_IP);
	packet.writeUShort(0);
	packet.writeUByte(127);
	packet.writeUByte(0);
	packet.writeUByte(0);
	packet.writeUByte(1);
	// packet.writeUByte(channel.ip.split(".")[0]); // 채널서버 아이피
	// packet.writeUByte(channel.ip.split(".")[1]);
	// packet.writeUByte(channel.ip.split(".")[2]);
	// packet.writeUByte(channel.ip.split(".")[3]);
	packet.writeUShort(channel.port); // 포트
	packet.writeUInt(characterId);
	packet.writeUByte(0);
	packet.writeUInt(0);
	client.sendPacket(packet);
};

export default CharacterSelectHandler;
