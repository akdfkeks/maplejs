import Equip from "@/src/client/inventory/Equip";
import Item from "@/src/client/inventory/Item";
import { MapleCharacter } from "@/src/client/MapleCharacter";
import { InventoryType } from "@/src/constant/Const";
import { toInt32 } from "@/src/lib/TypeCast";
import LittleEndianPacketWriter from "@/src/packet/tools/NewPacketWriter";
import lodash from "lodash";
import moment from "moment-timezone";

class PacketHelper {
	public static FT_UT_OFFSET = 116445060000000000n; // KST
	public static MAX_TIME = 150842304000000000n; //00 80 05 BB 46 E6 17 02
	public static ZERO_TIME = 94354848000000000n; //00 40 E0 FD 3B 37 4F 01
	public static PERMANENT = 150841440000000000n; // 00 C0 9B 90 7D E5 17 02

	public static addCharStats(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		// 외형 관련 패킷
		pm.writeInt(character.id);
		pm.writeAsciiString(character.name, 13); // , 13);
		pm.writeByte(character.gender > 0 ? 1 : 0); // Male: 0, Female: 1
		pm.writeByte(character.skin);
		pm.writeInt(character.face);
		pm.writeInt(character.hair);

		pm.writeZeroBytes(8); // 제로바이트 8개

		pm.writeByte(character.level);
		pm.writeShort(character.job);

		// console.log(character.job);

		pm.writeShort(character.stats.str);
		pm.writeShort(character.stats.dex);
		pm.writeShort(character.stats.int);
		pm.writeShort(character.stats.luk);
		pm.writeShort(character.stats.hp);
		pm.writeShort(character.stats.max_hp);
		pm.writeShort(character.stats.mp);
		pm.writeShort(character.stats.max_mp);

		// 기타
		pm.writeShort(character.remainingSp.reduce((s, v) => s + v, 0));
		pm.writeShort(character.remainingAp);
		pm.writeInt(character.exp);
		pm.writeShort(character.fame);
		pm.writeInt(character.map_id);
		pm.writeByte(character.initialSpawnPoint);
	}

	public static addCharLook(pm: LittleEndianPacketWriter, character: MapleCharacter, mega: boolean) {
		pm.writeByte(character.gender > 0 ? 1 : 0); // Male: 0, Female: 1
		pm.writeByte(character.skin);
		pm.writeInt(character.face);
		pm.writeByte(mega ? 0 : 1); // mega???????
		pm.writeInt(character.hair);

		// Calculate Equipments
		// Map<position, item_id>
		const myEquip = new Map<number, number>();
		const maskedEquip = new Map<number, number>();

		const equip = character.getInventory(InventoryType.EQUIPPED);

		for (const ivItem of equip.getCopiedItemList()) {
			// console.log(ivItem);
			if (ivItem.position < -127) continue; // not visible

			const position = ivItem.position * -1;
			if (position < 100) {
				// myEquip.push({ position, itemId });
				myEquip.set(position, ivItem.itemCode);
			} else if (position > 100 && position != 111) {
				myEquip.set(position - 100, ivItem.itemCode);
				maskedEquip.set(position - 100, ivItem.itemCode);
			}
		}

		// Equipments
		for (const equip of myEquip) {
			pm.writeByte(equip[0]);
			pm.writeInt(equip[1]);
		}
		pm.writeByte(-1); // end of visible items

		// Masked Equipment
		for (const equip of maskedEquip) {
			pm.writeByte(equip[0]);
			pm.writeInt(equip[1]);
		}
		pm.writeByte(-1); //end of masked items

		// etc
		const cWeapon: Item = equip.getItem(-111);
		pm.writeInt(cWeapon ? cWeapon.itemCode : 0); // cweapon?? 일단 0 cache weapon 인가?
		pm.writeInt(0); // ...pet??????
	}

	public static addCharacterInfo(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		pm.writeLong(-1); // flag

		// flag 1 완료
		this.addCharStats(pm, character);
		pm.writeByte(20); // [임시] buddy list capacity

		// flag 2~64 [완료]
		this.addInventoryInfo(pm, character);

		// flag 0x100 [임시]
		this.addSkillInfo(pm, character);

		// flag 0x8000 [임시]
		this.addCoolDownInfo(pm, character);

		// flag 0x200, 0x4000 [임시]
		this.addQuestInfo(pm, character);

		// flag 0x400, 0x800 [임시]
		this.addRingInfo(pm, character);

		// flag 0x1000 [임시]
		this.addRocksInfo(pm, character);

		// flag 0x20000, 0x10000 [임시]
		this.addMonsterBookInfo(pm, character);

		//..?
		//        pm.writeShort(0);
		//        pm.write(0);
		//        pm.write(0);

		// flag 0x40000 [임시]
		character.writeQuestInfoPacket(pm); // for every questinfo: int16_t questid, string questdata

		// flag 0x80000 unknown
		pm.writeShort(0); // PQ rank?
		// int32_t id, int16_t some data
	}

