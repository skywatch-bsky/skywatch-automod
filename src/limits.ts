import { pRateLimit } from "p-ratelimit"; // TypeScript

// create a rate limiter that allows up to 30 API calls per second,
// with max concurrency of 10
export const limit = pRateLimit({
  interval: 30000, // 1000 ms == 1 second
  rate: 280, // 30 API calls per interval
  concurrency: 48, // no more than 10 running at once
  maxDelay: 0, // an API call delayed > 30 sec is rejected
});
