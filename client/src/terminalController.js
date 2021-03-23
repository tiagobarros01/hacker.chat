import ComponentsBuilder from "./components.js";
import constants from "./constants.js";

const {
  MESSAGE_RECEIVED,
  ACTIVITYLOG_UPDATED,
  STATUS_UPDATED,
} = constants.events.app;

export default class TerminalController {
  #userscolors = new Map();

  constructor() {}

  #randomColor() {
    const hex = ((Math.random() * 0xffffff) << 0).toString(16);
    return `#${hex}-fg`;
  }

  #getUsercolor(userName) {
    if (this.#userscolors.has(userName))
      return this.#userscolors.get(userName);

    const color = this.#randomColor();
    this.#userscolors.set(userName, color);

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
      const color = this.#getUsercolor(userName);

      chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`);
      screen.render();
    };
  }

  #onLogChanged({ screen, activityLog }) {
    return (msg) => {
      const [userName] = msg;
      const color = this.#getUsercolor(userName);
      activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`);

      screen.render();
    };
  }

  #onStatusChanged({ screen, status }) {
    return (users) => {
      const { content } = status.items.shift();
      status.clearItems();
      status.addItem(content);

      users.forEach((userName) => {
        const color = this.#getUsercolor(userName);
        status.addItem(`{${color}}{bold}${userName}{/}`);
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
