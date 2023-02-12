import Equip from "../client/inventory/Equip";

class ItemInformation {
	public scrollReqs: Array<number>;
	public questItems: Array<number>;
	public incSkill: Array<number>;
	public slotMax: number;
	public itemMakeLevel: number;
	public equip: Equip = null;
	public equipStats: Map<string, number>;
	public price: number = 0;
	public itemId: number;
	public wholePrice: number;
	public monsterBook: number;
	public stateChange: number;
	public meso: number;
	public questId: number;
	public totalProb: number;
	public replaceItem: number;
	public mob: number;
	public cardSet: number;
	public create: number;
	public flag: number;

	public name: string;
	public desc: string;
	public msg: string;
	public replaceMsg: string;
	public afterImage: string;

	public karmaEnabled: number;
	public rewardItems: Array<any> = null;
	public equipAdditions: Map<Object, Map<number, number>> = null;
	public equipIncs: Map<number, Map<string, number>> = null;
}

export default ItemInformation;
