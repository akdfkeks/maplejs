import lodash from "lodash";
import Equip from "../client/inventory/Equip";
import ItemInformation from "./ItemInformation";

class ItemInformationProvider {
	private static instance: ItemInformationProvider = null;
	protected dataCache = new Map<number, ItemInformation>();

	public static getInstance() {
		if (this.instance == null) this.instance = new ItemInformationProvider();
		return this.instance;
	}

	private constructor() {}

	// ringId 가 뭘까..
	public getEquipById(equipId: number, ringId: number = -1) {
		const i: ItemInformation = this.getItemInformation(equipId);
		if (i == null) return new Equip(equipId, 0, ringId, 0);
		const eq = lodash.cloneDeepWith(i.eq);
		eq.uniqueId = ringId;
		return eq;
	}

	public getItemInformation(itemId: number) {
		if (itemId < 0) return null;
		return this.dataCache.get(itemId);
	}
}

export default ItemInformationProvider;
