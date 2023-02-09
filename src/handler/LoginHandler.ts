import Client from "../client/client";
import PacketReader from "../packet/PacketReader";
import PacketWriter from "../packet/PacketWriter";
import Opcodes from "../packet/Opcodes";
import prisma from "../database/prisma";

const LoginHandler = async (client: Client, reader: PacketReader) => {
	const name = reader.readString();
	const password = reader.readString();

	// 아이디로 조회
	const account = await prisma.account.findUnique({
		where: { name },
	});
	console.log(name, password);

	// 계정 미존재
	if (!account) {
		const packet = new PacketWriter(Opcodes.serverOpcodes.LOGIN_STATUS);
		packet.writeByte(5);
		return client.sendPacket(packet);
	}

	client.account = account;
	// client.account.setClient(client);

	// auth success
	const packet = new PacketWriter(Opcodes.serverOpcodes.LOGIN_STATUS);
	packet.writeByte(0);
	packet.writeInt(account.id); // Client Account Id
	packet.writeByte(account.gender ? 1 : 0); // Gender 1 or 0
	packet.writeByte(account.gm > 0 ? 1 : 0); // IsGm 1 or 0
	packet.writeByte(0);
	packet.writeString(account.name); // account name
	packet.writeInt(0);
	packet.writeByte(0);
	packet.writeByte(0);
	packet.writeByte(0); // chat block 1 or 0
	packet.writeLong(116445060000000000n); // chat block time until
	packet.writeString("");
	packet.writeString("");
	client.sendPacket(packet);

	// server list
	const packet2 = new PacketWriter(Opcodes.serverOpcodes.SERVERLIST);
	packet2.writeByte(1); // 0: 스카니아, 1: 베라, 2: 브로아, 3: 카이니, 4: 제니스 5: 크로아, so on...
	packet2.writeString("WhiteJS"); // Server Name
	packet2.writeByte(1); // world flag
	packet2.writeString("[Temp] Login UI Message"); // event message
	packet2.writeShort(100);
	packet2.writeShort(100);
	packet2.writeByte(1);

	for (let i = 1; i <= 2; i++) {
		// 각 채널
		packet2.writeString("WhiteJS" + i); // world-channel (2챈-20세이상)
		packet2.writeInt(100); // serverload
		packet2.writeByte(0); // world id
		packet2.writeShort(i - 1); // channel - 1
	}
	packet2.writeShort(1);
	packet2.writeShort(400);
	packet2.writeShort(300);
	packet2.writeString("[Temp] Login Message");
	client.sendPacket(packet2);

	// end of server list
	const packet3 = new PacketWriter(Opcodes.serverOpcodes.SERVERLIST);
	packet3.writeByte(-1);
	client.sendPacket(packet3);
};

export default LoginHandler;
