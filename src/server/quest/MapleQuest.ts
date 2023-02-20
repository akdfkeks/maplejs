import { MapleCharacter } from "@/src/client/MapleCharacter";
import prisma from "@/src/database/prisma";
import Pair from "@/src/lib/Pair";
import MaplePacketCreator from "@/src/tools/MaplePacketCreator";
import { MapleQuestRequirementType } from "./MapleQuestRequirementType";

type PartyQuestInfo = Pair<string, Pair<string, number>>[]

class MapleQuest  {
	private static quests = new Map<number, MapleQuest>();
	protected _id:number;
	protected _startReqs = new Array<MapleQuestRequirement>();
	protected _completeReqs = new Array<MapleQuestRequirement>();
	protected _startActs = new Array<MapleQuestAction>();
	protected _completeActs = new Array<MapleQuestAction>();
	protected _partyQuestInfo = new Map<string, PartyQuestInfo>(); //[rank, [more/less/equal, [property, value]]]
	protected _relevantMobs = new Map<number, number>();
	private _autoStart = false
	private _autoPreComplete = false
	private _repeatable = false;
	private _customend = false
	private  _blocked = false
	private   _autoAccept = false
	private 	_autoComplete = false
	private 	_scriptedStart = false
	private  _viewMedalItem:number = 0
	private _selectedSkillID:number = 0;
	protected  _name:string = "";

	protected constructor(id:number) {this._id = id }

	private static loadQuest(rs:ResultSet,  psr:PreparedStatement,  psa:PreparedStatement,  pss:PreparedStatement,  psq:PreparedStatement,  psi:PreparedStatement,  psp:PreparedStatement) : MapleQuest {
			// const ret = new MapleQuest(rs.getInt("questid"));
			// ret.name = rs.getString("name");
			// ret.autoStart = rs.getInt("autoStart") > 0;
			// ret.autoPreComplete = rs.getInt("autoPreComplete") > 0;
			// ret.autoAccept = rs.getInt("autoAccept") > 0;
			// ret.autoComplete = rs.getInt("autoComplete") > 0;
			// ret.viewMedalItem = rs.getInt("viewMedalItem");
			// ret.selectedSkillID = rs.getInt("selectedSkillID");
			// ret.blocked = rs.getInt("blocked") > 0; //ult.explorer quests will dc as the item isn't there...

			// psr.setInt(1, ret.id);
			// ResultSet rse = psr.executeQuery();
			// while (rse.next()) {
			// 	 MapleQuestRequirementType type = MapleQuestRequirementType.getByWZName(rse.getString("name"));
			// 	 MapleQuestRequirement req = new MapleQuestRequirement(ret, type, rse);
			// 		if (type.equals(MapleQuestRequirementType.interval)) {
			// 				ret.repeatable = true;
			// 		} else if (type.equals(MapleQuestRequirementType.normalAutoStart)) {
			// 				ret.repeatable = true;
			// 				ret.autoStart = true;
			// 		} else if (type.equals(MapleQuestRequirementType.startscript)) {
			// 				ret.scriptedStart = true;
			// 		} else if (type.equals(MapleQuestRequirementType.endscript)) {
			// 				ret.customend = true;
			// 		} else if (type.equals(MapleQuestRequirementType.mob)) {
			// 				for (Pair<number, number> mob : req.getDataStore()) {
			// 						ret.relevantMobs.put(mob.left, mob.right);
			// 				}
			// 		}
			// 		if (rse.getInt("type") == 0) {
			// 				ret.startReqs.add(req);
			// 		} else {
			// 				ret.completeReqs.add(req);
			// 		}
			// }
			// rse.close();

			// psa.setInt(1, ret.id);
			// rse = psa.executeQuery();
			// while (rse.next()) {
			// 	 MapleQuestActionType ty = MapleQuestActionType.getByWZName(rse.getString("name"));
			// 		if (rse.getInt("type") == 0) { //pass it over so it will set ID + type once done
			// 				if (ty == MapleQuestActionType.item && ret.id == 7103) { //pap glitch
			// 						continue;
			// 				}
			// 				ret.startActs.add(new MapleQuestAction(ty, rse, ret, pss, psq, psi));
			// 		} else {
			// 				if (ty == MapleQuestActionType.item && ret.id == 7102) { //pap glitch
			// 						continue;
			// 				}
			// 				ret.completeActs.add(new MapleQuestAction(ty, rse, ret, pss, psq, psi));
			// 		}
			// }
			// rse.close();

			// psp.setInt(1, ret.id);
			// rse = psp.executeQuery();
			// while (rse.next()) {
			// 		if (!ret.partyQuestInfo.containsKey(rse.getString("rank"))) {
			// 				ret.partyQuestInfo.put(rse.getString("rank"), new ArrayList<Pair<String, Pair<String, number>>>());
			// 		}
			// 		ret.partyQuestInfo.get(rse.getString("rank")).add(new Pair<String, Pair<String, number>>(rse.getString("mode"), new Pair<String, number>(rse.getString("property"), rse.getInt("value"))));
			// }
			// rse.close();
			// return ret;
	}

