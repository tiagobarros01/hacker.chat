import Events from 'events';
import CliConfig from './src/cliConfig.js';
import SocketCLient from './src/socket.js';
import TerminalController from './src/terminalController.js';

const [nodePath, filePath, ...commands] = process.argv;
const config = CliConfig.parseArguments(commands);
const componentEmitter = new Events();

const socketCLient = new SocketCLient(config)
await socketCLient.initialize()

// const controller = new TerminalController();

// await controller.initializeTable(componentEmitter)
