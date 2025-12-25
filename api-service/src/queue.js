import { Queue } from "bullmq";

export const importQueue = new Queue("imports", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379)
  }
});
