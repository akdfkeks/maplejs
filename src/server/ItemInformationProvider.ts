import lodash from "lodash";
import Equip from "../client/inventory/Equip";
import ItemInformation from "./ItemInformation";

class ItemInformationProvider {
	private static instance: ItemInformationProvider = null;
	// Map<ItemCode, ItemInformation>
	protected dataCache = new Map<number, ItemInformation>();

	public static getInstance() {
		if (this.instance == null) this.instance = new ItemInformationProvider();
		return this.instance;
	}

	private constructor() {}

	// ringId 가 뭘까..
	public getEquipByCode(equipCode: number, ringId: number = -1) {
		const itemInfo: ItemInformation = this.getItemInformationFromCache(equipCode);
		if (!itemInfo) return new Equip(equipCode, 0, ringId, 0);
		const eq = lodash.cloneDeepWith(itemInfo.equip);
		eq.uniqueId = ringId;
		return eq;
	}

	public getItemInformationFromCache(itemCode: number) {
		if (itemCode < 0) return null;
		return this.dataCache.get(itemCode);
	}
}

export default ItemInformationProvider;
