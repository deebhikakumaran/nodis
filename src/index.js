// main file

const config = require("./config")
const { runSyncTcpServer } = require("./server");

function setupFlags() {
    // node src/index.js --host=0.0.0.0 --port=7379
    
    const args = process.argv.slice(2);
    for (const arg of args) {
        const [keyRaw, value] = arg.replace(/^--/, "").split("=");
        if (keyRaw === "host" && value) {
            config.host = value;
        } 
        else if (keyRaw === "port" && value) {
            config.port = parseInt(value, 10);
        }
    }
}

function main() {
  setupFlags();
  console.log("spinning up nodis:)");
  runSyncTcpServer();
}

main();
