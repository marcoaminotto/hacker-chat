import SocketServer from './socket.js';
import Events from 'events';
import { constants } from './constants.js';
import Controller from './controller.js';

const eventEmitter = new Events();

const port = process.env.PORT || 3333;
const socketServer = new SocketServer({ port });
const server = await socketServer.initialize(eventEmitter);
console.log('Socket server is running at', server.address().port);

const controller = new Controller({ socketServer });
eventEmitter.on(
  constants.events.NEW_USER_CONNECTED,
  controller.onNewConnection.bind(controller)
);
