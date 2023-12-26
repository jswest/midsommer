# Midsommer

A bare-bones implmentation of the self-organizing map algorithm—and a way to visualize it.


## How to use it.

If you're working in just a JavaScript environment, this should work just fine.

```javascript
import { SOM } from "midsommer";

const config = {
	// see config options below.
}

const som = new SOM(config);
som.train(data);
```

Here are the config options you can pass:

- `dimensions`: (integer, required) the number of dimensions in the data that you're trying to pass through the SOM.
- `height`: (integer, required) the length fo the SOM along the y-axis.
- `iterations`: (integer, optional--defaults to `1000`) the number of iterations to run during training, which is useful even if you're planning to iterate manually since it controls the decay in the radius and learning rate.
- `learningRate` (float, optional--defaults to `0.2`) controls how quickly the SOM adapts to training data.
- `radius` (float, optional--defaults to `1.0`) controls how much of the SOM is updated to training data.
- `randomSeed` (integer, optional--defaults to `42`) controls the random initialization of neuron weights across the som.
- `shouldDecay` (boolean, optional--default to `true`) instructs the SOM to decay the learning rate and radius as training progresses.
- `width`: (integer) the length fo the SOM along the x-axis.

For an example of its usage in a Svelte context, pleas see `/src/routes/+page.svelte`.