	public static addInventoryInfo(pm: LittleEndianPacketWriter, chr: MapleCharacter) {
		pm.writeInt(chr.meso);
		pm.writeByte(32); // character.getInventory(InventoryType.Type).getSlotLimit() Equip
		pm.writeByte(32); // character.getInventory(InventoryType.Type).getSlotLimit() Use
		pm.writeByte(32); // character.getInventory(InventoryType.Type).getSlotLimit() Setup
		pm.writeByte(32); // character.getInventory(InventoryType.Type).getSlotLimit() Etc
		pm.writeByte(60); // character.getInventory(InventoryType.Type).getSlotLimit() Cash

		////////////////////////////////////////////////////////////////////////
		let iv = chr.getInventory(InventoryType.EQUIPPED);
		const equipped = iv.getCopiedItemList();
		// equipped.sort(); // equipped 를 정렬..? 왜?
		for (const item of equipped) {
			if (item.position < 0 && item.position > -100) {
				this.addItemInfo(pm, item, false, false, true, false, chr);
			}
		}

		pm.writeByte(0); // start of equip inventory
		////////////////////////////////////////////////////////////////////////
		iv = chr.getInventory(InventoryType.EQUIP);
		for (const item of iv.list()) {
			this.addItemInfo(pm, item, false, false, true, false, chr);
		}

		pm.writeByte(0); // start of use inventory
		////////////////////////////////////////////////////////////////////////
		iv = chr.getInventory(InventoryType.USE);
		for (const item of iv.list()) {
			this.addItemInfo(pm, item, false, false, true, false, chr);
		}

		pm.writeByte(0); // start of setup inventory
		////////////////////////////////////////////////////////////////////////
		iv = chr.getInventory(InventoryType.SETUP);
		for (const item of iv.list()) {
			this.addItemInfo(pm, item, false, false, true, false, chr);
		}

		pm.writeByte(0); // start of etc inventory
		////////////////////////////////////////////////////////////////////////
		iv = chr.getInventory(InventoryType.ETC);
		for (const item of iv.list()) {
			this.addItemInfo(pm, item, false, false, true, false, chr);
		}

		pm.writeByte(0); // start of cash inventory
		////////////////////////////////////////////////////////////////////////
	}

	public static addItemInfo(
		pm: LittleEndianPacketWriter,
		item: Item,
		zeroPosition: boolean,
		leaveOut: boolean,
		trade: boolean,
		bagSlot: boolean,
		chr: MapleCharacter
	) {
		let pos = item.position;
		if (zeroPosition && !leaveOut) {
			pm.writeByte(0);
		} else {
			if (pos <= -1) {
				pos *= -1;
				if (pos > 100 && pos < 1000) pos -= 100;
			}
			if (bagSlot) {
				pm.writeInt((pos % 100) - 1);
			} else if (!trade && item.getType() == 1) {
				pm.writeShort(pos);
			} else {
				pm.writeByte(pos);
			}
		}
		pm.writeByte(item.pet != null ? 3 : item.getType());
		pm.writeInt(item.itemCode);

		let hasUniqueId = item.uniqueId > 0;
		pm.writeByte(hasUniqueId ? 1 : 0);

		if (hasUniqueId) {
			pm.writeLong(item.uniqueId);
		}

		if (item.pet != null) {
			// this.addPetItemInfo(pm, item, item.pet, true)
		} else {
			this.addExpirationTime(pm, item.expiration);
			if (item.getType() == 1) {
				const equip = item as Equip;
				pm.writeByte(equip.upgradeSlot);
				pm.writeByte(equip.level);
				pm.writeShort(equip.str);
				pm.writeShort(equip.dex);
				pm.writeShort(equip.int);
				pm.writeShort(equip.luk);
				pm.writeShort(equip.hp);
				pm.writeShort(equip.mp);
				pm.writeShort(equip.watk);
				pm.writeShort(equip.matk);
				pm.writeShort(equip.wdef);
				pm.writeShort(equip.mdef);
				pm.writeShort(equip.acc);
				pm.writeShort(equip.avoid);
				pm.writeShort(equip.hands);
				pm.writeShort(equip.speed);
				pm.writeShort(equip.jump);
				pm.writeMapleAsciiString(""); // equip.owner
				pm.writeShort(equip.flag);
				pm.writeByte(equip.incSkill > 0 ? 1 : 0);
				// pm.writeByte(Math.max(equip.getBaseLevel(), equip.getEquipLevel())); // Item level
				pm.writeByte(equip.level); // [임시]
				pm.writeInt(0); // Item Exp... 10000000 = 100% equip.getExpPercentage() * 100000

				if (equip.uniqueId <= 0) {
					pm.writeLong(equip.inventoryId <= 0 ? -1 : equip.inventoryId); //some tracking ID
				}

				pm.writeLong(94354848000000000n); // timestamp?
				pm.writeInt(-1);
			} else {
				pm.writeShort(item.quantity);
				pm.writeMapleAsciiString(""); //item.owner);
				pm.writeShort(item.flag);
				// if (
				// 	// 표창 또는 총알이면
				// 	GameConstants.isThrowingStar(item.getItemId()) ||
				// 	GameConstants.isBullet(item.getItemId()) ||
				// 	item.getItemId() / 10000 == 287
				// ) {
				// 	mplew.writeLong(item.getInventoryId() <= 0 ? -1 : item.getInventoryId());
				// }
			}
		}
	}

