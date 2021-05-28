import { constants } from './constants.js';

export default class EventManager {
  #allUsers = new Map();
  constructor({ componentEmitter, socketClient }) {
    this.componentEmitter = componentEmitter;
    this.socketClient = socketClient;
  }

  joinRoomAndWaitForMessages(data) {
    this.socketClient.sendMessage(constants.events.socket.JOIN_ROOM, data);

    this.componentEmitter.on(constants.events.app.MESSAGE_SENT, (msg) => {
      this.socketClient.sendMessage(constants.events.socket.MESSAGE, msg);
    });
  }

  updateUsers(users) {
    const connectedUsers = users;
    connectedUsers.forEach(({ id, userName }) =>
      this.#allUsers.set(id, userName)
    );
    this.#updateUsersComponent(this.#allUsers);
  }

  newUserConnected(message) {
    const user = message;
    this.#allUsers.set(user.id, user.userName);
    this.#updateUsersComponent();
  }

  #updateUsersComponent() {
    this.componentEmitter.emit(
      constants.events.app.STATUS_UPDATED,
      Array.from(this.#allUsers.values())
    );
  }

  getEvents() {
    const functions = Reflect.ownKeys(EventManager.prototype)
      .filter((fn) => fn !== 'contructor')
      .map((name) => [name, this[name].bind(this)]);

    return new Map(functions);
  }
}
