import * as express from "express";
import { authentification } from "../middleware/authentification";
import { authorization } from "../middleware/authorization";
import { WhatsappController } from "../controllers/whatsapp.controller";
const Router = express.Router();

Router.post("/send-message", authentification, WhatsappController.sendMessage);
Router.post("/send-media", authentification, WhatsappController.sendMessageMedia);

export { Router as whatsappRouter };
