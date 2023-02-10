import net from "net";
import MapleClient from "../client/Client";
import PacketHandler from "../packet/tools/PacketHandler";
import Opcodes from "../packet/tools/Opcodes";
import { read } from "fs";

const ServerFactory = () => {
	const server = net.createServer();

	server.on("connection", async (socket) => {
		const client = new MapleClient(socket);

		socket.on("data", async (data) => {
			const reader = client.getPacketReader(data); //reader : 복호화된 Buffer 가 담긴 객체

			if (reader) {
				try {
					const header_num = reader.readShort();
					const handler = PacketHandler.getHandler(header_num);

					handler(client, reader);
					// Buffer 출력용
					console.log(reader.getBuffer());
					return;
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
