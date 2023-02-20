import MapleDataEntity from "./MapleDataEntity";
import fs from "fs";
import { Parser as XMLParser } from "xml2js";

/**
 * 서버 실행에 필요한 정적 자원들을 로딩하고
 * 자원에 접근할 수 있는 parser(reader) 를 제공합니다.
 */
class MapleData implements MapleDataEntity, Iterable<MapleData> {
	private _filePath: string;
	private _parser: XMLParser;
	private _loadedData: any;
	private _node: any;

	// 인자로 전달된 경로의 파일을 로딩합니다.
	constructor(path: string) {
		this.checkExt(path);
		this._filePath = path;
		this._parser = new XMLParser();
	}

	private checkExt(path: string) {
		// [임시]
		if (path.includes(".xml")) return true;
		throw new Error("올바르지 않은 경로입니다.");
	}

	// 생성자에서 async가 불가능하므로 별도의 로딩 메서드 제공
	public async loadFile() {
		try {
			const file = await fs.promises.readFile(this._filePath);
			this._loadedData = await this._parser.parseStringPromise(file);
		} catch (err) {
			console.log(`${this._filePath} 로딩에 실패했습니다.`);
			throw err;
		}
	}

	public getChildByPath(path: string) {
		// example : "attack18/info"
		const segment = path.split("/"); // ["attact15", "info"]
		
	}

	getName(): string {
		throw new Error("Method not implemented.");
	}
	getParent(): MapleDataEntity {
		const parentNode = 
		const node = this._node.getParentNode();
	}

	// Iterator
	[Symbol.iterator](): Iterator<MapleData, any, undefined> {
		throw new Error("Method not implemented.");
	}
}
