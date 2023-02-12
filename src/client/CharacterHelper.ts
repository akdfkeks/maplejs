import { Prisma } from "@prisma/client";
import { it } from "node:test";
import Equip from "./inventory/Equip";
import { InvType } from "./inventory/InventoryType";
import Item from "./inventory/Item";
import ItemLoader from "./inventory/ItemLoader";
import { MapleCharacter } from "./MapleCharacter";

class CharacterHelper {
	public static refineDataFromChar(char: MapleCharacter, job: number) {
		// 인벤토리 뽑아내기 (장비, 나머지 구분)
		const { equip, rest } = ItemLoader.distinctEquip(char);
		// console.log(equip);
		// console.log(rest);

		const character: Prisma.CharacterCreateInput = {
			name: char.name,
			account: { connect: { id: char.accountId } },
			level: 1,
			str: char.stats.str,
			dex: char.stats.dex,
			int: char.stats.int,
			luk: char.stats.luk,
			maxhp: char.stats.max_hp,
			hp: char.stats.hp,
			maxmp: char.stats.max_mp,
			mp: char.stats.mp,
			sp: char.remainingSp.toString().replace(/ /g, ""),
			ap: char.remainingAp,
			skin: char.skin,
			gender: char.gender,
			job: char.job,
			hair: char.hair,
			face: char.face,
			map: 0,
			meso: char.meso,
			party: -1,
			buddyCapacity: char.buddy_capacity,
			pets: "-1,-1,-1",
			world: char.world,
			inventorySlot: {
				create: {
					equip: 32,
					use: 32,
					setup: 32,
					etc: 32,
					cash: 32,
				},
			},
			// 장비를 제외한 나머지 아이템
			inventoryItem: {
				createMany: {
					// 장비 소비 뭐 그런 타입
					data: rest.map(({ item, type: itemType }) => {
						const p: Prisma.InventoryItemCreateManyCharacterInput = {
							itemCode: item.itemCode,
							inventory_type: itemType,
							position: item.position,
							quantity: item.quantity,
							owner: "", // [임시]
							GM_Log: "", // [임시]
							uniqueid: item.uniqueId, // [임시] ItemLoader.java line 260, expensive if
							expiredate: item.expiration,
							flag: item.flag,
							type: 0, // 인벤토리 0, 창고 1, 캐시샵 2, ..ItemLoader.java 확인
							// gift
							marriageId: item.marriageId,
						};
						return p;
					}),
				},
			},
		};

		return { character, equip };
	}
}

export default CharacterHelper;

// const hack = await prisma.$transaction(
// 	equips.map((equip) =>
// 		prisma.inventoryItem.create({
// 			data: {
// 				character: { connect: { id: createdChar.id } },
// 				itemCode: equip.itemCode,
// 				inventory_type: -1,
// 				position: equip.position,
// 				quantity: equip.quantity,
// 				owner: "", // [임시]
// 				GM_Log: "", // [임시]
// 				uniqueid: equip.uniqueId, // [임시] ItemLoader.java line 260, expensive if
// 				expiredate: equip.expiration,
// 				flag: equip.flag,
// 				type: 0, // 인벤토리 0, 창고 1, 캐시샵 2, ..ItemLoader.java 확인
// 				// gift
// 				marriageId: equip.marriageId,
// 				inventory_equipment: {
// 					create: {
// 						upgradeslots: equip.upgradeSlot,
// 						level: equip.level,
// 						str: equip.str,
// 						dex: equip.dex,
// 						int: equip.int,
// 						luk: equip.luk,
// 						hp: equip.hp,
// 						mp: equip.mp,
// 						watk: equip.watk,
// 						matk: equip.matk,
// 						wdef: equip.wdef,
// 						mdef: equip.mdef,
// 						acc: equip.acc,
// 						avoid: equip.avoid,
// 						hands: equip.hands,
// 						speed: equip.speed,
// 						jump: equip.jump,
// 						// viciousHammer: equip.ViciousHammer,
// 						itemEXP: 0, //equip.itemExp, [임시]
// 						durability: equip.durability,
// 						enhance: equip.enhance,
// 						hpR: equip.hpR,
// 						mpR: equip.mpR,
// 						incSkill: equip.incSkill,
// 						charmEXP: equip.charmExp,
// 						pvpDamage: equip.pvpDamage,
// 					},
// 				},
// 			},
// 		})
// 	)
// );
