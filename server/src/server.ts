import { Server } from "http";
import app from "./app";
import { closeMongo, connect } from "./utils/db";
import { ENV_DATA } from "./utils/envData";

let server: Server;

async function runServer() {
  await connect();
  const PORT = ENV_DATA.PORT || 3000;
  server = app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
}

runServer();

function gracefulShutdown() {
  if (!server) {
    console.log("server not connected");
    process.exit(1);
  }

  server.close(async () => {
    try {
      // close your database connection here
      await closeMongo();
      process.exit(0);
    } catch (err: any) {
      console.log("error during graceful shutdown", { reason: err.message });
      process.exit(1);
    }
  });
}

process.on("unhandledRejection", (reason, promise) => {
  console.log("unhandled rejection", { promise, reason });
});

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
