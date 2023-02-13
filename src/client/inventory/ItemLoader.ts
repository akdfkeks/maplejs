import { InventoryType, ItemLocation, ItemType, toInvType } from "@/src/constant/Const";
import prisma from "@/src/database/prisma";
import { Prisma } from "@prisma/client";
import { MapleCharacter } from "../MapleCharacter";
import Equip from "./Equip";
import Item from "./Item";
import MapleInventory from "./MapleInventory";

class ItemLoader {
	public static async loadItems(charId: number, itemLocation: ItemLocation, login: boolean) {
		try {
			const items = new Map<bigint, { item: Item; invType: InventoryType }>();
			const pItemList = await prisma.inventoryItem.findMany({
				where: {
					character_id: charId,
					type: itemLocation,
					inventory_type: login ? InventoryType.EQUIPPED : undefined,
				},
				include: { inventory_equipment: true },
			});
			for (const item of pItemList) {
				if (item.inventory_type == InventoryType.EQUIP || item.inventory_type == InventoryType.EQUIPPED) {
					const equip = new Equip(item.itemCode, item.position, item.flag, item.uniqueid);
					if (!login) {
						equip.quantity = 1;
						equip.inventoryId = item.id;
						// equip.owner = ""
						equip.expiration = item.expiredate;
						equip.upgradeSlot = item.inventory_equipment.upgradeslots;
						equip.level = item.inventory_equipment.level;
						equip.str = item.inventory_equipment.str;
						equip.dex = item.inventory_equipment.dex;
						equip.int = item.inventory_equipment.int;
						equip.luk = item.inventory_equipment.luk;
						equip.hp = item.inventory_equipment.hp;
						equip.mp = item.inventory_equipment.mp;
						equip.watk = item.inventory_equipment.watk;
						equip.matk = item.inventory_equipment.matk;
						equip.wdef = item.inventory_equipment.wdef;
						equip.mdef = item.inventory_equipment.mdef;
						equip.acc = item.inventory_equipment.acc;
						equip.avoid = item.inventory_equipment.avoid;
						equip.hands = item.inventory_equipment.hands;
						equip.speed = item.inventory_equipment.speed;
						equip.jump = item.inventory_equipment.jump;
						equip.setItemExp(item.inventory_equipment.itemEXP);
						equip.durability = item.inventory_equipment.durability;
						equip.enhance = item.inventory_equipment.enhance;
						equip.hpR = item.inventory_equipment.hpR;
						equip.mpR = item.inventory_equipment.mpR;
						equip.incSkill = item.inventory_equipment.incSkill;
						equip.pvpDamage = item.inventory_equipment.pvpDamage;
						equip.charmExp = item.inventory_equipment.charmEXP;
					}
					items.set(item.id, { item: equip, invType: toInvType(item.inventory_type) });
				}
			}

			return items;
		} catch (err) {
			console.log(err);
		}
	}
	/**
	 * 캐릭터의 인벤토리로부터 아이템을 추출합니다
	 * 장비의 경우 추가정보를 생성해야하기 때문에 분리합니다
	 */
	public static distinctEquip(char: MapleCharacter) {
		// [임시] 여기 개선할 방법 생각해보기
		const equipments = new Array<Equip>();
		const remain = new Array<{ item: Item; type: number }>();

		char.getInventory(InventoryType.EQUIP)
			.getCopiedItemList()
			.forEach((e) => equipments.push(e as Equip));
		char.getInventory(InventoryType.EQUIPPED)
			.getCopiedItemList()
			.forEach((e) => equipments.push(e as Equip));
		char.getInventory(InventoryType.CASH)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InventoryType.CASH }));
		char.getInventory(InventoryType.ETC)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InventoryType.ETC }));
		char.getInventory(InventoryType.SETUP)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InventoryType.SETUP }));
		char.getInventory(InventoryType.USE)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InventoryType.USE }));
		char.getInventory(InventoryType.UNDEFINED)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InventoryType.UNDEFINED }));

		return { equip: equipments, rest: remain };
	}
}

export default ItemLoader;

// Create prisma Item objects from Maple Inventory
// public static createPItemsFromMapleItems(list: Array<{ item: Item; invType: number }>) {
// 	let pItemList = new Array();
// 	let pEquipList = new Array();

// 	if (list.length == 0 || list == null) return { ivtItems: null, ivtEquips: null };

// 	for (const itemWithType of list) {
// 		const { item, invType } = itemWithType;
// 		if (invType == InventoryType.EQUIP || InventoryType.EQUIPPED) {
// 			pEquipList.push(itemWithType);
// 		} else {
// 			pItemList.push(itemWithType);
// 		}
// 	}
// }
