import ComponentsBuilder from "./components.js";
import constants from "./constants.js";

const {
  MESSAGE_RECEIVED,
  ACTIVITYLOG_UPDATED,
  STATUS_UPDATED,
} = constants.events.app;

export default class TerminalController {
  #usersCollors = new Map();

  constructor() {}

  #randomColor() {
    const hex = ((Math.random() * 0xffffff) << 0).toString(16);
    return `#${hex}-fg`;
  }

  #getUserCollor(userName) {
    if (this.#usersCollors.has(userName))
      return this.#usersCollors.get(userName);

    const collor = this.#randomColor();
    this.#usersCollors.set(userName, collor);

    return collor;
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
      const collor = this.#getUserCollor(userName);

      chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`);
      screen.render();
    };
  }

  #onLogChanged({ screen, activityLog }) {
    return (msg) => {
      const [userName] = msg;
      const collor = this.#getUserCollor(userName);
      activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`);

      screen.render();
    };
  }

  #onStatusChanged({ screen, status }) {
    return (users) => {
      const { content } = status.items.shift();
      status.clearItems();
      status.addItem(content);

      users.forEach((userName) => {
        const collor = this.#getUserCollor(userName);
        status.addItem(`{${collor}}{bold}${userName}{/}`);
      });

      screen.render();
    };
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on(MESSAGE_RECEIVED, this.#onMessageReceived(components));
    eventEmitter.on(ACTIVITYLOG_UPDATED, this.#onLogChanged(components));
    eventEmitter.on(STATUS_UPDATED, this.#onStatusChanged(components));
  }

  async initializeTable(eventEmitter) {
    console.log("Initialized 🔥");
    const components = new ComponentsBuilder()
      .setScreen({ title: "HackerChat - Tiago Barros" })
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setActivityLogComponent()
      .setStatusComponent()
      .build();

    this.#registerEvents(eventEmitter, components);
    components.input.focus();
    components.screen.render();

    let users = [
      "Tiago Barros",
      "lucao",
      "sla",
      "alguem",
      "leticia",
      "suave",
      "tlgd",
    ];

    for (users of users) {
      eventEmitter.emit(ACTIVITYLOG_UPDATED, users);
    }
  }
}
