import MapleLifeFactory from "@/src/server/life/MapleLifeFactory";
import MapleQuest from "@/src/server/quest/MapleQuest";

class MapleQuestStatus {
	private _quest: MapleQuest;
	private _status: number;
	private _killedMobs: Map<number, number> = null;
	private _npc: number;
	private _completionTime: bigint;
	private _forfeited: number = 0;
	private _customData: string;

	/** Creates a new instance of MapleQuestStatus */
	constructor(quest: MapleQuest, status: number) {
		this._quest = quest;
		this.setStatus(status);
		this._completionTime = BigInt(new Date().getTime());
		if (status == 1) {
			// Started
			if (!(quest.getRelevantMobs().size == 0)) {
				this.registerMobs();
			}
		}
	}

	public MapleQuestStatus(quest: MapleQuest, status: number, npc: number) {
		this._quest = quest;
		this.setStatus(status);
		this.setNpc(npc);
		this._completionTime = BigInt(new Date().getTime());
		if (status == 1) {
			// Started
			if (!(quest.getRelevantMobs().size == 0)) {
				this.registerMobs();
			}
		}
	}

	public setQuest(qid: number) {
		this._quest = MapleQuest.getInstance(qid);
	}

	public getQuest() {
		return this._quest;
	}

	public getStatus() {
		return this._status;
	}

	public setStatus(status: number) {
		this._status = status;
	}

	public getNpc() {
		return this._npc;
	}

	public setNpc(npc: number) {
		this._npc = npc;
	}

	public isCustom() {
		// return GameConstants.isCustomQuest(quest.getId()); [임시]
		return false;
	}

	private registerMobs() {
		this._killedMobs = new Map<number, number>();
		for (const i of this._quest.getRelevantMobs().keys()) {
			this._killedMobs.set(i, 0);
		}
	}

	private maxMob(mobid: number) {
		for (const qs of this._quest.getRelevantMobs().entries()) {
			if (qs[0] == mobid) {
				return qs[1];
			}
		}
		return 0;
	}

	public mobKilled( id:number, skillID:number) {
			if (this._quest != null && this._quest.getSkillID() > 0) {
					if (this._quest.getSkillID() != skillID) {
							return false;
					}
			}
			 const mob = this._killedMobs.get(id);
			if (mob != null) {
					 const mo = this.maxMob(id);
					if (mob >= mo) {
							return false; //nothing happened
					}
					this._killedMobs.set(id, (mob+1) > mo ? mo : (mob+1));
					return true;
			}
			for (const mo of this._killedMobs.entries()) {
					if (this.questCount(mo[0], id)) {
							 const mobb = this.maxMob(mo[0]);
							if (mo[1] >= mobb) {
									return false; //nothing
							}
							// this._killedMobs.set(mo[0], Math.min(mo.getValue() + 1, mobb));
							this._killedMobs.set(mo[0], (mo[1] + 1)>mobb?mobb:(mo[1] + 1));
							return true;
					}
			} //i doubt this
			return false;
	}

	private questCount( mo:number,  id:number) {
			if (MapleLifeFactory.getQuestCount(mo) != null) {
					for (const i of MapleLifeFactory.getQuestCount(mo)) {
							if (i == id) {
									return true;
							}
					}
			}
			return false;
	}

	public  void setMobKills( int id,  int count) {
			if (killedMobs == null) {
					registerMobs(); //lol
			}
			killedMobs.put(id, count);
	}

	public  boolean hasMobKills() {
			if (killedMobs == null) {
					return false;
			}
			return killedMobs.size() > 0;
	}

	public  int getMobKills( int id) {
			 number mob = killedMobs.get(id);
			if (mob == null) {
					return 0;
			}
			return mob;
	}

	public  Map<number, number> getMobKills() {
			return killedMobs;
	}

	public  long getCompletionTime() {
			return completionTime;
	}

	public  void setCompletionTime( long completionTime) {
			this.completionTime = completionTime;
	}

	public  int getForfeited() {
			return forfeited;
	}

	public  void setForfeited( int forfeited) {
			if (forfeited >= this.forfeited) {
					this.forfeited = forfeited;
			} else {
					throw new IllegalArgumentException("Can't set forfeits to something lower than before.");
			}
	}

	public  void setCustomData( String customData) {
			this.customData = customData;
	}

	public  String getCustomData() {
			return customData;
	}
}


export default MapleQuestStatus