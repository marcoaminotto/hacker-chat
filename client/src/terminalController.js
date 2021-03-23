import ComponentsBuilder from './components.js';
import { constants } from './constants.js';

export default class TerminalController {
  #userColors = new Map();
  constructor() {}

  #pickColor() {
    return `#${(((1 << 24) * Math.random()) | 0).toString(16)}-fg`;
  }

  #getUserColor(userName) {
    if (this.#userColors.has(userName)) return this.#userColors.get(userName);

    const color = this.#pickColor();
    this.#userColors.set(userName, color);

    return color;
  }

  #onInputReceived(eventEmitter) {
    return function () {
      const message = this.getValue();
      console.log(message);
      this.clearValue();
    };
  }

  #onMessageReceived({ screen, chat }) {
    return (msg) => {
      const { userName, message } = msg;
      const color = this.#getUserColor(userName);
      chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`);
      screen.render();
    };
  }

  #onLogUpdated({ screen, log }) {
    return (msg) => {
      const [userName] = msg.split(/\s/);
      const color = this.#getUserColor(userName);
      log.addItem(`{${color}}{bold}${msg.toString()}{/}`);
      screen.render();
    };
  }

  #onStatusUpdated({ screen, status }) {
    return (users) => {
      const { content } = status.items.shift();
      status.clearItems();
      status.addItem(content);

      users.forEach((userName) => {
        const color = this.#getUserColor(userName);
        status.addItem(`{${color}}{bold}${userName}{/}`);
      });

      screen.render();
    };
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on(
      constants.events.app.MESSAGE_RECEIVERD,
      this.#onMessageReceived(components)
    );
    eventEmitter.on(
      constants.events.app.MESSAGE_SENT,
      this.#onMessageReceived(components)
    );
    eventEmitter.on(
      constants.events.app.LOG_UPDATED,
      this.#onLogUpdated(components)
    );
    eventEmitter.on(
      constants.events.app.STATUS_UPDATED,
      this.#onStatusUpdated(components)
    );
  }

  async initializeTable(eventEmitter) {
    const components = new ComponentsBuilder()
      .setScreen({ title: 'HackerChat - Marco Echevestre' })
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setLogComponent()
      .setStatusComponent()
      .build();

    this.#registerEvents(eventEmitter, components);
    components.input.focus();
    components.screen.render();
  }
}
