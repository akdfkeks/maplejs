import xml2js from "xml2js";
import fs from "fs";
import MapleClient from "../client/Client";
import PacketReader from "../packet/tools/PacketReader";
import PacketWriter from "../packet/tools/PacketWriter";
import Opcodes from "../packet/tools/Opcodes";
import prisma from "../database/prisma";
import { time } from "console";

const CreateCharacterHandler = async (client: MapleClient, reader: PacketReader) => {
	const name = reader.readMapleAsciiString();
	const face = reader.readInt();
	const hair = reader.readInt();
	const hairColor = 0;
	const skin = 0;
	const top = reader.readInt();
	const bottom = reader.readInt();
	const shoes = reader.readInt();
	const weapon = reader.readInt();
	const str = 12;
	const dex = 5;
	const int = 4;
	const luk = 4;

	// WZ값을 기반으로 성형/헤어 및 아이템값이 유효한지 확인합니다.
	const makeCharInfo = await getMakeCharInfo(client.account.gender > 0 ? true : false);
	if (
		!makeCharInfo.face.includes(face) ||
		!makeCharInfo.hair.includes(hair) ||
		!makeCharInfo.top.includes(top) ||
		!makeCharInfo.bottom.includes(bottom) ||
		!makeCharInfo.shoes.includes(shoes) ||
		!makeCharInfo.weapon.includes(weapon)
	) {
		// 적절한 패킷 보내기 (wz 검증 실패상황)
		return;
	}

	// 캐릭터 등록
	const skel = await prisma.character.create({
		data: {
			acccount: { connect: { id: client.account.id } },
			name,
			face,
			hair: hair + hairColor,
			skin,
			str,
			dex,
			int,
			luk,
			inventory_slot: { create: {} },
		},
	});

	// 기본 아이템 추가
	const items = [
		{ id: top, position: -5 },
		{ id: bottom, position: -6 },
		{ id: shoes, position: -7 },
		{ id: weapon, position: -11 },
	];

	const itemCreationResult = await prisma.inventoryItem.createMany({
		data: items.map((item) => {
			return {
				inventory_type: -1,
				item_id: item.id,
				position: item.position,
				character_id: skel.id,
			};
		}),
	});

	if (itemCreationResult.count < 1) {
		throw new Error("아이템 생성 실패");
	}

	const character = await prisma.character.findUnique({
		where: { id: skel.id },
		include: {
			inventory_item: true,
			inventory_slot: true,
		},
	});
	// console.log(character);

	const packet = new PacketWriter(Opcodes.serverOpcodes.ADD_NEW_CHAR_ENTRY);
	packet.writeByte(0); // 0이면 생성완료 1이면 실패

	// addCharStats
	packet.writeInt(character.id);
	packet.writeString(character.name, 13); // ,13
	packet.writeByte(character.gender ? 1 : 0);
	packet.writeByte(character.skin);
	packet.writeInt(character.face);
	packet.writeInt(character.hair);
	for (let i = 0; i < 8; i++) packet.writeByte(0); // 제로바이트 8개
	packet.writeByte(character.level);
	packet.writeShort(character.job);
	packet.writeShort(character.str);
	packet.writeShort(character.dex);
	packet.writeShort(character.int);
	packet.writeShort(character.luk);
	packet.writeShort(character.hp);
	packet.writeShort(character.max_hp);
	packet.writeShort(character.mp);
	packet.writeShort(character.max_mp);
	packet.writeShort(character.sp);
	packet.writeShort(character.ap);
	packet.writeInt(character.exp);
	packet.writeShort(character.fame);
	packet.writeInt(character.map);
	packet.writeByte(character.spawn_point);

	// addCharLook
	packet.writeByte(character.gender ? 1 : 0);
	packet.writeByte(character.skin);
	packet.writeInt(character.face);
	packet.writeByte(0); // mega???????
	packet.writeInt(character.hair);

	// Calculate Equipments
	const equipments = [];
	const maskedEquipments = [];
	for (const ivItem of character.inventory_item) {
		const itemId = ivItem.item_id;
		if (ivItem.position < -127) continue; // not visible
		const position = ivItem.position * -1;
		if (position < 100) {
			equipments.push({ position, itemId });
		} else if (position > 100 && position != 111) {
			maskedEquipments.push({ position: position - 100, itemId });
			equipments.push({ position: position - 100, itemId });
		}
	}

	// Equipments
	for (const equipment of equipments) {
		packet.writeByte(equipment.position);
		packet.writeInt(equipment.itemId);
	}
	packet.writeByte(-1); // end of visible items

	// Masked Equipment
	for (const maskedEquipment of maskedEquipments) {
		packet.writeByte(maskedEquipment.position);
		packet.writeInt(maskedEquipment.itemId);
	}
	packet.writeByte(-1); //end of masked items

	// etc
	packet.writeInt(0); // cweapon?? 일단 0
	packet.writeInt(0); // ...pet??????

	// ranking
	packet.writeByte(0); // 랭킹표시 1 미표시 0 (1일시 추가패킷 write)

	client.sendPacket(packet);
};

async function getMakeCharInfo(gender: boolean) {
	const makeCharInfo = {
		face: [],
		hair: [],
		top: [],
		bottom: [],
		shoes: [],
		weapon: [],
	};

	const imgFile = await fs.promises.readFile("wz/Etc.wz/MakeCharInfo.img.xml");

	const parser = new xml2js.Parser();

	const result = await parser.parseStringPromise(imgFile.toString());

	for (const type of result.imgdir.imgdir) {
		if (type.$.name !== (gender ? "CharFemale" : "CharMale")) continue;
		for (const charInfo of type.imgdir) {
			switch (Number(charInfo.$.name)) {
				case 0:
					for (const data of charInfo.int) {
						makeCharInfo.face.push(Number(data.$.value));
					}
					break;
				case 1:
					for (const data of charInfo.int) {
						makeCharInfo.hair.push(Number(data.$.value));
					}
					break;
				case 2:
					for (const data of charInfo.int) {
						makeCharInfo.top.push(Number(data.$.value));
					}
					break;
				case 3:
					for (const data of charInfo.int) {
						makeCharInfo.bottom.push(Number(data.$.value));
					}
					break;
				case 4:
					for (const data of charInfo.int) {
						makeCharInfo.shoes.push(Number(data.$.value));
					}
					break;
				case 5:
					for (const data of charInfo.int) {
						makeCharInfo.weapon.push(Number(data.$.value));
					}
					break;
			}
		}
	}

	return makeCharInfo;
}

export default CreateCharacterHandler;
