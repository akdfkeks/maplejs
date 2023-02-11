import net from "net";
import MapleClient from "../client/Client";
import PacketHandlerManager from "../client/PacketHandler";
import Opcodes from "../packet/tools/Opcodes";
import { read } from "fs";

const ServerFactory = () => {
	const server = net.createServer();

	server.on("connection", async (socket) => {
		const client = new MapleClient(socket);

		socket.on("data", async (data) => {
			const reader = client.getPacketReader(data); //reader : 복호화된 Buffer 가 담긴 reader 객체

			if (reader) {
				try {
					const header_num = reader.readShort();
					const packetHandler = PacketHandlerManager.getHandler(header_num);

					// 로그인에 성공한 클라이언트 객체를 별도로 관리하다가
					// 로그아웃시에 destroy 하는 방법이 좋을듯 => session
					packetHandler(client, reader);
					console.log(reader.getBuffer());
				} catch (err) {
					console.log(err);
				}
			}
		});
	});

	server.on("error", (error) => {
		console.log(error);
		// process.exit(1);
	});

	return server;
};

export default ServerFactory;
