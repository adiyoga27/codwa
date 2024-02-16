import path = require("path");
import fs = require("fs");
import { AppDataSource } from "../data-source";
import { Device } from "../entity/Device.entity";
import { phoneNumberFormatter } from "../helpers/formatter";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { io } from "..";

// import { Client, LocalAuth, MessageMedia, Message  } from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia, Message  } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

dotenv.config();

const clientRepository = AppDataSource.getRepository(Device);
export const whatsapp = new Map();
export async function initializeWhatsapp() {
    const deviceRepository = AppDataSource.getRepository(Device);
    const devices = await deviceRepository.find();
    devices.forEach(async (device) => {
        generateClientWa(device.id);
    });
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
        clientRepository.update(id, {device_status: 'SCAN_QR', device_phone: null, device_name: null});
        qrcode.generate(qr, {small: true});
        qrcode.toDataURL(qr, (err, url) => {
            io.emit('device', {
                status : 'SCAN_QR',
                device_id: id,
                ready :  false,
                qr: url,
                message: 'Please scan your whatsapp !!!'
    
            });
          });
        console.log('QR RECEIVED', qr);
    });
    
    client.on('ready', () => {
        clientRepository.update(id, {device_status: 'CONNECTED', device_phone: client.info.me.user, device_name: client.info.pushname});
        io.emit('device', {
            status : 'CONNECTED',
            device_id: id,
            ready :  true,
            name : client.info.me.user,
            phone: client.info.pushname,
            message: `Your whatsapp already connected +${client.info.me.user} / ${client.info.pushname}`
        });
        console.log('Client is ready!');

    });

    client.on('disconnected', async (reason)  =>  {
        console.log('disconnected', reason);
        io.emit('message', { id: id, text: 'Whatsapp is disconnected!' });
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
        io.emit('device', {
            status : 'CONNECTED',
            device_id: id,
            ready :  true,
        });
    });
    client.on('auth_failure', function() {
        io.emit('message', { id: id, text: 'Auth failure, restarting...' });
        io.emit('device', {
            status : 'DISCONNECTED',
            device_id: id,
            ready :  false,
            message: 'Auth failure, restarting...'
        });
      });
    
    client.initialize();
     
    //Save to map
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
