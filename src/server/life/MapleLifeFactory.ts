import Pair from "@/src/lib/Pair";
import StringUtil from "@/src/tools/StringUtil";
import xml2js from "xml2js";

class MapleLifeFactory {
	private static _data: MapleDataProvider = MapleDataProviderFactory.getDataProvier("wz path");
	private static _npcData: MapleDataProvider = MapleDataProviderFactory.getDataProvier("wz path");
	private static _stringDataWZ: MapleDataProvider = MapleDataProviderFactory.getDataProvier("wz path");
	private static _etcDataWZ: MapleDataProvider = MapleDataProviderFactory.getDataProvier("wz path");

	private static _mobStringData: MapleData = this._stringDataWZ.getData("Mob.img");
	private static _npcStringData: MapleData = this._stringDataWZ.getData("Npc.img");
	private static _npclocData: MapleData;
	private static _npcNames = new Map<number, string>();

	private static _monsterStats = new Map<number, MapleMonsterStats>();

	private static NPCLoc = new Map<number, number>();

	private static _questCount = new Map<number, Array<number>>();

	private static getLife(id: number, type: string) {
		if (type.toLowerCase() == "n") {
			return this.getNPC(id);
		} else if (type.toLowerCase() == "m") {
			return this.getMonster(id);
		} else {
			console.error("Unknown Life type: " + type);
			return null;
		}
	}

	public static getQuestCount(id: number) {
		return this._questCount.get(id);
	}

	public static getNPC(npcId: number) {
		const name = this._npcNames.get(npcId);
		if (name == null && npcId < 9901000) return null;
		return new MapleNPC(npcId, name);
	}

	public static getMonster(monsterId: number) {
		const stats = this.getMonsterStats(monsterId);
		if (stats == null) return null;
		return new MapleMonster(monsterId, stats);
	}

