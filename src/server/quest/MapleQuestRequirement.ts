import { MapleCharacter } from "@/src/client/MapleCharacter";
import Pair from "@/src/lib/Pair";
import MapleQuest from "./MapleQuest";
import { MapleQuestRequirementType } from "./MapleQuestRequirementType";

class MapleQeustRequirement {
	private _quest: MapleQuest;
	private _type: MapleQuestRequirementType;
	private _intStore: number;
	private _stringStore: string;
	private _dataStore: Array<Pair<number, number>>;

	constructor(quest: MapleQuest, type: MapleQuestRequirementType, rse) {
		this._type = type;
		this._quest = quest;

		switch (type) {
			case MapleQuestRequirementType.pet:
			case MapleQuestRequirementType.mbcard:
			case MapleQuestRequirementType.mob:
			case MapleQuestRequirementType.item:
			case MapleQuestRequirementType.quest:
			case MapleQuestRequirementType.skill:
			case MapleQuestRequirementType.job: {
				this._dataStore = new Array<Pair<number, number>>();
				const first: Array<string> = rse.intStoresFirst.split(", ");
				const second: Array<string> = rse.intStoresSecond.split(", ");
				if (first.length <= 0 && rse.intStoresFirst.length > 0) {
					this._dataStore.push(new Pair<number, number>(rse.intStoresFirst, rse.intStoresSecon));
				}
				for (let i = 0; i < first.length; i++) {
					if (first[i].length > 0 && second[i].length > 0) {
						this._dataStore.push(new Pair<number, number>(parseInt(first[i]), parseInt(second[i])));
					}
				}
				break;
			}
			case MapleQuestRequirementType.partyQuest_S:
			case MapleQuestRequirementType.dayByDay:
			case MapleQuestRequirementType.normalAutoStart:
			case MapleQuestRequirementType.subJobFlags:
			case MapleQuestRequirementType.fieldEnter:
			case MapleQuestRequirementType.pettamenessmin:
			case MapleQuestRequirementType.npc:
			case MapleQuestRequirementType.questComplete:
			case MapleQuestRequirementType.pop:
			case MapleQuestRequirementType.interval:
			case MapleQuestRequirementType.mbmin:
			case MapleQuestRequirementType.lvmax:
			case MapleQuestRequirementType.lvmin: {
				this._intStore = rse.stringStore;
				break;
			}
			case MapleQuestRequirementType.end: {
				this._stringStore = rse.stringStore;
				break;
			}
		}
	}
	
	public check( c:MapleCharacter,  npcCode:number) {
		switch (this._type) {
				case MapleQuestRequirementType.job:
						for (const a of this._dataStore) {
								if (a.right == c.getJob() || c.isGM()) {
										return true;
								}
						}
						return false;
				case MapleQuestRequirementType.skill: {
						for (const a of this._dataStore) {
								const acquire = a.right > 0;
								const skill = a.left;
								const skil:Skill = SkillFactory.getSkill(skill);
								if (acquire) {
										if (skil.isFourthJob()) {
												if (c.getMasterLevel(skil) == 0) {
														return false;
												}
										} else {
												if (c.getSkillLevel(skil) == 0) {
														return false;
												}
										}
								} else {
										if (c.getSkillLevel(skil) > 0 || c.getMasterLevel(skil) > 0) {
												return false;
										}
								}
						}
						return true;
				}
				case MapleQuestRequirementType.quest:
						for ( const a of this._dataStore) {
								final MapleQuestStatus q = c.getQuest(MapleQuest.getInstance(a.getLeft()));
								final int state = a.getRight();
								if (state != 0) {
										if (q == null && state == 0) {
												continue;
										}
										if (q == null || q.getStatus() != state) {
												return false;
										}
								}
						}
						return true;
				case MapleQuestRequirementType.item:
						MapleInventoryType iType;
						int itemId;
						short quantity;

						for (Pair<number, number> a : dataStore) {
								itemId = a.getLeft();
								quantity = 0;
								iType = GameConstants.getInventoryType(itemId);
								for (Item item : c.getInventory(iType).listById(itemId)) {
										quantity += item.getQuantity();
								}
								final int count = a.getRight();
								if (quantity < count || (count <= 0 && quantity > 0)) {
										return false;
								}
						}
						return true;
				case MapleQuestRequirementType.lvmin:
						return c.getLevel() >= intStore;
				case MapleQuestRequirementType.lvmax:
						return c.getLevel() <= intStore;
				case MapleQuestRequirementType.end:
						final String timeStr = stringStore;
						if (timeStr == null || timeStr.length() <= 0) {
								return true;
						}
						final Calendar cal = Calendar.getInstance();
						cal.set(number.parseInt(timeStr.substring(0, 4)), number.parseInt(timeStr.substring(4, 6)), number.parseInt(timeStr.substring(6, 8)), number.parseInt(timeStr.substring(8, 10)), 0);
						return cal.getTimeInMillis() >= System.currentTimeMillis();
				case MapleQuestRequirementType.mob:
						for (Pair<number, number> a : dataStore) {
								final int mobId = a.getLeft();
								final int killReq = a.getRight();
								if (c.getQuest(quest).getMobKills(mobId) < killReq) {
										return false;
								}
						}
						return true;
				case MapleQuestRequirementType.npc:
						return npcid == null || npcid == intStore;
				case MapleQuestRequirementType.fieldEnter:
						if (intStore > 0) {
								return intStore == c.getMapId();
						}
						return true;
				case MapleQuestRequirementType.pop:
						return c.getFame() >= intStore;
				case MapleQuestRequirementType.questComplete:
						return c.getNumQuest() >= intStore;
				case MapleQuestRequirementType.interval:
						return c.getQuest(quest).getStatus() != 2 || c.getQuest(quest).getCompletionTime() <= System.currentTimeMillis() - intStore * 60 * 1000L;
				case MapleQuestRequirementType.pet:
						for (const a of  this._dataStore) {
								if (c.getPetById(a.getRight()) != -1) {
										return true;
								}
						}
						return false;
				case MapleQuestRequirementType.pettamenessmin:
						for (MaplePet pet : c.getPets()) {
								if (pet.getSummoned() && pet.getCloseness() >= intStore) {
										return true;
								}
						}
						return false;
				case MapleQuestRequirementType.partyQuest_S:
						final int[] partyQuests = new int[]{1200, 1201, 1202, 1203, 1204, 1205, 1206, 1300, 1301, 1302};
						int sRankings = 0;
						for (int i : partyQuests) {
								final String rank = c.getOneInfo(i, "rank");
								if (rank != null && rank.equals("S")) {
										sRankings++;
								}
						}
						return sRankings >= 5;
				case MapleQuestRequirementType.subJobFlags: // 1 for non-DB, 2 for DB...
						return c.getSubcategory() == (intStore / 2);
				default:
						return true;
		}
}
}

export default MapleQeustRequirement;
