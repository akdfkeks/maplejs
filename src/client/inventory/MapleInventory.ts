import lodash from "lodash";
import { InvType } from "./InventoryType";
import Item from "./Item";

class MapleInventory {
	public addFromDB(item: Item) {
		this.inventory.set(item.position, item);
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

	public itemList() {
		return lodash.cloneDeepWith(this.inventory.values());
	}
	private inventory: Map<number, Item>;
	private slotLimit = 0;
	// 0: undefined, 1: equip, 2: use, 3: setup, 4: etc, 5: cash, -1: equipped
	private invType: number;

	constructor(invType: number) {
		this.invType = invType;
		this.inventory = new Map<number, Item>();
	}
}

export default MapleInventory;