	public getInfoByRank(rank) {
			return this._partyQuestInfo.get(rank);
	}

	public isPartyQuest() {
			return this._partyQuestInfo.size > 0;
	}

	public getSkillID() {
			return this._selectedSkillID;
	}

	public getName() {
			return this._name;
	}

	public getCompleteActs() {
			return this._completeActs;
	}

	public static async loadQuestsFromDB() {
			
			try {
					const txResult = await prisma.$transaction(async (tx)=>{});

					// while (rs.next()) {
					// 		quests.put(rs.getInt("questid"), loadQuest(rs, psr, psa, pss, psq, psi, psp));
					// }
			} catch (err) {
					err
			}
	}

	public static getInstance(id:number) {
			let ret = this.quests.get(id);
			if (ret == null) {
					ret = new MapleQuest(id);
					this.quests.set(id, ret); //by this time we have already initialized
			}
			return ret;
	}

	public static getAllInstances() {
			return this.quests.values();
	}

	public canStart(c :MapleCharacter , npcId:number ) {
			if (this.getId() == 3048) {
					return true;
			}
			if (c.getQuest(this).getStatus() != 0 && !(c.getQuest(this).getStatus() == 2 && this._repeatable)) {
					return false;
			}
			if (this._blocked && !c.isGM()) {
					return false;
			}
			//if (autoAccept) {
			//    return true; //need script
			//}
			for (const questReq of this._startReqs) {
					if (questReq.getType() == MapleQuestRequirementType.dayByDay && npcId != null) { //everyday. we don't want ok
							this.forceComplete(c, npcId);
							return false;
					}
					if (!questReq.check(c, npcId)) {
							return false;
					}
			}
			return true;
	}

	public canComplete(c:MapleCharacter ,  npcid:number) {
			if (c.getQuest(this).getStatus() != 1) {
					return false;
			}
			if (this._blocked && !c.isGM()) {
					return false;
			}
			if (this._autoComplete && npcid != null && this._viewMedalItem <= 0) {
					this.forceComplete(c, npcid);
					return false; //skip script
			}
			for (const questReq of this._completeReqs) {
					if (!questReq.check(c, npcid)) {
							return false;
					}
			}
			return true;
	}

	public restoreLostItem ( c:MapleCharacter,  itemid:number) {
			if (this._blocked && !c.isGM()) {
					return;
			}
			for ( const a of this._startActs) {
					if (a.RestoreLostItem(c, itemid)) {
							break;
					}
			}
	}

	public start( c:MapleCharacter,  npc:number) {
			if ((this._autoStart || this.checkNPCOnMap(c, npc)) && this.canStart(c, npc)) {
					for (const  a of this._startActs) {
							if (!a.checkEnd(c, null)) { //just in case
									return;
							}
					}
					let info:string = null;
					for (const a of this._startActs) {
							a.runStart(c, null);
							if (info == null) {
									info = a.getInfoData(); //temp fix
							}
							if (a.getNpcAct() != null) {
									c.getMap().broadcastMessage(MaplePacketCreator.showNpcSpecialAction(c.getMap().getNPCById(npc).getObjectId(), a.getNpcAct()));
							}
					}
					if (this.getId() == 29003) { //fucking hardcoding
							info = "time_" + (BigInt(new Date().getTime()) + (86400000n * 30n));
					}
					if (!this._customend) {
							this.forceStart(c, npc, info);
					} else {
							NPCScriptManager.getInstance().endQuest(c.getClient(), npc, this.getId(), true);
					}
			}
	}

