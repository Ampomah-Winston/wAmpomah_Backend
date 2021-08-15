const IO = require('socket.io-client');

class Socket{
    constructor(port='http://localhost:4000'){
        this.port = port;
    }
    async connect(){
        console.log("hello hi");
        IO(this.port);
    }
}

new Socket().connect();



module.exports = Socket;