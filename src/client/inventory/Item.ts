class Item {
	public itemCode: number;
	public position: number;
	public quantity: number;
	public flag: number;
	public expiration: bigint = BigInt(-1);
	public inventoryId: bigint = BigInt(0); // 아이템이 소속된 인벤토리의 고유 ID 로 추청
	public pet = null; // 임시
	public uniqueId: number;
	public marriageId: number;

	// public owner : string
	// public gmLog : string
	// public giftFrom : string
	// public ring : MapleRing

	constructor(itemCode: number, position: number, quantity: number, flag: number = 0, uniqueid: number = -1) {
		this.itemCode = itemCode;
		this.position = position;
		this.quantity = quantity;
		this.flag = flag;
		this.uniqueId = uniqueid;
		this.marriageId = 0;
	}

	public copy() {
		const i = new Item(this.itemCode, this.position, this.quantity, this.flag, this.uniqueId);
		i.pet = this.pet;
		// i.owner = this.owner;
		// i.GameMaster_log = this.GameMaster_log;
		i.expiration = this.expiration;
		// i.giftFrom = this.giftFrom;
		i.marriageId = this.marriageId;
		return i;
	}

	public getType() {
		return 2; // Item 이면 2?
	}

	public compareWith(other: Item) {
		if (Math.abs(this.position) < Math.abs(other.position)) return -1; // different
		else if (Math.abs(this.position) == Math.abs(other.position)) return 0; // same position
		else return 1; // ??
	}

	public equals(other: Item) {
		return (
			this.uniqueId == other.uniqueId &&
			this.itemCode == other.itemCode &&
			this.quantity == other.quantity &&
			Math.abs(this.position) == Math.abs(other.position)
		);
	}
}

export default Item;
