import cluster from "cluster";
import os from "os";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

const totalCPUs = os.cpus().length;
console.log(`Total CPUs: ${totalCPUs}`);

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking ${totalCPUs} workers...`);

  for (let i = 0; i < totalCPUs; i += 1) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`
    );
    cluster.fork();
  });

  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });
} else {
  import("./server.js").then(() => {
    console.log(`Worker ${process.pid} started server`);
  });
}
