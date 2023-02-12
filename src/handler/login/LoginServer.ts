import MapleClient from "@/src/client/Client";
import PacketHandler from "@/src/client/PacketHandler";
import net from "net";

const LoginServer = () => {
	const server = net.createServer().listen(8484);
	console.log("[Login] Login server on port 8484");

	server.on("connection", async (socket) => {
		const client = new MapleClient(socket, -1);

		socket.on("data", async (data) => {
			const reader = client.getPacketReader(data);

			if (reader) {
				try {
					// reader 는 클라이언트 안에 있는데 굳이?
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

export default LoginServer;