	public static addExpirationTime(pm: LittleEndianPacketWriter, time: bigint) {
		pm.writeLong(this.getTime(-1)); // [임시]
	}

	public static addSkillInfo(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		const skills = character.skills;
		pm.writeShort(skills.size);
		for (const skill of skills.entries()) {
			pm.writeInt(skill[0].id);
			pm.writeInt(skill[1].level);
			if ((skill[0].id / 10000) % 100 > 0 && (skill[0].id / 10000) % 10 == 2) {
				pm.writeInt(skill[1].masterLevel);
			}
		}
	}

	public static addCoolDownInfo(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		// const cd = character.getCooldowns()
		pm.writeShort(0); // cd.size
		// for (const cooling of cd) {
		// 	pm.writeInt(cooling.skillCode);
		// 	// 여기 타입 불안허다~
		// 	pm.writeShort((cooling.length + cooling.startTime - moment().valueOf()) / 1000);
		// }
	}

	public static addQuestInfo(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		// const started = character.getStartedQuests();
		pm.writeShort(0); // started.size

		// for (const q of started) {
		// 	pm.writeShort(q.getQuest().getId());
		// 	if (q.hasMobKills()) {
		// 		let sb = "";
		// 		for (const kills of q.getMobKills().values()) {
		// 			sb += StringUtil.getLeftPaddedStr(String.valueOf(kills), "0", 3);
		// 		}
		// 		pm.writeMapleAsciiString(sb.toString());
		// 	} else {
		// 		if (q.getCustomData() != null) {
		// 			if (q.getCustomData().startsWith("time_")) {
		// 				pm.writeShort(9);
		// 				pm.writeByte(1);
		// 				pm.writeLong(PacketHelper.getTime(BigInt(q.getCustomData().substring(5))));
		// 			} else {
		// 				pm.writeMapleAsciiString(q.getCustomData());
		// 			}
		// 		} else {
		// 			pm.writeZeroBytes(2);
		// 		}
		// 	}
		// }
		// const completed = character.getCompletedQuests();
		pm.writeShort(0); //completed.size) [임시]
		// for (const q of completed) {
		// 	pm.writeShort(q.getQuest().getId());
		// 	pm.writeLong(this.getTime(q.getCompletionTime()));
		// }
	}

	public static addRingInfo(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		pm.writeShort(0);
		// const aRing = character.getRings(true)

		pm.writeShort(0); // cRing.size
		// 반복
		pm.writeShort(0); // fRing.size
		//반복
		pm.writeShort(0); // mRing.size
		// 반복
	}

	public static addRocksInfo(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		// 고성능? 순간이동의 돌? 같은데 [임시]
		const mapz = character.getRegTeleportRockMaps();
		for (let i = 0; i < 5; i++) {
			pm.writeInt(mapz[i]);
		}
		const map = character.getTeleportRockMaps();
		for (let i = 0; i < 10; i++) {
			pm.writeInt(map[i]);
		}
	}

	public static addMonsterBookInfo(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		pm.writeInt(character.getMonsterBookCover());
		pm.writeByte(0);
		// character.getMonsterBook().addCardPacket(pm);
		pm.writeShort(0); // card size
		// for()
	}

	public static getTime(n: number): bigint {
		if (n == -1) return PacketHelper.MAX_TIME;
		if (n == -2) return PacketHelper.ZERO_TIME;
		if (n == -3) return PacketHelper.PERMANENT;
		return BigInt(n) * 10000n + this.FT_UT_OFFSET;
	}
}

new Date().getTimezoneOffset();
export default PacketHelper;
