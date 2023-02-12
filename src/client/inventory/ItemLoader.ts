import { Prisma } from "@prisma/client";
import { MapleCharacter } from "../MapleCharacter";
import Equip from "./Equip";
import { InvType } from "./InventoryType";
import Item from "./Item";
import MapleInventory from "./MapleInventory";

class ItemLoader {
	// Create prisma Item objects from Maple Inventory
	public static createPItemsFromMapleItems(list: Array<{ item: Item; invType: number }>) {
		let pItemList = new Array();
		let pEquipList = new Array();

		if (list.length == 0 || list == null) return { ivtItems: null, ivtEquips: null };

		for (const itemWithType of list) {
			const { item, invType } = itemWithType;
			if (invType == InvType.EQUIP || InvType.EQUIPPED) {
				pEquipList.push(itemWithType);
			} else {
				pItemList.push(itemWithType);
			}
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

		char.getInventory(InvType.EQUIP)
			.getCopiedItemList()
			.forEach((e) => equipments.push(e as Equip));
		char.getInventory(InvType.EQUIPPED)
			.getCopiedItemList()
			.forEach((e) => equipments.push(e as Equip));
		char.getInventory(InvType.CASH)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InvType.CASH }));
		char.getInventory(InvType.ETC)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InvType.ETC }));
		char.getInventory(InvType.SETUP)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InvType.SETUP }));
		char.getInventory(InvType.USE)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InvType.USE }));
		char.getInventory(InvType.UNDEFINED)
			.getCopiedItemList()
			.forEach((i) => remain.push({ item: i, type: InvType.UNDEFINED }));

		return { equip: equipments, rest: remain };
	}
}

export default ItemLoader;
