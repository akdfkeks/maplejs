import * as crypto from "crypto";

class Randomizer {
	public static nextLong() {
		return BigInt("0x" + crypto.randomBytes(8).toString("hex"));
	}
}

export default Randomizer;

class Random {}