	public complete(c:MapleCharacter ,  npc:number,  selection:number=null) {
			if (c.getMap() != null && (this._autoPreComplete || this.checkNPCOnMap(c, npc)) && this.canComplete(c, npc)) {
					for (const a:MapleQuestAction of this._completeActs) {
							if (!a.checkEnd(c, selection)) {
									return;
							}
					}
					this.forceComplete(c, npc);
					for (MapleQuestAction a : completeActs) {
							a.runEnd(c, selection);
							if (a.getNpcAct() != null) {
									c.getMap().broadcastMessage(MaplePacketCreator.showNpcSpecialAction(c.getMap().getNPCById(npc).getObjectId(), a.getNpcAct()));
							}
					}
					// we save forfeits only for logging purposes, they shouldn't matter anymore
					// completion time is set by the constructor

					c.getClient().getSession().write(MaplePacketCreator.showSpecialEffect(9)); // Quest completion
					c.getMap().broadcastMessage(c, MaplePacketCreator.showSpecialEffect(c.getId(), 9), false);
			}
	}

	public forfeit(MapleCharacter c) {
			if (c.getQuest(this).getStatus() != 1) {
					return;
			}
		 const oldStatus:MapleQuestStatus  = c.getQuest(this);
		 const newStatus:MapleQuestStatus  = new MapleQuestStatus(this, 0);
			newStatus.setForfeited(oldStatus.getForfeited() + 1);
			newStatus.setCompletionTime(oldStatus.getCompletionTime());
			c.updateQuest(newStatus);
	}

	public forceStart(c:MapleCharacter , npcCode:number,  customData:string) {
		 const newStatus = new MapleQuestStatus(this, 1, npcCode);
			newStatus.setForfeited(c.getQuest(this).getForfeited());
			newStatus.setCompletionTime(c.getQuest(this).getCompletionTime());
			newStatus.setCustomData(customData);
			c.updateQuest(newStatus);
	}

	public  forceComplete(c:MapleCharacter , npcCode:number) {
		 const newStatus = new MapleQuestStatus(this, 2, npcCode);
			newStatus.setForfeited(c.getQuest(this).getForfeited());
			c.updateQuest(newStatus);
	}

	public getId() {
			return this._id;
	}

	public getRelevantMobs() {
			return this._relevantMobs;
	}

	private checkNPCOnMap(player:MapleCharacter ,  npcid:number) {
			//mir = 1013000
			return (false && npcid == 1013000) || npcid == 9000040 || npcid == 9000066 || (player.getMap() != null && player.getMap().containsNPC(npcid));
	}

	public getMedalItem() {
			return this._viewMedalItem;
	}

	public isBlocked() {
			return this._blocked;
	}

	// public static MedalQuest {

	// 		Beginner(29005, 29015, 15, new int[]{100000000, 100020400, 100040000, 101000000, 101020300, 101040300, 102000000, 102020500, 102030400, 102040200, 103000000, 103020200, 103030400, 103040000, 104000000, 104020000, 106020100, 120000000, 120020400, 120030000}),
	// 		ElNath(29006, 29012, 50, new int[]{200000000, 200010100, 200010300, 200080000, 200080100, 211000000, 211030000, 211040300, 211041200, 211041800}),
	// 		LudusLake(29007, 29012, 40, new int[]{222000000, 222010400, 222020000, 220000000, 220020300, 220040200, 221020701, 221000000, 221030600, 221040400}),
	// 		Underwater(29008, 29012, 40, new int[]{230000000, 230010400, 230010200, 230010201, 230020000, 230020201, 230030100, 230040000, 230040200, 230040400}),
	// 		MuLung(29009, 29012, 50, new int[]{251000000, 251010200, 251010402, 251010500, 250010500, 250010504, 250000000, 250010300, 250010304, 250020300}),
	// 		NihalDesert(29010, 29012, 70, new int[]{261030000, 261020401, 261020000, 261010100, 261000000, 260020700, 260020300, 260000000, 260010600, 260010300}),
	// 		MinarForest(29011, 29012, 70, new int[]{240000000, 240010200, 240010800, 240020401, 240020101, 240030000, 240040400, 240040511, 240040521, 240050000}),
	// 		Sleepywood(29014, 29015, 50, new int[]{105000000, 105000000, 105010100, 105020100, 105020300, 105030000, 105030100, 105030300, 105030500, 105030500}); //repeated map
	// 		public int questid, level, lquestid;
	// 		public int[] maps;

	// 		private MedalQuest(int questid, int lquestid, int level, int[] maps) {
	// 				this.questid = questid; //infoquest = questid -2005, customdata = questid -1995
	// 				this.level = level;
	// 				this.lquestid = lquestid;
	// 				this.maps = maps; //note # of maps
	// 		}
	// }

	public hasStartScript() {
			return this._scriptedStart;
	}

	public  hasEndScript() {
			return this._customend;
	}
}

export default MapleQuest;