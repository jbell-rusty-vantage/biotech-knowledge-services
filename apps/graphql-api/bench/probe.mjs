// Benchmark-only preload (node --import bench/probe.mjs dist/main.js): answers IPC memory/GC probes. Never in the image.
import { monitorEventLoopDelay, PerformanceObserver } from "node:perf_hooks";

const loop = monitorEventLoopDelay({ resolution: 10 });
loop.enable();
const gc = { count: 0, totalMs: 0, maxMs: 0 };
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    gc.count++;
    gc.totalMs += e.duration;
    gc.maxMs = Math.max(gc.maxMs, e.duration);
  }
}).observe({ entryTypes: ["gc"] });
process.on("message", (message) => {
  if (!message || message.op !== "memory") return;
  if (message.gc && globalThis.gc) globalThis.gc();
  const m = process.memoryUsage();
  const mb = (b) => Math.round((b / 1024 / 1024) * 10) / 10;
  process.send({
    id: message.id,
    memory: {
      rss: mb(m.rss),
      heapUsed: mb(m.heapUsed),
      heapTotal: mb(m.heapTotal),
      maxRss: Math.round(process.resourceUsage().maxRSS / 1024),
      eventLoopP99Ms: Math.round(loop.percentile(99) / 1e5) / 10,
      gc: { count: gc.count, totalMs: Math.round(gc.totalMs), maxMs: Math.round(gc.maxMs * 10) / 10 },
    },
  });
  loop.reset();
});
