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

app.get("/", (_: Request, res: Response): void => {
  res.status(200).json({
    message: "Server is running",
    status: 200,
    success: false,
  });
});

app.use("/api/users", UserRouter);

app.use("*", (_: Request, res: Response): void => {
  res.status(404).json({
    message: "Not Found",
    status: 404,
    success: false,
  });
});

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
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  console.info(`Worker ${process.pid} started`);
}
