import ServerProperties from "@/src/server/ServerProperty";
import net from "net";
import { log } from "console";
import MapleClient from "@/src/client/Client";
import PacketHandler from "@/src/client/PacketHandler";
import { cli } from "winston/lib/winston/config";
import Pair from "@/src/lib/Pair";

class LoginServer {
	public static instance: LoginServer = null;
	private static loginAuth = new Map<number, Pair<string, string>>();
	private static loginIpAuth = new Set<string>();
	private static DEFAULT_PORT = 8484;

	private server: net.Server = null;

	private constructor() {}

	public static getLoginAuth(charId: number) {
		const loginAuth = this.loginAuth.get(charId);
		this.loginAuth.delete(charId);
		// return loginAuth;
		//[임시]
		return new Pair<string, string>("127.0.0.1", "127.0.0.1");
	}

	public static putLoginAuth(charId: number, ip: string, tempIp: string) {
		this.loginAuth.set(charId, new Pair(ip, tempIp));
		this.loginIpAuth.add(ip);
	}

	public static getInstance() {
		if (this.instance == null) this.instance = new LoginServer();
		return this.instance;
	}

	// public close() {
	// 	this.shutdown = true;
	// 	this.servers.forEach((server, channel) => {
	// 		server.close();
	// 	});
	// 	this.finishedShutdown = true;
	// 	// DB 백업?
	// }

	// public allowConnection() {
	// 	if (this.openned == false) throw new Error("Server not openned");
	// 	this.servers.forEach((server) => {
	// 		server.on("connection", async (socket) => {
	// 			const client = new MapleClient(socket, 1);
	// 			socket.on("data", async (data) => {
	// 				// this.worker.handle(client, data); [임시] Worker Thread
	// 				const reader = client.getPacketReader(data);
	// 				if (reader) {
	// 					try {
	// 						PacketHandler.handlePacket(client, reader);
	// 					} catch (err) {
	// 						console.log(err);
	// 					}
	// 				}
	// 			});
	// 		});
	// 		server.on("close", () => console.log("서버가 종료됩니다"));
	// 		server.on("error", (err) => {
	// 			console.log(err);
	// 		});
	// 	});
	// }
}

export default LoginServer;
