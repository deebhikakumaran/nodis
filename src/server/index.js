// tcp server

const net = require("net");
const config = require("../config");

let conClients = 0;

function runSyncTcpServer() {
    console.log("starting a synchronous TCP server on", config.host, config.port);

    const server = net.createServer((socket) => {
        // this is called everytime new client connects. it handles multiple con clients.
        // libuv handles IO multiplexing under the hood.

        conClients += 1;
        console.log(
            "client connected with address:",
            `${socket.remoteAddress}:${socket.remotePort}`,
            "concurrent clients",
            conClients
        );

        socket.on("data", (buf) => {
            // max read in one shot is 512 bytes

            const cmd = buf.toString();
            console.log("command", cmd);
            respond(cmd, socket);
        });

        socket.on("end", () => {
            conClients -= 1;
            console.log(
                "client disconnected",
                `${socket.remoteAddress}:${socket.remotePort}`,
                "concurrent clients",
                conClients
            );
        });

        socket.on("error", (err) => {
            console.log("err", err.message);
        });
    });

    server.listen(config.port, config.host);
}

function respond(cmd, socket) {
    try {
        socket.write(cmd);
    } 
    catch (err) {
        console.log("err write:", err.message);
    }
}

module.exports = { runSyncTcpServer }