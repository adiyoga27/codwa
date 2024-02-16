import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Device } from "../entity/Device.entity";
import { generateClientWa } from "./whatsapp.controller";
import path = require("path");
import fs = require("fs");

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
        }
      });
  }
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const clientRepository = AppDataSource.getRepository(Device);
    const device = await clientRepository.findOne({ where: { id: id } });
    if (!device) {
      return res.status(404).json({ 
        status: false,
        message: "Device not found" });
    }
    await clientRepository.delete(id);
    const sessionFolderPath = path.join(__dirname, '../../keystore/session-'+id);
    fs.rmSync(sessionFolderPath, { recursive: true, force: true });
    return res.status(200).json({ 
      status: true,
      message: "Device deleted successfully" });
  }

  static async show(req: Request, res: Response) {
    const { id } = req.params;
    const clientRepository = AppDataSource.getRepository(Device);
    const device = await clientRepository.findOne({ where: { id: id } });
    if (!device) {
      return res.status(404).json({ 
        status: false,
        message: "Device not found" });
    }
    return res.status(200).json({ 
      status: true,
      message: "Device found", data: device });
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { client_name } = req.body;
    const clientRepository = AppDataSource.getRepository(Device);
    const device = await clientRepository.findOne({ where: { id: id } });
    if (!device) {
      return res.status(404).json({ 
        status: false,
        message: "Device not found" });
    }
    await clientRepository.update(id, { client_name: client_name });
    return res.status(200).json({ 
      status: true,
      message: "Device updated successfully" });
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
      message: 'success',
      data: devices
    });
  }
}
