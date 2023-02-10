import net, { Socket } from "net";
import { world, server } from "@/config.json";

class WorldServer {
	private netServer = net.createServer();
	private port = server.world.port;
	private loginServer;
	private channelServers: Array<{ ip: string; port: number }> = server.world.channelServers;

	constructor() {
		this.createServer();
	}

	private createServer() {
		this.netServer.on("connection", async (socket: Socket) => {
			socket.on("data", async (data) => {
				const functionCall = data.toString();
				const result = eval("this." + functionCall);
				switch (typeof result) {
					case "object":
						socket.write(JSON.stringify(result));
						break;
					default:
						socket.write(result.toString());
				}
			});
		});

		this.netServer.on("error", (error) => {
			console.log(error);
			process.exit(1);
		});

		this.netServer.listen(this.port, () => {
			console.log(`[World] Server on port ${this.port}`);
		});
	}

	private getChannelServers() {
		return this.channelServers;
	}

	private getChannelAddress(channelId: number) {
		return this.channelServers[channelId];
	}

	private isChannelServerActive(channelId: number) {
		const worldClient = new net.Socket();

		try {
			worldClient.connect(server.world.port, server.world.host);
			console.log("ON");
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}
}

export default WorldServer;
