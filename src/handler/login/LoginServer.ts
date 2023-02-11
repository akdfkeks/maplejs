import MapleClient from "@/src/client/Client";
import PacketHandlerManager from "@/src/client/PacketHandler";
import net from "net";

const LoginServer = () => {
	const server = net.createServer().listen(8484);
	console.log("[Login] Login server on port 8484");

	server.on("connection", async (socket) => {
		const client = new MapleClient(socket, -1);

		socket.on("data", async (data) => {
			const reader = client.getPacketReader(data); //reader : 복호화된 Buffer 가 담긴 reader 객체

			if (reader) {
				try {
					const header_num = reader.readShort();
					const packetHandler = PacketHandlerManager.getHandler(header_num);

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

export default LoginServer;
