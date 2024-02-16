import path = require("path");
import fs = require("fs");
import { AppDataSource } from "../data-source";
import { Device } from "../entity/Device.entity";
import { phoneNumberFormatter } from "../helpers/formatter";
import * as dotenv from "dotenv";
import { Request, Response } from "express";

// import { Client, LocalAuth, MessageMedia, Message  } from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia, Message  } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

dotenv.config();

const whatsapp = new Map();
const clientRepository = AppDataSource.getRepository(Device);
export async function initializeWhatsapp() {
    const deviceRepository = AppDataSource.getRepository(Device);
    const devices = await deviceRepository.find();
    console.log(devices)

    devices.forEach(async (device) => {
        generateClientWa(device.id);
    });
    // const clientRepository = AppDataSource.getRepository(Device);
    // const clients = await clientRepository.find();
    // console.log(clients)
}

export async function generateClientWa(id: string){
    const client = new Client({ 
        authStrategy: new LocalAuth({
            clientId: id,
            dataPath: './keystore'
        }),
        puppeteer: { 
            headless: true,
            executablePath: process.env.CHROME_PATH,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
                '--disable-gpu'
            ]
        } 
    });
    

    client.on('qr', (qr) => {
        clientRepository.update(id, {device_status: 'DISCONNECTED', device_phone: null, device_name: null});
        qrcode.generate(qr, {small: true});
        console.log('QR RECEIVED', qr);
    });
    
    client.on('ready', () => {
        clientRepository.update(id, {device_status: 'CONNECTED', device_phone: client.info.me.user, device_name: client.info.pushname});

        console.log('Client is ready!');

    });

    client.on('disconnected', async (reason)  =>  {
        console.log('disconnected', reason);
            clientRepository.update(id, {device_status: 'DISCONNECTED', device_phone: null, device_name: null});
        const sessionFolderPath = path.join(__dirname, '../../keystore/session-'+id);
        fs.rmSync(sessionFolderPath, { recursive: true, force: true });
            client.initialize();
            

    });
    client.on('change_state', (state)  => {
        console.log('STATE', state);
    });
    client.on('authenticated', (session) => {
        console.log('AUTHENTICATED', session);
    });
    
    client.initialize();
     
    whatsapp.set(id, client);

}

export class WhatsappController {

    static async sendMessage(req: Request, res: Response){
        const { device_id, phone, message } = req.body;
        const client = whatsapp.get(device_id);
        const phoneNumber = phoneNumberFormatter(phone);
         client.sendMessage(phoneNumber, message).then((response) => {
            return res
            .status(200)
            .json({ 
                status: true,
                message: "Sendding Success",
                device : client.state,
                data: response._data
            });
        }).catch((error) => {
            return res
            .status(500)
            .json({
                status: false,
                message: "Sending Failed",
                })
            });
    
    }
    static async sendMessageMedia(req: Request, res: Response){
        const { device_id, phone, message , url} = req.body;
        const media = await MessageMedia.fromUrl(url);
        console.log(media);
        if(media.filesize/1024 > 64){
            return res
            .status(400)
            .json({ 
                status: false,
                message: "File size too large",
            });
        }
        const client = whatsapp.get(device_id);
        const phoneNumber = phoneNumberFormatter(phone);
         client.sendMessage(phoneNumber, media, {caption: message}).then((response) => {
            return res
            .status(200)
            .json({ 
                status: true,
                message: "Sending Success",
                data: response._data,

            });
        }).catch((error) => {
            return res
            .status(500)
            .json({
                status: false,
                message: "Sending Failed",
                })
            });
        
    }
}
