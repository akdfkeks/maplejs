import MapleClient from "@/src/client/Client";
import PacketHandler from "@/src/client/PacketHandler";
import net from "net";

const ChannelServer = (port: number) => {
	const server = net.createServer().listen(port);
	console.log("[Channel] Channel server on port " + port);

	server.on("connection", async (socket) => {
		const client = new MapleClient(socket, 1);

		// 원본팩의 while() readPacket
		socket.on("data", async (data) => {
			const reader = client.getPacketReader(data); //reader : 복호화된 Buffer 가 담긴 reader 객체

			if (reader) {
				try {
					PacketHandler.handlePacket(client, reader);
				} catch (err) {
					console.log(err);
				}
			}
		});
	});

	server.on("close", () => {
		// DB 백업?
	});

	server.on("error", (error) => {
		console.log(error);
		// process.exit(1);
	});

	return server;
};

export default ChannelServer;
