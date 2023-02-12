import MapleClient from "@/src/client/Client";
import PacketHandler from "@/src/client/PacketHandler";
import net from "net";

const CashshopServer = () => {
	const server = net.createServer().listen(8888);
	console.log("[Cashshop] Cashshop server on port 8888");

	server.on("connection", async (socket) => {
		const client = new MapleClient(socket, -10);

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

	server.on("error", (error) => {
		console.log(error);
		// process.exit(1);
	});

	return server;
};

export default CashshopServer;
