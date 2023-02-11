import fs from "fs";
import xml2js from "xml2js";

class LoginHelper {
	public static instance: LoginHelper = null;
	// static {}

	public static getInstance() {
		if (this.instance == null) this.instance = new LoginHelper();
		return this.instance;
	}

	// true: wz 체크 성공
	public static async checkMakeCharInfo(
		gender: boolean,
		face: number,
		hair: number,
		top: number,
		bottom: number,
		shoes: number,
		weapon: number
	) {
		const makeCharInfo = await LoginHelper.getMakeCharInfos(gender);
		if (
			!makeCharInfo.face.includes(face) ||
			!makeCharInfo.hair.includes(hair) ||
			!makeCharInfo.top.includes(top) ||
			!makeCharInfo.bottom.includes(bottom) ||
			!makeCharInfo.shoes.includes(shoes) ||
			!makeCharInfo.weapon.includes(weapon)
		) {
			// 적절한 패킷 보내기 (wz 검증 실패상황)
			return false;
		}
		return true;
	}

	private static async getMakeCharInfos(gender: boolean) {
		const makeCharInfo = {
			face: new Array<number>(),
			hair: new Array<number>(),
			top: new Array<number>(),
			bottom: new Array<number>(),
			shoes: new Array<number>(),
			weapon: new Array<number>(),
		};

		const imgXml = await fs.promises.readFile("wz/Etc.wz/MakeCharInfo.img.xml");
		const xml = await new xml2js.Parser().parseStringPromise(imgXml.toString());

		for (const type of xml.imgdir.imgdir) {
			if (type.$.name !== (gender ? "CharFemale" : "CharMale")) continue;
			for (const charInfo of type.imgdir) {
				switch (Number(charInfo.$.name)) {
					case 0:
						for (const data of charInfo.int) {
							makeCharInfo.face.push(~~data.$.value);
						}
						break;
					case 1:
						for (const data of charInfo.int) {
							makeCharInfo.hair.push(~~data.$.value);
						}
						break;
					case 2:
						for (const data of charInfo.int) {
							makeCharInfo.top.push(~~data.$.value);
						}
						break;
					case 3:
						for (const data of charInfo.int) {
							makeCharInfo.bottom.push(~~data.$.value);
						}
						break;
					case 4:
						for (const data of charInfo.int) {
							makeCharInfo.shoes.push(~~data.$.value);
						}
						break;
					case 5:
						for (const data of charInfo.int) {
							makeCharInfo.weapon.push(~~data.$.value);
						}
						break;
				}
			}
		}

		return makeCharInfo;
	}

	private constructor() {
		//load
	}
}

export default LoginHelper;
