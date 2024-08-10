# Midsommer

A bare-bones implmentation of the self-organizing map algorithm—and a way to visualize it.

![An animated GIF of a self-organizing map created with Midsommer](https://github.com/jswest/midsommer/blob/main/midsommer.gif?raw=true)

_(An animated GIF of the first 10 iterations of a self-organizing map represenging the ~300-odd book I've read since 2020. Created with Midsommer.)_

## What is a self-organizing map?

A SOM is a neural network that can be used to reduce the dimensions of a n-length vector. It was inveted by Teuvo Kohonen in the '80s. For more, check out [Wikipedia](https://en.wikipedia.org/wiki/Self-organizing_map).

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

For an example of its usage in a Svelte context, please see `/src/routes/+page.svelte`.

## The example.

Run `npm run dev -- --open` to see the example application, which shows a self-organizing map of senators in the 117th congress. The vectors are descriptions of their votes.

The data for the example is drawn from [Voteview](https://voteview.com) data for the Senate during the 117th Congress.

>Lewis, Jeffrey B., Keith Poole, Howard Rosenthal, Adam Boche, Aaron Rudkin, and Luke Sonnet (2023). Voteview: Congressional Roll-Call Votes Database. https://voteview.com/
