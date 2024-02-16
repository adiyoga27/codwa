import * as express from "express";
import { authentification } from "../middleware/authentification";
import { authorization } from "../middleware/authorization";
import { DeviceController } from "../controllers/device.controller";
const Router = express.Router();

Router.get(
  "/clients",
  authentification,
  DeviceController.getClients
);

Router.post("/add", authentification, DeviceController.add);

export { Router as clientRouter };
