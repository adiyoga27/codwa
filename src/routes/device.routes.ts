import * as express from "express";
import { authentification } from "../middleware/authentification";
import { authorization } from "../middleware/authorization";
import { DeviceController } from "../controllers/device.controller";
const Router = express.Router();

Router.get(
  "/",
  authentification,
  DeviceController.getClients
);
Router.get(
  "/:id",
  authentification,
  DeviceController.show
);
Router.delete(
  "/:id",
  authentification,
  DeviceController.delete
);
Router.put

Router.post("/add", authentification, DeviceController.add);

export { Router as clientRouter };
