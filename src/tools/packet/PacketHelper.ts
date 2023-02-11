import { MapleCharacter } from "@/src/client/MapleCharacter";
import LittleEndianPacketWriter from "@/src/packet/tools/NewPacketWriter";
import lodash from "lodash";

class PacketHelper {
	public static tempLoadCharInfo(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		// 아래 데이터는 모두 DB 에서 받아와야함!!!  임시로 구현//

		// 캐릭터 기본 정보
		pm.writeInt(2); // 고유 ID
		pm.writeAsciiString("dadfsdf", 13); // nickname
		pm.writeByte(0); // gender (0 = male, 1 = female)
		pm.writeByte(0); // skin color
		pm.writeInt(20401); // face
		pm.writeInt(30027); // hair
		pm.writeZeroBytes(8);
		pm.writeByte(0); // level
		pm.writeShort(0); // job

		// 캐릭터 스텟
		pm.writeShort(12); // str
		pm.writeShort(5); // dex
		pm.writeShort(4); // int
		pm.writeShort(4); // luk
		pm.writeShort(50); // hp
		pm.writeShort(50); // max hp
		pm.writeShort(5); // mp
		pm.writeShort(5); // max mp
		pm.writeShort(0); // 남은 AP 포인트
		pm.writeShort(0); // 남은 SP 포인트

		pm.writeInt(0); // exp
		pm.writeShort(0); // fame
		pm.writeInt(0); // current map id
		pm.writeByte(3); // spawnpoint (3이 첫 맵인듯)

		// 캐릭터 외형
		pm.writeByte(0); // gender 얘네 왜 한번 더나오지?
		pm.writeByte(0); // skin
		pm.writeInt(20401); // face
		// job? 화스는 주석처리 되어있다.
		pm.writeByte(0); // mega ? 0 : 1 화스에 mega true 로 하드코딩 되어있음 뭔지모름
		pm.writeInt(30027); // hair

		// 여기서 장비 입혀줘야 하는데 코드가 복잡함 일단 생략해봄

		pm.writeByte(0xff); // end of visible items

		// 여기서 안보이는 장비 입혀주기

		pm.writeByte(0xff); // end of invisible items
	}

	public static addCharStats(pm: LittleEndianPacketWriter, character: MapleCharacter) {
		// 외형 관련 패킷
		pm.writeInt(character.id);
		pm.writeAsciiString(character.name, 13); // , 13);
		pm.writeByte(character.gender > 0 ? 1 : 0); // Male: 0, Female: 1
		pm.writeByte(character.skin);
		pm.writeInt(character.face);
		pm.writeInt(character.hair);

		// 패킷 구분자
		pm.writeZeroBytes(8); // 제로바이트 8개

		pm.writeByte(character.level);
		pm.writeShort(character.job);

		// 스텟 초기화
		pm.writeShort(character.stats.str);
		pm.writeShort(character.stats.dex);
		pm.writeShort(character.stats.int);
		pm.writeShort(character.stats.luk);
		pm.writeShort(character.stats.hp);
		pm.writeShort(character.stats.max_hp);
		pm.writeShort(character.stats.mp);
		pm.writeShort(character.stats.max_mp);

		// 기타
		pm.writeShort(character.remainingAp);

		pm.writeShort(character.remainingSp.reduce((s, v) => s + v, 0)); // 임시
		pm.writeInt(character.exp);
		pm.writeShort(character.fame);
		pm.writeInt(character.map_id);
		pm.writeByte(character.initialSpawnPoint);
	}

	public static addCharLook(pm: LittleEndianPacketWriter, character: MapleCharacter, mega: boolean) {
		pm.writeByte(character.gender > 0 ? 1 : 0); // Male: 0, Female: 1
		pm.writeByte(character.skin);
		pm.writeInt(character.face);
		pm.writeByte(0); // mega???????
		pm.writeInt(character.hair);

		// Calculate Equipments
		const equipments = [];
		const maskedEquipments = [];

		// for (const ivItem of character.getInventory(6)) {
		// 	const itemId = ivItem.id;
		// 	if (ivItem.position < -127) continue; // not visible

		// 	const position = ivItem.position * -1;
		// 	if (position < 100) {
		// 		equipments.push({ position, itemId });
		// 	} else if (position > 100 && position != 111) {
		// 		maskedEquipments.push({ position: position - 100, itemId });
		// 		equipments.push({ position: position - 100, itemId });
		// 	}
		// }

		// // Equipments
		// for (const equip of equipments) {
		// 	pm.writeByte(equip.position);
		// 	pm.writeInt(equip.itemId);
		// }
		pm.writeByte(-1); // end of visible items

		// Masked Equipment
		// for (const maskedEquip of maskedEquipments) {
		// 	pm.writeByte(maskedEquip.position);
		// 	pm.writeInt(maskedEquip.itemId);
		// }
		pm.writeByte(-1); //end of masked items

		// etc
		pm.writeInt(0); // cweapon?? 일단 0 cache weapon 인가?
		pm.writeInt(0); // ...pet??????
	}
}

export default PacketHelper;
