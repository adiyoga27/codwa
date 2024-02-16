import { AppDataSource } from "./data-source";
import * as express from "express";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { userRouter } from "./routes/user.routes";
import "reflect-metadata";
import { errorHandler } from "./middleware/errorHandler";
import { clientRouter } from "./routes/device.routes";
import { initializeWhatsapp } from "./controllers/whatsapp.controller";
import { whatsappRouter } from "./routes/whatsapp.routes";
import { Server } from 'socket.io';
import { createServer } from 'http';
import { initSocket } from "./routes/socket.routes";
dotenv.config();

const app = express();
app.use(express.json());
const { PORT = 3000 } = process.env;
app.use(errorHandler);
app.use("/api/auth", userRouter);
app.use("/api/client", clientRouter);
app.use("/api", whatsappRouter);

app.get("*", (req: Request, res: Response) => {
  res.status(505).json({ message: "Bad Request" });
});
const httpServer = createServer(app);
   export const io = new Server(httpServer, {
      /* options */
    });
AppDataSource.initialize()
  .then(async () => {
    // app.listen(PORT, () => {
    //   console.log("Server is running on http://localhost:" + PORT);
    // });
    console.log("Data Source has been initialized!");
    
    initializeWhatsapp();
    initSocket(io);
    
  })
  .catch((error) => console.log(error));
  httpServer.listen(PORT);

