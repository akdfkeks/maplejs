import MapleClient from "../client/Client";
import PacketReader from "../packet/tools/PacketReader";
import Opcodes from "../packet/tools/Opcodes";
import prisma from "../database/prisma";
import AccountPacketFactory from "../packet/factory/AccountPacket";

const LoginHandler = async (client: MapleClient, reader: PacketReader) => {
	const name = reader.readMapleAsciiString();
	const password = reader.readMapleAsciiString();
	console.log(name, password);

	// 아이디로 계정 조회
	const account = await prisma.account.findUnique({
		where: { name },
	});

	// 존재하지 않는 계정일때
	if (!account) client.sendPacket(AccountPacketFactory.getLoginFailed());
	// 벤, 채금, 비번 등등 체크
	if (true) {
	}

	client.account = account;

	// Auth success
	client.sendPacket(AccountPacketFactory.getLoginSucceeded(account));

	// Send server list
	client.sendPacket(AccountPacketFactory.getServerList());
	client.sendPacket(AccountPacketFactory.getEnd());
};

export default LoginHandler;
