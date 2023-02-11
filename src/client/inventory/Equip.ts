import Item from "./Item";

class Equip extends Item {
	static ScrollResult = {
		SUCCESS: 0,
		FAIL: 1,
		CURSE: 2,
	};
	static ARMOR_RATIO = 35000;
	static WEAPON_RATIO = 70000;

	public str = 0;
	public dex = 0;
	public int = 0;
	public luk = 0;
	public hp = 0;
	public mp = 0;
	public watk = 0;
	public matk = 0;
	public wdef = 0;
	public mdef = 0;
	public acc = 0;
	public avoid = 0;
	public hands = 0;
	public speed = 0;
	public jump = 0;
	public hpR = 0;
	public mpR = 0;
	public charmExp = 0;
	public pvpDamage = 0;

	constructor(id: number, position: number, flag: number, uniqueId?: number) {
		super(id, position, 1, flag, uniqueId);
	}

	public override copy(): Item {
		const e: Equip = new Equip(this.id, this.position, this.uniqueId, this.flag);
		e.str = this.str;
		e.dex = this.dex;
		e.int = this.int;
		e.luk = this.luk;
		e.hp = this.hp;
		e.mp = this.mp;
		e.matk = this.matk;
		e.mdef = this.mdef;
		e.watk = this.watk;
		e.wdef = this.wdef;
		e.acc = this.acc;
		e.avoid = this.avoid;
		e.hands = this.hands;
		e.speed = this.speed;
		e.jump = this.jump;
		e.enhance = this.enhance;
		e.upgradeSlots = this.upgradeSlots;
		e.level = this.level;
		e.itemEXP = this.itemEXP;
		e.durability = this.durability;
		e.vicioushammer = this.vicioushammer;
		e.potential1 = this.potential1;
		e.potential2 = this.potential2;
		e.potential3 = this.potential3;
		e.charmExp = this.charmExp;
		e.pvpDamage = this.pvpDamage;
		e.hpR = this.hpR;
		e.mpR = this.mpR;
		e.incSkill = this.incSkill;
		// e.setGiftFrom(getGiftFrom());
		// e.setOwner(getOwner());
		// e.setQuantity(getQuantity());
		// e.setExpiration(getExpiration());
		// e.setMarriageId(getMarriageId());
		return e;
	}
}

export default Equip;
