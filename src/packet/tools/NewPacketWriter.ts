import { Point } from "@/src/lib/Point";
class LittleEndianPacketWriter {
	private buffer: Buffer;
	private offset: number;

	constructor(size: number = 32) {
		this.buffer = Buffer.alloc(size);
		this.offset = 0;
	}

	public getPacket() {
		return this.buffer;
	}

	public toSting() {
		return this.buffer.toString();
	}

	public writeZeroBytes(n: number) {
		for (let i = 0; i < n; i++) {
			this.writeByte(0);
		}
	}

	public writeByte(n: number) {
		this.ensureCapacity(1);
		const used = this.buffer.writeInt8(n, this.offset);

		this.offset = used;
	}

	public writeBytes(n: Uint8Array) {
		for (let i = 0; i < n.length; i++) {
			this.writeByte(n[i]);
		}
	}

	public writeShort(n: number) {
		this.ensureCapacity(2);
		const used = this.buffer.writeInt16LE(n, this.offset);
		this.offset = used;
	}

	public writeInt(n: number) {
		this.ensureCapacity(4);
		const used = this.buffer.writeInt32LE(n, this.offset);
		this.offset = used;
	}

	public writeLong(n: number | bigint) {
		this.ensureCapacity(8);
		const used = this.buffer.writeBigInt64LE(
			typeof n === "bigint" ? n : BigInt(n),
			this.offset
		);
		this.offset = used;
	}

	public writeAsciiString(s: string, max?: number) {
		const ascii = Buffer.from(s, "ascii");
		if (max) {
			if (ascii.length > max) {
				s = s.substring(0, max);
			}
			this.writeBytes(ascii);
			this.writeZeroBytes(max - ascii.length);
		} else {
			this.writeBytes(ascii);
		}
	}

	public writeMapleAsciiString(s: string) {
		const ascii = Buffer.from(s, "ascii");
		// 1. 문자열의 길이를 버퍼에 작성합니다
		this.writeShort(ascii.length);
		// 2. 문자열을 작성합니다
		this.writeAsciiString(s);
	}

	public writeOpcode(code: number) {
		this.writeShort(code);
	}

	private ensureCapacity(byte: number) {
		const g = this.buffer.byteLength - this.offset;
		if (g < byte) {
			this.extend(byte - g);
		}
	}

	private extend(size: number) {
		const oldBuf = this.buffer;
		const oldSize = this.buffer.byteLength;
		this.buffer = Buffer.alloc(oldSize + size);
		oldBuf.copy(this.buffer);
	}
}
export default LittleEndianPacketWriter;
