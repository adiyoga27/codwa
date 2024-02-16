import { whatsapp } from "../controllers/whatsapp.controller";

export const initSocket = function (io) {
   
    io.on('connection', function(socket) {
        // console.log('Create session: ' );
        socket.on('init', function(data) {
           const client =  whatsapp.get(data.api_key)?.client;

           if(client?.info?.me){
            io.emit('device', {
                status : 'connected',
                device_id: data.device_id,
                ready :  true,
                name : client.info.pushname,
                phone: client.info.me.user,
                message: `Your whatsapp already connected +${client.info.me.user} / ${client.info.pushname}`
            });
           }
        
        })
        socket.on('status', function(data) {
            
            const deviceId = data.device_id
            setLoading(io, deviceId);
            const client =  whatsapp.get(data.apikey)?.client;
            if(client?.info?.me){
                io.emit('device', {
                    status : 'connected',
                    device_id: deviceId,
                    ready :  true,
                    name : client.info.pushname,
                    phone: client.info.me.user,
                    message: `Your whatsapp already connected +${client.info.me.user} / ${client.info.pushname}`
                });
            }
           
        });
        socket.on('logout', function(data) {
            const deviceId = data.device_id
            setLoading(io, deviceId);
           const client =  whatsapp.get(data.deviceId)?.client;
           client.logout();
            
            io.emit('device', {
                status : 'logout',
                device_id: deviceId,
                ready :  false,
                message: `Your device success for logout`
            });

           
        });
        socket.on('refresh', function(data) {
            const deviceId = data.device_id
            setLoading(io, deviceId);
            
            
        });
        socket.on('service', function(data) {
            const deviceId = data.device_id
            const isActive = data.is_active
            setLoading(io, deviceId);


        });

        socket.on('find', function(data){
            const deviceId = data.device_id
            setLoading(io, deviceId);
         
        })

    });
    
    
}

const setLoading = function(io, deviceId){
    io.emit('device', {
        status : 'loading',
        device_id: deviceId,
        ready :  false,
        message: 'Please waiting !!!'
    });
}
