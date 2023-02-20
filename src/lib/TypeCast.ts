export const toInt32 = (n: bigint) => {
	try {
		const rv = Number(BigInt.asIntN(32, n));
		return rv;
	} catch (err) {
		console.log(err);
	}
};
