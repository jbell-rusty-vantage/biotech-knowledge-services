import { startServer } from "./server.js";

startServer()
  .then((server) => {
    let stopping = false;
    const shutdown = async (signal: string) => {
      if (stopping) return;
      stopping = true;
      console.log(`${signal}: draining`);
      await server.stop();
      await server.driver.close();
      process.exit(0);
    };
    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
  })
  .catch((error: unknown) => {
    console.error("failed to start bks-graphql-api:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
