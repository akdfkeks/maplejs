import LittleEndianPacketWriter from "../packet/tools/NewPacketWriter";
import Randomizer from "../server/Randomizer";
import { toInt32 } from "../lib/TypeCast";

class PlayerRandomStream {
	private m_s1: bigint;
	private m_past_s1: bigint;
	private m_s2: bigint;
	private m_past_s2: bigint;
	private m_s3: bigint;
	private m_past_s3: bigint;

	constructor() {
		const v4 = 5;
		this.CRand32__Seed(
			Randomizer.nextLong(),
			BigInt(1170746341 * v4 - 755606699),
			BigInt(1170746341 * v4 - 755606699)
		);
	}

	public CRand32__Seed(s1: bigint, s2: bigint, s3: bigint) {
		this.m_s1 = s1 | 0x100000n;
		this.m_past_s1 = s1 | 100000n;
		this.m_s2 = s2 | 0x1000n;
		this.m_past_s2 = s2 | 0x1000n;
		this.m_s3 = s3 | 0x10n;
		this.m_past_s3 = s3 | 0x10n;
	}

	public CRand32__Random() {
		let result;
		let v4, v5, v6, v7, v8, v9, v10;
		v4 = this.m_s1;
		v5 = this.m_s2;
		v6 = this.m_s3;
		v7 = this.m_s1;
		this.m_past_s1 = this.m_s1;
		v8 = ((v4 & 0xfffffffen) << 12n) ^ (((v7 & 0x7ffc0n) ^ (v4 >> 13n)) >> 6n);
		this.m_past_s2 = v5;
		v9 = (16n * (v5 & 0xfffffff8n)) ^ (((v5 >> 2n) ^ (v5 & 0x3f800000n)) >> 23n);
		this.m_past_s3 = v6;
		v10 = ((v6 & 0xfffffff0n) << 17n) ^ (((v6 >> 3n) ^ (v6 & 0x1fffff00n)) >> 8n);
		this.m_s3 = v10;
		this.m_s1 = v8;
		this.m_s2 = v9;
		result = v8 ^ v9 ^ v10;
		return result & 0xffffffffn;
	}

	public connectData(pm: LittleEndianPacketWriter) {
		let v5 = this.CRand32__Random();
		let s2 = this.CRand32__Random();
		let v6 = this.CRand32__Random();

		// 시드 초기화
		this.CRand32__Seed(v5, s2, v6);

		pm.writeInt(toInt32(v5)); // 얘네 세놈 다 bigint임
		pm.writeInt(toInt32(s2));
		pm.writeInt(toInt32(v6));
	}
}

export default PlayerRandomStream;
