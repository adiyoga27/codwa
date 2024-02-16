import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Device } from "../entity/Device.entity";
import { User } from "../entity/User.entity";
import { generateClientWa } from "./whatsapp.controller";

export class DeviceController {
  
  static async add(req: Request, res: Response) {
   
    const { client_name } = req.body;
    const device = new Device();
    device.client_name = client_name;
    device.user_id = req[" currentUser"].id;
  

    const clientRepository = AppDataSource.getRepository(Device);
    await clientRepository.save(device);

    await generateClientWa(device.id);
    return res
    .status(200)
    .json({ 
      status: true,
      message: "User created successfully", 
      data: {
        client_name: client_name
      } });
  }
  static async getClients(req: Request, res: Response) {
    if (!req[" currentUser"]) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const clientRepository = AppDataSource.getRepository(Device);
    const devices = await clientRepository.find({
      where: { user_id: req[" currentUser"].id },
    });
    return res.status(200).json({ 
      status: true,
      message : 'success',
      data : devices
     });
  }
}
