class Item {
	public id: number;
	public position: number;
	public quantity: number;
	public flag: number;

	public str: number;
	public dex: number;
	public int: number;
	public luk: number;
	public hp: number;
	public mp: number;
	public matk: number;
	public mdef: number;
	public watk: number;
	public wdef: number;
	public acc: number;
	public avoid: number;
	public hands: number;
	public speed: number;
	public jump: number;
	public enhance: number;
	public upgradeSlots: number;
	public level: number;
	public itemEXP: number;
	public durability: number;
	public vicioushammer: number;
	public potential1: number;
	public potential2: number;
	public potential3: number;
	public charmExp: number;
	public pvpDamage: number;
	public hpR: number;
	public mpR: number;
	public incSkill: number;

	private expiration: bigint = BigInt(-1);
	private inventoryitemid = 0;
	private pet = null;
	public uniqueId: number;
	private marriageId = null;

	constructor(id: number, position: number, quantity: number, flag?: number, uniqueid: number = -1) {
		this.id = id;
		this.position = position;
		this.quantity = quantity;
		this.uniqueId = uniqueid;
		this.marriageId = 0;
		if (flag) this.flag = flag;
	}

	public copy() {
		return new Item(this.id, this.position, this.quantity, this.flag, this.uniqueId);
	}
}

export default Item;
