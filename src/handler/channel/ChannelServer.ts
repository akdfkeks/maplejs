import ServerProperties from "@/src/server/ServerProperty";
import net from "net";
import { log } from "console";
import MapleClient from "@/src/client/Client";
import PacketHandler from "@/src/client/PacketHandler";
import ChannelServerWorker from "./ChannelServerWorker";
import { cli } from "winston/lib/winston/config";

class ChannelServer {
	public static serverStartTime: number;
	public static instance: ChannelServer = null;

	private static DEFAULT_PORT = 8585;

	private servers: Map<number, net.Server> = new Map();

	private expRate = 1;
	private mesoRate = 1;
	private dropRate = 1;
	private cashRate = 3;
	private traitRate = 3;
	private runningMerchantId = 0;
	private flags = 0;
	private serverMessage: string;
	private serverIp: string;
	private serverName: string;

	private openned = false;
	private shutdown = false;
	private finishedShutdown = false;

	private megaphoneMuteState = false;
	private adminOnly = false;

	private worker: ChannelServerWorker = null;
	// private playerStorage : PlayerStorage;
	// private mapFactory : MapleMapFactory ;
	// private  eventSM :EventScriptManager;

	private constructor() {}

	public static getInstance() {
		if (this.instance == null) this.instance = new ChannelServer();
		return this.instance;
	}

	/**
	 * 채널을 생성하고 포트를 개방합니다.
	 * @param count 생성할 채널 수
	 */
	public createChannel(count: number = 1) {
		if (count < 1 || count > 4) throw new Error("Out of range");

		this.worker = new ChannelServerWorker(count);

		for (let i = 0; i < count; i++) {
			const server = net.createServer().listen(ChannelServer.DEFAULT_PORT + i);
			this.servers.set(i + 1, server);
			console.log("[Channel] Channel server on port " + (ChannelServer.DEFAULT_PORT + i));
		}
		this.openned = true;
	}

	public close() {
		this.shutdown = true;
		this.servers.forEach((server, channel) => {
			server.close();
		});
		this.finishedShutdown = true;
		// DB 백업?
	}

	public allowConnection() {
		if (this.openned == false) throw new Error("Server not openned");
		this.servers.forEach((server) => {
			server.on("connection", async (socket) => {
				const client = new MapleClient(socket, 1);
				socket.on("data", async (data) => {
					// this.worker.handle(client, data); [임시] Worker Thread
					const reader = client.getPacketReader(data);
					if (reader) {
						try {
							PacketHandler.handlePacket(client, reader);
						} catch (err) {
							console.log(err);
						}
					}
				});
			});
			server.on("close", () => console.log("서버가 종료됩니다"));
			server.on("error", (err) => {
				console.log(err);
			});
		});
	}
}

export default ChannelServer;

// class ChannelServer {
// 	public static serverStartTime: number;
// 	private static DEFAULT_PORT = 8585;
// 	private expRate = 1;
// 	private mesoRate = 1;
// 	private dropRate = 1;
// 	private cashRate = 3;
// 	private traitRate = 3;
// 	private port = ChannelServer.DEFAULT_PORT;
// 	private channelCount = 0;
// 	private worker: ChannelServerWorker = null;
// 	private runningMerchantId = 0;
// 	private flags = 0;
// 	private serverMessage: string;
// 	private serverIp: string;
// 	private serverName: string;

// 	private shutdown = false;
// 	private finishedShutdown = false;
// 	private megaphoneMuteState = false;
// 	private adminOnly = false;

// 	// private playerStorage : PlayerStorage;
// 	// private mapFactory : MapleMapFactory ;
// 	// private  eventSM :EventScriptManager;

// 	private static instances = new Map<number, ChannelServer>();
// 	// private mapleSquads = new ConcurrentEnumMap<MapleSquadType, MapleSquad>(MapleSquadType.class);
// 	// private  merchants = new Map<number, HiredMerchant>();
// 	// private playerNPCs = new List<PlayerNPC>();
// 	// private ReentrantReadWriteLock merchLock = new ReentrantReadWriteLock(); //merchant
// 	// private int eventmap = -1;
// 	// private Map<MapleEventType, MapleEvent> events = new EnumMap<MapleEventType, MapleEvent>(MapleEventType.class);

// 	private constructor(count: number) {
// 		this.channelCount = count;
// 		// this.mapFactory = new MapleMapFactory(channel)
// 	}

// 	public static getOnlineConnections() {
// 		let con = 0;
// 		// for (const cs of ChannelServer.getAllInstance()) {
// 		// 	// con += cs.getConnetedClients(); [임시]
// 		// }
// 		return con;
// 	}

// 	// public loadEvents(){
// 	// 	if(this.ev)
// 	// }

// 	public run_startup_configurations() {
// 		print(`Channel Server ${this.channelCount} Initializing.. Retriving Login Server properties..`);
// 		this.setChannel(this.channelCount); // instances.put
// 		try {
// 			this.expRate = ServerProperties.get("world.exp");
// 			this.mesoRate = ServerProperties.get("world.meso");
// 			this.serverMessage = ServerProperties.get("world.serverMessage");
// 			this.serverName = ServerProperties.get("login.serverName");
// 			this.flags = ServerProperties.get("world.flags");
// 			this.adminOnly = ServerProperties.get("world.adminOnly");
// 			// [임시] 파티퀘스트 등 다 이벤트로 취급하므로 나중에 만들기
// 			// this.eventSM = new EventScriptManager(this, ServerProperties.get("channel.events"));
// 			this.port = ServerProperties.get("channel.net.port");
// 			this.serverIp = ServerProperties.get("channel.net.interface") + ":" + this.port;
// 		} catch (err) {
// 			throw new Error(err);
// 		}
// 		print("OK!\n");
// 		println(":: Channel Server " + this.channelCount + " Information ::");
// 		println("ServerName        " + this.serverName);
// 		println("ServerMessage     " + this.serverMessage);
// 		println("ExpRate           " + this.expRate);
// 		println("MesoRate          " + this.mesoRate);

// 		// [임시] Worker Thread 생성
// 		this.worker = new ChannelServerWorker(this.channelCount);
// 		this.openChannels(1);
// 	}

// 	private openChannels(count: number) {}

// 	public setChannel(c: number) {
// 		ChannelServer.instances.set(c, this);
// 		// LoginServer.addChannel(c);
// 	}
// }

// export default ChannelServer;

// const print = (s: string) => process.stdout.write(s);
// const println = (s: string) => process.stdout.write(s + "\n");
