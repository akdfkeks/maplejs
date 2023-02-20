import MapleClient from "@/src/client/Client";
import PacketHandler from "@/src/client/PacketHandler";
import net from "net";
import workerpool, { WorkerPool } from "workerpool";
import * as worker from "worker_threads";

class ChannelServerWorker {
	private count: number;
	private pool: WorkerPool;

	constructor(channelCount: number) {
		this.count = channelCount;
		this.pool = workerpool.pool({ minWorkers: this.count, workerType: "thread" });
		// this.pool = worker.Worker.po
	}

	public handle(client: MapleClient, data: Buffer) {
		this.pool.exec(this.temp, [client, data]);
	}

	private temp(client: MapleClient, data: Buffer) {
		// Buffer 를 복호화하여 PacketReader 생성
		const reader = client.getPacketReader(data);
		if (reader) {
			try {
				PacketHandler.handlePacket(client, reader);
			} catch (err) {
				console.log(err);
			}
		}
	}
}

export default ChannelServerWorker;
