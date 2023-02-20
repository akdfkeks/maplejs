import LoginServer from "../handler/login/oLoginServer";
import * as WorkerPool from "workerpool";

class GeneralWorkerPool {
	// private _log = Logger
	private static _instance: GeneralWorkerPool;
	private static SCHEDULED_CORE_POOL_SIZE = 4;
	private _executor: any;
	private _scheduler: any;
	private _pcScheduler: any;
	private _pcSchedulerPoolSize = 1 + 5; // LoginServer.getUserLimit() / 20;

	private constructor() {
		this._executor = WorkerPool.pool();
	}

	public static getInstance() {
		if (this._instance == null) this._instance = new GeneralWorkerPool();
		return this._instance;
	}
}

export default GeneralWorkerPool;
