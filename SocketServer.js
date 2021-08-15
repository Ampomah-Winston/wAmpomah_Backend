const express = require('express');
const socket = require('socket.io');
const cors = require('cors');
const moment = require('moment');

const app = express();// init express

const corsOptions = {
    "origin": "http://localhost:3000",
    "allowedHeaders":"*",
    'Access-Control-Allow-Origin': "http://localhost:3000"
}

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

class SocketServer{
    constructor(portNumber = 4000){   
        this.port = portNumber;     
    }

    startListening(){
        
        const server = app.listen('4000',() => {
            console.log('socket server running ')
        });

        const IO = socket(server);
        
        IO.on('connection',socket=>{
            console.log('a user connected ', socket.id);
            //inform user he is connected to the server
            // IO.emit('ServerCom',{
            //     composer: 'ServerCom',
            //     title:'welcome',
            //     dir:'in',
            //     msg:'Welcome to Linkers!'
            // });
/////////////////////
            socket.on('join_room', data=>{ 
                socket.join(data.group);
                console.log('time -> ',data.time);
                socket.to(data.group).emit('groupResponse', {
                    composer: 'ServerCom',
                    title:'groupResponse',
                    dir:'out',
                    msg:`${data.author} has joined Linkers!`,
                    time: data.time ? data.time : '00:00:00'
                });
            });

            //receive message to room
            socket.on('send_to_room', data=>{
                //then send message to other group members
                socket.to(data.group).emit('groupResponse', {
                    composer: data.composer,
                    title:'groupResponse',
                    dir:'in',
                    msg:`${data.msg}`,
                    time: data.time ? data.time : '00:00:00'
                });
            })
/////////////////////
            socket.on('flapMessage',data=>{
                data.dir = "out"
                socket.emit('flapMessage', data);
                console.log('Hello winston', data);
            });

            // runs when a user disconnects
            socket.on('disconnect',socket=>{
                console.log('a user disconnected');
                IO.emit('ServerCom', {
                    composer: 'ServerCom',
                    title:'Disconnection',
                    dir:'in',
                    msg:'User disconnected'
                })
            })
        })
    }
}

new SocketServer().startListening();

module.exports = SocketServer;