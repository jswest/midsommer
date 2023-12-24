export class Random {
	#lowercase = "abcdefghijklmnopqrstuvwxyz";
	#seed = Math.random();

	constructor(seed) {
		if (seed) {
			this.#seed = seed;
		}
	}

	rando() {
		const a = 1664525;
		const c = 1013904223;
		const m = Math.pow(2, 32);

		this.#seed = (a * this.#seed + c) % m;
		return this.#seed / m;
	}

	letters(n) {
		let result = "";
		for (let i = 0; i < n; i++) {
			const index = Math.floor(this.rando() * this.#lowercase.length);
			results += alphabet[index];
		}
		return result;
	}

	vector(n) {
		return Array.from({ length: n }, () => this.rando());
	}
}
