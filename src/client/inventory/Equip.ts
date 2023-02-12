import Item from "./Item";

class Equip extends Item {
	static ScrollResult = {
		SUCCESS: 0,
		FAIL: 1,
		CURSE: 2,
	};

	static ARMOR_RATIO = 35000;
	static WEAPON_RATIO = 70000;

	public upgradeSlot = 0;
	public level = 0;
	public enhance = 0;
	// public viciousHammer = 0; 황금망치

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

	private itemExp = 0;
	public durability = -1;
	public incSkill = -1;

	// public potential1 = 0; 잠재능력
	// public potential2 = 0;
	// public potential3 = 0;

	constructor(itemCode: number, position: number, flag: number, uniqueId?: number) {
		super(itemCode, position, 1, flag, uniqueId);
	}

	public override copy(): Item {
		const e: Equip = new Equip(this.itemCode, this.position, this.uniqueId, this.flag);
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
		e.upgradeSlot = this.upgradeSlot;
		e.level = this.level;
		e.itemExp = this.itemExp;
		e.durability = this.durability;
		// e.vicioushammer = this.vicioushammer;
		// e.potential1 = this.potential1;
		// e.potential2 = this.potential2;
		// e.potential3 = this.potential3;
		e.charmExp = this.charmExp;
		e.pvpDamage = this.pvpDamage;
		e.hpR = this.hpR;
		e.mpR = this.mpR;
		e.incSkill = this.incSkill;
		e.marriageId = this.marriageId;
		e.quantity = this.quantity;
		e.expiration = this.expiration;
		// e.setGiftFrom(getGiftFrom());
		// e.setOwner(getOwner());

		return e;
	}

	public override getType(): number {
		return 1;
	}

	public setStr(str: number) {
		if (str < 0) {
			str = 0;
		}
		this.str = str;
	}

	public setDex(dex: number) {
		if (dex < 0) {
			dex = 0;
		}
		this.dex = dex;
	}

	public setInt(_int: number) {
		if (_int < 0) {
			_int = 0;
		}
		this.int = _int;
	}

	public setLuk(luk: number) {
		if (luk < 0) {
			luk = 0;
		}
		this.luk = luk;
	}

	public setHp(hp: number) {
		if (hp < 0) {
			hp = 0;
		}
		this.hp = hp;
	}

	public setMp(mp: number) {
		if (mp < 0) {
			mp = 0;
		}
		this.mp = mp;
	}

	public setWatk(watk: number) {
		if (watk < 0) {
			watk = 0;
		}
		this.watk = watk;
	}

	public setMatk(matk: number) {
		if (matk < 0) {
			matk = 0;
		}
		this.matk = matk;
	}

	public setWdef(wdef: number) {
		if (wdef < 0) {
			wdef = 0;
		}
		this.wdef = wdef;
	}

	public setMdef(mdef: number) {
		if (mdef < 0) {
			mdef = 0;
		}
		this.mdef = mdef;
	}

	public setAcc(acc: number) {
		if (acc < 0) {
			acc = 0;
		}
		this.acc = acc;
	}

	public setAvoid(avoid: number) {
		if (avoid < 0) {
			avoid = 0;
		}
		this.avoid = avoid;
	}

	public setHands(hands: number) {
		if (hands < 0) {
			hands = 0;
		}
		this.hands = hands;
	}

	public setSpeed(speed: number) {
		if (speed < 0) {
			speed = 0;
		}
		this.speed = speed;
	}

	public setJump(jump: number) {
		if (jump < 0) {
			jump = 0;
		}
		this.jump = jump;
	}

	public setItemExp(exp: number) {
		if (exp < 0) exp = 0;
		this.itemExp = 0;
	}

	public getEquipExp() {
		if (this.itemExp < 0) return 0;
		// [임시] true 자리에 isWeapon(this.id)
		if (true) return this.itemExp / Equip.WEAPON_RATIO;
		else return this.itemExp / Equip.ARMOR_RATIO;
	}
	// 이후로도 아이템 경험치 관련 메서드 많이 있음
}

export default Equip;
