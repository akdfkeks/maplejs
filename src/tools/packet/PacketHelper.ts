import Item from "@/src/client/inventory/Item";
import { MapleCharacter } from "@/src/client/MapleCharacter";
import LittleEndianPacketWriter from "@/src/packet/tools/NewPacketWriter";
import lodash from "lodash";

class PacketHelper {
	public static addCharStats(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		// 외형 관련 패킷
		pm.writeInt(character.id);
		pm.writeAsciiString(character.name, 13); // , 13);
		pm.writeByte(character.gender > 0 ? 1 : 0); // Male: 0, Female: 1
		pm.writeByte(character.skin);
		pm.writeInt(character.face);
		pm.writeInt(character.hair);

		pm.writeZeroBytes(8); // 제로바이트 8개

		pm.writeByte(character.level);
		pm.writeShort(character.job);

		pm.writeShort(character.stats.str);
		pm.writeShort(character.stats.dex);
		pm.writeShort(character.stats.int);
		pm.writeShort(character.stats.luk);
		pm.writeShort(character.stats.hp);
		pm.writeShort(character.stats.max_hp);
		pm.writeShort(character.stats.mp);
		pm.writeShort(character.stats.max_mp);

		// 기타
		pm.writeShort(character.remainingSp.reduce((s, v) => s + v, 0));
		pm.writeShort(character.remainingAp);
		pm.writeInt(character.exp);
		pm.writeShort(character.fame);
		pm.writeInt(character.map_id);
		pm.writeByte(character.initialSpawnPoint);
	}

	public static addCharLook(pm: LittleEndianPacketWriter, character: MapleCharacter, mega: boolean) {
		pm.writeByte(character.gender > 0 ? 1 : 0); // Male: 0, Female: 1
		pm.writeByte(character.skin);
		pm.writeInt(character.face);
		pm.writeByte(mega ? 0 : 1); // mega???????
		pm.writeInt(character.hair);

		// Calculate Equipments
		// Map<position, item_id>
		const myEquip = new Map<number, number>();
		const maskedEquip = new Map<number, number>();

		const equip = character.getInventory(6);

		for (const ivItem of equip.getCopiedItemList()) {
			// console.log(ivItem);
			if (ivItem.position < -127) continue; // not visible

			const position = ivItem.position * -1;
			if (position < 100) {
				// myEquip.push({ position, itemId });
				myEquip.set(position, ivItem.itemCode);
			} else if (position > 100 && position != 111) {
				myEquip.set(position - 100, ivItem.itemCode);
				maskedEquip.set(position - 100, ivItem.itemCode);
			}
		}

		// Equipments
		for (const equip of myEquip) {
			pm.writeByte(equip[0]);
			pm.writeInt(equip[1]);
		}
		pm.writeByte(-1); // end of visible items

		// Masked Equipment
		for (const equip of maskedEquip) {
			pm.writeByte(equip[0]);
			pm.writeInt(equip[1]);
		}
		pm.writeByte(-1); //end of masked items

		// etc
		const cWeapon: Item = equip.getItem(-111);
		pm.writeInt(cWeapon ? cWeapon.itemCode : 0); // cweapon?? 일단 0 cache weapon 인가?
		pm.writeInt(0); // ...pet??????
	}
}

export default PacketHelper;
