import { Random } from "$lib/classes/random.js";

export class SOM {
  #dimensions = 0;
  #initialLearningRate = 0.2;
  #initialRadius = 1;
  #iteration = 0;
  #iterations = 1000;
  #learningRate = 0.2;
  #map = null;
  #radius = 1;
  #randomSeed = 42;
  #shouldDecay = true;
  #size = {
    height: 0,
    width: 0,
  };

  constructor({
    decay,
    dimensions,
    height,
    iterations,
    learningRate,
    radius,
    randomSeed,
    shouldDecay,
    width,
  }) {
    if (!dimensions) {
      throw new Error('You must pass "dimensions" to the constructor.');
      return;
    }
    if (!height) {
      throw new Error('You must pass "height" to the constructor.');
      return;
    }
    if (!width) {
      throw new Error('You must pass "width" to the constructor.');
      return;
    }

    this.#dimensions = dimensions;
    this.#size = {
      height,
      width,
    };

    if (iterations) {
      this.#iterations = iterations;
    }
    if (learningRate) {
      this.#initialLearningRate = learningRate;
      this.#learningRate = learningRate;
    }
    if (radius) {
      this.#initialRadius = radius;
      this.#radius = radius;
    }
    if (randomSeed) {
      this.#randomSeed = randomSeed;
    }
    if (shouldDecay === false) {
      this.#shouldDecay = false;
    }

    const random = new Random(this.#randomSeed);

    this.#map = new Array(this.#size.width);
    for (let x = 0; x < this.#size.width; x++) {
      this.#map[x] = new Array(this.#size.height);
      for (let y = 0; y < this.#size.height; y++) {
        this.#map[x][y] = new Float64Array(random.vector(this.#dimensions));
      }
    }
  }

  get map() {
    return this.#map;
  }

  #decay(iteration) {
    this.#learningRate =
      this.#initialLearningRate * (1 - iteration / this.#iterations);
    this.#radius = this.#initialRadius * (1 - iteration / this.#iterations);
  }

  #euclid(a, b) {
    let distance = 0;
    for (let i = 0; i < a.length; i++) {
      let difference = a[i] - b[i];
      distance += difference * difference;
    }
    return Math.sqrt(distance);
  }

  #gauss(distance) {
    return Math.exp(-Math.pow(distance, 2) / (2 * Math.pow(this.#radius, 2)));
  }

  #getBestMatch(vector) {
    let bmu = null;
    let min = Infinity;
    for (let x = 0; x < this.#size.width; x++) {
      for (let y = 0; y < this.#size.height; y++) {
        const neuron = this.#map[x][y];
        const distance = this.#euclid(vector, neuron);
        if (Number.isNaN(distance)) {
          return false;
        }
        if (distance < min) {
          min = distance;
          bmu = { neuron, x, y };
        }
      }
    }
    return bmu;
  }

  iterate(data, iteration) {
    for (let i = 0; i < data.length; i++) {
      const bmu = this.#getBestMatch(new Float64Array(data[i]));
      if (!bmu) {
        return false;
      }
      this.#update({
        bmu,
        vector: data[i],
      });
    }
    this.#decay(iteration);
    this.#iteration = iteration;
    return true;
  }

  train(data) {
    for (let iteration = 0; iteration < this.#iterations; iteration++) {
      this.iterate(data, iteration);
    }
  }

  #update({ bmu, vector }) {
    for (let x = 0; x < this.#size.width; x++) {
      for (let y = 0; y < this.#size.height; y++) {
        const neuron = this.#map[x][y];
        const distance = this.#euclid([x, y], [bmu.x, bmu.y]);
        const influence = this.#gauss(distance);
        for (let i = 0; i < this.#dimensions; i++) {
          neuron[i] += this.#learningRate * influence * (vector[i] - neuron[i]);
        }
      }
    }
  }

  winner(vector) {
    return this.#getBestMatch(vector);
  }
}
