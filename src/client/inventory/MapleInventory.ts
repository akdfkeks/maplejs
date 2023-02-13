import { InventoryType } from "@/src/constant/Const";
import lodash from "lodash";
import Item from "./Item";

type Position = number;

class MapleInventory {
	// 여기서 number 는 아이템의 위치(position)
	private inventory: Map<Position, Item>;
	private slotLimit = 0;
	// 0: undefined, 1: equip, 2: use, 3: setup, 4: etc, 5: cash, -1: equipped
	public invType: InventoryType;

	constructor(invType: InventoryType) {
		this.invType = invType;
		this.inventory = new Map<Position, Item>();
	}

	public addFromDB(item: Item) {
		this.inventory.set(item.position, item);
	}

	public addSlot(size: number) {
		this.slotLimit += size;
		if (this.slotLimit > 96) this.slotLimit = 96;
	}

	public getItem(slot: Position) {
		return this.inventory.get(slot);
	}

	public getSlotLimit() {
		return this.slotLimit;
	}

	public setSlotLimit(size: number) {
		if (size > 96) size = 96;
		this.slotLimit = size;
	}

	public findById(itemId: number) {
		for (const item of this.inventory.values()) {
			if (item.itemCode == itemId) return item;
			return null;
		}
	}

	public findByUniqueId(itemId: number) {
		for (const item of this.inventory.values()) {
			if (item.uniqueId == itemId) return item;
			return null;
		}
	}

	public addItem(item: Item) {
		const slotId = this.getNextFreeSlot();
		if (slotId < 0) return -1;
		this.inventory.set(slotId, item);
		item.position = slotId;
		return slotId;
	}

	public getNextFreeSlot() {
		if (this.isFull()) return -1;

		for (let i = 1; i <= this.slotLimit; i++) {
			if (!this.inventory.has(i)) return i;
		}
	}

	isFull(margin: number = 0) {
		return this.inventory.size + margin >= this.slotLimit;
	}

	public getCopiedItemList() {
		// if (this.inventory.size <= 0) return [];
		return [...this.inventory.values()];
	}

	public list() {
		return this.inventory.values();
	}
}

export default MapleInventory;
