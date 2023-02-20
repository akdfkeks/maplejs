class StringUtil {
	public static getLeftPaddedStr(input: string, padchar: string, length: number) {
		return input.padStart(length, padchar);
	}
}

export default StringUtil;
