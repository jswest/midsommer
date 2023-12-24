export function cosine(a, b) {
	if (a.length !== b.length) {
		throw new Error('You must pass arrays with the same number of dimensions!');
		return;
	}
	let dot = 0;
	let na = 0;
	let nb = 0;
	for (let i = 0; i < a.length; i++) {
		dot += a[i] * b[i];
		na += a[i] * a[i];
		nb += b[i] * b[i];
	}
	na = Math.sqrt(na);
	nb = Math.sqrt(nb);
	return na === 0 || nb === 0 ? 0 : dot / (na * nb);
}