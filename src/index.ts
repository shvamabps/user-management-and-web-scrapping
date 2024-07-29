import cors from "cors";
import { config } from "dotenv";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import morgan from "morgan";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";

import { UserRouter } from "./routes/users.route";

const app: Application = express();
const numCPUs = availableParallelism();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

config();

const PORT = process.env.PORT as string;

app.get("/", async (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "Server is running",
  });
});

app.use("/api/users", UserRouter);

if (cluster.isPrimary) {
  console.info(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.info(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  console.info(`Worker ${process.pid} started`);
}
