import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { connectRedis } from "./app/config/redis.config";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to DB!");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
  await connectRedis();
  await seedSuperAdmin();
})();

// Unhandled rejection error
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection detected. Server is shutting down!", err);

  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  }
  process.exit(1);
});

// Uncaught exception error
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception detected. Server is shutting down!", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Signal termination (SigTerm)
process.on("SIGTERM", () => {
  console.log("Signal termination detected, Server is shutting down");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// Signal interruption (SigInt)
process.on("SIGINT", () => {
  console.log("Signal interruption detected, Server is shutting down");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