	public static getMonsterStats(monsterId: number) {
		let stats = this._monsterStats.get(monsterId);
		if (stats == null) {
			let monsterData = null;
			try {
				monsterData = this._data.getData(StringUtil.getLeftPaddedStr(monsterId + ".img", "0", 11));
				if (monsterData == null) return nulls;
			} catch (err) {
				return null;
			}
			const monsterInfoData: MapleData = monsterData.getChildByPath("info");
			stats = new MapleMonsterStats(monsterId);

			stats.setHp(); //(GameConstants.getPartyPlayHP(mid) > 0 ? GameConstants.getPartyPlayHP(mid) : MapleDataTool.getIntConvert("maxHP", monsterInfoData));
			stats.setMp(); //(MapleDataTool.getIntConvert("maxMP", monsterInfoData, 0));
			stats.setExp(); //(mid == 9300027 ? 0 : (GameConstants.getPartyPlayEXP(mid) > 0 ? GameConstants.getPartyPlayEXP(mid) : MapleDataTool.getIntConvert("exp", monsterInfoData, 0)));
			stats.setLevel(); //((short) MapleDataTool.getIntConvert("level", monsterInfoData, 1));
			stats.setCharismaEXP(); //((short) MapleDataTool.getIntConvert("charismaEXP", monsterInfoData, 0));
			stats.setRemoveAfter(); //(MapleDataTool.getIntConvert("removeAfter", monsterInfoData, 0));
			stats.setrareItemDropLevel(); //((byte) MapleDataTool.getIntConvert("rareItemDropLevel", monsterInfoData, 0)
			stats.setFixedDamage(); //(MapleDataTool.getIntConvert("fixedDamage", monsterInfoData, -1));
			stats.setOnlyNormalAttack(); //(MapleDataTool.getIntConvert("onlyNormalAttack", monsterInfoData, 0) > 0);
			stats.setBoss(); //(GameConstants.getPartyPlayHP(mid) > 0 || MapleDataTool.getIntConvert("boss", monsterInfoData,()// 0) > 0 || mid == 8810018 || mid == 9410066 || (mid >= 8810118 && mid <= 8810122));
			stats.setExplosiveReward(); //(MapleDataTool.getIntConvert("explosiveReward", monsterInfoData, 0) > 0
			stats.setUndead(); //(MapleDataTool.getIntConvert("undead", monsterInfoData, 0) > 0);
			stats.setEscort(); //(MapleDataTool.getIntConvert("escort", monsterInfoData, 0) > 0);
			stats.setPartyBonus(); //(GameConstants.getPartyPlayHP(mid) > 0 || MapleDataTool.getIntConvert("partyBonusMob", monsterInfoData, 0) > 0);
			stats.setPartyBonusRate(MapleDataTool.getIntConvert("partyBonusR", monsterInfoData, 0));
			if (this._mobStringData.getChildByPath(monsterId.toString() != null)) {
				stats.setName();
			}
			stats.setBuffToGive(); //(MapleDataTool.getIntConvert("buff", monsterInfoData, -1));
			stats.setChange(); //(MapleDataTool.getIntConvert("changeableMob", monsterInfoData, 0) > 0);
			stats.setFriendly(); //(MapleDataTool.getIntConvert("damagedByMob", monsterInfoData, 0) > 0);
			stats.setNoDoom(); //(MapleDataTool.getIntConvert("noDoom", monsterInfoData, 0) > 0);
			stats.setFfaLoot(); //(MapleDataTool.getIntConvert("publicReward", monsterInfoData, 0) > 0);
			stats.setCP(); //((byte) MapleDataTool.getIntConvert("getCP", monsterInfoData, 0));
			stats.setPoint(); //(MapleDataTool.getIntConvert("point", monsterInfoData, 0));
			stats.setDropItemPeriod(); //(MapleDataTool.getIntConvert("dropItemPeriod", monsterInfoData, 0));
			stats.setPhysicalAttack(); //(MapleDataTool.getIntConvert("PADamage", monsterInfoData, 0));
			stats.setMagicAttack(); //(MapleDataTool.getIntConvert("MADamage", monsterInfoData, 0));
			stats.setPDRate(); //((byte) MapleDataTool.getIntConvert("PDRate", monsterInfoData, 0));
			stats.setMDRate(); //((byte) MapleDataTool.getIntConvert("MDRate", monsterInfoData, 0));
			stats.setAcc(); //(MapleDataTool.getIntConvert("acc", monsterInfoData, 0));
			stats.setEva(); //(MapleDataTool.getIntConvert("eva", monsterInfoData, 0));
			stats.setSummonType(); //((byte) MapleDataTool.getIntConvert("summonType", monsterInfoData, 0));
			stats.setCategory(); //((byte) MapleDataTool.getIntConvert("category", monsterInfoData, 0));
			stats.setSpeed(); //(MapleDataTool.getIntConvert("speed", monsterInfoData, 0));
			stats.setPushed(); //(MapleDataTool.getIntConvert("pushed", monsterInfoData, 0));

			const selfd = monsterInfoData.getChildByPath("selfDestruction");
			if (selfd != null) {
				stats.setSelfDHP(); //(MapleDataTool.getIntConvert("hp", selfd, 0));
				stats.setRemoveAfter(); //(MapleDataTool.getIntConvert("removeAfter", selfd, stats.getRemoveAfter()));
				stats.setSelfD(); //((byte) MapleDataTool.getIntConvert("action", selfd, -1));
			} else {
				stats.setSelfD(-1);
			}
			const firstAttackData = monsterInfoData.getChildByPath("firstAttack");
			if (firstAttackData != null) {
				if (firstAttackData.getType() == MapleDataType.FLOAT) {
					stats.setFirstAttack(); //(Math.round(MapleDataTool.getFloat(firstAttackData)) > 0);
				} else {
					stats.setFirstAttack(); //(MapleDataTool.getInt(firstAttackData) > 0);
				}
			}
			if (stats.isBoss() || this.isDmgSponge(mid)) {
				if (
					/*hideHP || */ monsterInfoData.getChildByPath("hpTagColor") == null ||
					monsterInfoData.getChildByPath("hpTagBgcolor") == null
				) {
					stats.setTagColor(0);
					stats.setTagBgColor(0);
				} else {
					stats.setTagColor(); //(MapleDataTool.getIntConvert("hpTagColor", monsterInfoData));
					stats.setTagBgColor(); //(MapleDataTool.getIntConvert("hpTagBgcolor", monsterInfoData));
				}
			}
			const banishData = monsterInfoData.getChildByPath("ban");

			if (banishData != null) {
				stats.setBanishInfo();
				//(new BanishInfo(
				//	MapleDataTool.getString("banMsg", banishData),
				//	MapleDataTool.getInt("banMap/0/field", banishData, -1),
				//	MapleDataTool.getString("banMap/0/portal", banishData, "sp")
				//)
				stats.setBanType(); //(MapleDataTool.getInt("banType", banishData, 0));
			}

			const reviveInfo = monsterInfoData.getChildByPath("revive");
			if (reviveInfo != null) {
				const revives = new Array<number>();
				for (const bdata of reviveInfo) {
					revives.push(MapleDataTool.getInt(bdata));
				}
				stats.setRevives(revives);
			}

			const monsterSkillData = monsterInfoData.getChildByPath("skill");
			if (monsterSkillData != null) {
				let i = 0;
				const skills = new Array<Pair<number, number>>();
				while (monsterSkillData.getChildByPath(i.toString()) != null) {
					skills.push(
						new Pair<number, number>(
							MapleDataTool.getInt(i + "/skill", monsterSkillData, 0),
							MapleDataTool.getInt(i + "/level", monsterSkillData, 0)
						)
					);
					i++;
				}
				stats.setSkills(skills);
			}
			this.decodeElementalString(stats, MapleDataTool.getString("elemAttr", monsterInfoData, ""));

			const link: number = MapleDataTool.getIntConvert("link", monsterInfoData, 0);
			if (link != 0) {
				monsterData = this._data.getData(StringUtil.getLeftPaddedStr(link + ".img", "0", 11));
			}

			// for() line 253 [임시] 이어서 하기
		}
	}

	public static decodeElementalString(stats: MapleMonsterStats, elemAttr: string) {
		for (let i = 0; i < elemAttr.length; i += 2) {
			stats.setEffectiveness(
				Element.getFromChar(elemAttr.charAt(i)),
				ElementalEffectiveness.getByNumber(elemAttr.charAt(i + 1))
			);
		}
	}
}

export default MapleLifeFactory;
