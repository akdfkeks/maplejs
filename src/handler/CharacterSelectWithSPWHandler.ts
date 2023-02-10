import MapleClient from "../client/Client";
import Opcodes from "../packet/tools/Opcodes";
import PacketReader from "../packet/tools/PacketReader";
import PacketWriter from "../packet/tools/PacketWriter";
import { getChannelServer } from "../server/WorldClient";

const CharacterSelectWithSPWHandler = async (client: MapleClient, reader: PacketReader) => {
	const password = reader.readMapleAsciiString();
	const characterId = reader.readInt();

	const channel = await getChannelServer(client.channelId);
	if (true) {
		//비밀번호 일치 시
		const packet = new PacketWriter(Opcodes.serverOpcodes.SERVER_IP);
		packet.writeUShort(0);
		packet.writeUByte(127);
		packet.writeUByte(0);
		packet.writeUByte(0);
		packet.writeUByte(1);
		packet.writeUShort(channel.port); // 포트
		packet.writeUInt(characterId);
		packet.writeUByte(0);
		packet.writeUInt(0);

		client.sendPacket(packet);
	} else {
		console.log("is it run?");
		const packet = new PacketWriter(Opcodes.serverOpcodes.SECONDPW_ERROR);
		packet.writeByte(1);
		packet.writeByte(0x14);
		client.sendPacket(packet);
	}
};

export default CharacterSelectWithSPWHandler;
