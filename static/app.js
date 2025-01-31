import {
  LitElement,
  __legacyDecorateClassTS,
  authorizationUrl,
  cdnImage,
  css,
  customElement,
  finalize,
  html,
  listRecords,
  notEqual,
  property,
  query,
  resolveHandle
} from "./input.js";

// node_modules/@lit/task/development/task.js
var TaskStatus = {
  INITIAL: 0,
  PENDING: 1,
  COMPLETE: 2,
  ERROR: 3
};
var initialState = Symbol();

class Task {
  get taskComplete() {
    if (this._taskComplete) {
      return this._taskComplete;
    }
    if (this._status === TaskStatus.PENDING) {
      this._taskComplete = new Promise((res, rej) => {
        this._resolveTaskComplete = res;
        this._rejectTaskComplete = rej;
      });
    } else if (this._status === TaskStatus.ERROR) {
      this._taskComplete = Promise.reject(this._error);
    } else {
      this._taskComplete = Promise.resolve(this._value);
    }
    return this._taskComplete;
  }
  constructor(host, task, args) {
    this._callId = 0;
    this._status = TaskStatus.INITIAL;
    (this._host = host).addController(this);
    const taskConfig = typeof task === "object" ? task : { task, args };
    this._task = taskConfig.task;
    this._argsFn = taskConfig.args;
    this._argsEqual = taskConfig.argsEqual ?? shallowArrayEquals;
    this._onComplete = taskConfig.onComplete;
    this._onError = taskConfig.onError;
    this.autoRun = taskConfig.autoRun ?? true;
    if ("initialValue" in taskConfig) {
      this._value = taskConfig.initialValue;
      this._status = TaskStatus.COMPLETE;
      this._previousArgs = this._getArgs?.();
    }
  }
  hostUpdate() {
    if (this.autoRun === true) {
      this._performTask();
    }
  }
  hostUpdated() {
    if (this.autoRun === "afterUpdate") {
      this._performTask();
    }
  }
  _getArgs() {
    if (this._argsFn === undefined) {
      return;
    }
    const args = this._argsFn();
    if (!Array.isArray(args)) {
      throw new Error("The args function must return an array");
    }
    return args;
  }
  async _performTask() {
    const args = this._getArgs();
    const prev = this._previousArgs;
    this._previousArgs = args;
    if (args !== prev && args !== undefined && (prev === undefined || !this._argsEqual(prev, args))) {
      await this.run(args);
    }
  }
  async run(args) {
    args ??= this._getArgs();
    this._previousArgs = args;
    if (this._status === TaskStatus.PENDING) {
      this._abortController?.abort();
    } else {
      this._taskComplete = undefined;
      this._resolveTaskComplete = undefined;
      this._rejectTaskComplete = undefined;
    }
    this._status = TaskStatus.PENDING;
    let result;
    let error;
    if (this.autoRun === "afterUpdate") {
      queueMicrotask(() => this._host.requestUpdate());
    } else {
      this._host.requestUpdate();
    }
    const key = ++this._callId;
    this._abortController = new AbortController;
    let errored = false;
    try {
      result = await this._task(args, { signal: this._abortController.signal });
    } catch (e) {
      errored = true;
      error = e;
    }
    if (this._callId === key) {
      if (result === initialState) {
        this._status = TaskStatus.INITIAL;
      } else {
        if (errored === false) {
          try {
            this._onComplete?.(result);
          } catch {
          }
          this._status = TaskStatus.COMPLETE;
          this._resolveTaskComplete?.(result);
        } else {
          try {
            this._onError?.(error);
          } catch {
          }
          this._status = TaskStatus.ERROR;
          this._rejectTaskComplete?.(error);
        }
        this._value = result;
        this._error = error;
      }
      this._host.requestUpdate();
    }
  }
  abort(reason) {
    if (this._status === TaskStatus.PENDING) {
      this._abortController?.abort(reason);
    }
  }
  get value() {
    return this._value;
  }
  get error() {
    return this._error;
  }
  get status() {
    return this._status;
  }
  render(renderer) {
    switch (this._status) {
      case TaskStatus.INITIAL:
        return renderer.initial?.();
      case TaskStatus.PENDING:
        return renderer.pending?.();
      case TaskStatus.COMPLETE:
        return renderer.complete?.(this.value);
      case TaskStatus.ERROR:
        return renderer.error?.(this.error);
      default:
        throw new Error(`Unexpected status: ${this._status}`);
    }
  }
}
var shallowArrayEquals = (oldArgs, newArgs) => oldArgs === newArgs || oldArgs.length === newArgs.length && oldArgs.every((v, i) => !notEqual(v, newArgs[i]));
// utils.ts
async function getCards(repo) {
  const did = await resolveHandle(repo).then((r) => r.did);
  const cards = await listRecords(repo, "nandi.schemas.card").then((r) => r.records);
  return cards.map((card) => {
    if (card.value.image) {
      card.image = cdnImage(did, card.value.image.ref.$link);
    }
    if (card.value.links) {
      for (const link of card.value.links) {
        link.image = link.image.replace(/^https:\/\/cardyb\.bsky\.app\/v1\/image\?url=/, "");
        link.image = decodeURIComponent(link.image);
      }
    }
    return card;
  });
}

// node_modules/lit-html/development/directives/map.js
function* map(items, f) {
  if (items !== undefined) {
    let i = 0;
    for (const value of items) {
      yield f(value, i++);
    }
  }
}
// node_modules/@yuler/china-flag/mod.js
var colors = {
  r: "#DE2910",
  y: "#FFDE00"
};
var flag = `
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrryrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrryrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrryyyrrrryrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrryyyyyyyrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrryyyrrrryrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrryrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrryrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
`;
function printFlag() {
  const lines = flag.trim().split(`
`);
  for (const line of lines) {
    let print = "";
    const csses = [];
    for (const char of line) {
      const color = colors[char];
      print += `%c %c`;
      csses.push(`background-color: ${color}`, "");
    }
    console.log(print, ...csses);
  }
}
if (false) {
}

// app.ts
var meta = await fetch("/client-metadata.json").then((r) => r.json());

class SmallFry extends LitElement {
  render() {
    return html`yolo ${this.count}`;
  }
}
__legacyDecorateClassTS([
  property()
], SmallFry.prototype, "count", undefined);
SmallFry = __legacyDecorateClassTS([
  customElement("small-fry")
], SmallFry);

class MyElement extends LitElement {
  constructor() {
    super(...arguments);
    this.count = 0;
    this.json = "";
  }
  form = html``;
  render() {
    if (!localStorage["atcute-oauth:sessions"]) {
      this.form = html`<input @change="${this._update}" type="text" />`;
    }
    return html`<p class="text-green-500">
        Hello from my template.
        <small-fry count=${this.count}></small-fry>${this.count} ${this.json}
      </p>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 active:scale-9"
        @click="${this._increment}"
      >
        click me
      </button>
      <button @click="${this._reset}">reset</button>
      ${this.form}`;
  }
  createRenderRoot() {
    console.log(printFlag());
    return this;
  }
  async _update() {
    console.log("updating", this._input.value);
    const url = await authorizationUrl(this._input.value, meta);
    location.assign(url);
  }
  async _login() {
  }
  _increment() {
    this.count++;
  }
  async _reset() {
    console.log("resetting");
    this.count = 0;
  }
}
__legacyDecorateClassTS([
  property()
], MyElement.prototype, "count", undefined);
__legacyDecorateClassTS([
  property({ type: String })
], MyElement.prototype, "json", undefined);
__legacyDecorateClassTS([
  query("input", true)
], MyElement.prototype, "_input", undefined);
MyElement = __legacyDecorateClassTS([
  customElement("my-element")
], MyElement);

class OtherElement extends LitElement {
  params = new URLSearchParams(location.hash.slice(1));
  render() {
    console.log("rendering");
    return this._task.render({
      complete: (session) => {
        location.assign("/");
        html`got session`;
      },
      error: (e) => html`<p>Error: ${e}</p>`,
      pending: () => html`<p>Processing...</p>`
    });
  }
  _task = new Task(this, {
    task: async ([], { signal }) => {
      console.log("loading");
      const session = await finalize(this.params, meta);
      console.log({ session });
      return session;
    },
    args: () => []
  });
}
OtherElement = __legacyDecorateClassTS([
  customElement("other-element")
], OtherElement);

class Cards extends LitElement {
  constructor() {
    super(...arguments);
    this.cards = [];
    this.repo = location.pathname.split("/")[2];
    this.loading = "";
  }
  static styles = css`
    .cards-parent {
      column-count: 1; /* Adjust the number of columns as needed */
      column-gap: 1rem;
      padding: 1rem;
    }
    @media (min-width: 1200px) {
      .cards-parent {
        column-count: 4;
      }
    }
    .card {
      break-inside: avoid; /* Prevent cards from breaking across columns */
      background: #1a1a1a; /* Gray 900 equivalent */
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition:
        transform 0.2s ease-in-out,
        box-shadow 0.2s ease-in-out;
      margin-bottom: 1rem; /* Add some space between cards */
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .card img {
      width: 100%;
      height: auto;
      display: block;
    }

    .card div {
      padding: 1rem;
    }

    .card a {
      display: block;
      margin: 0.5rem 0;
      color: #3182ce;
      text-decoration: none;
    }

    .card a:hover {
      text-decoration: underline;
    }
  `;
  load_cards(cards) {
    return html`<div
        @posted="${async () => {
      this.cards = await getCards(this.repo);
    }}"
      >
        <input-element repo=${this.repo}></input-element>
      </div>
      <div class="cards-parent">
        ${map(cards, (card) => html`<div class="card">
              <div>${card.value.text}</div>
              ${map(card.value.links, (link) => html`<a href=${link.url} class="text-blue-500 hover:underline"
                      >${link.title}</a
                    >${link.description}<img
                      src="${link.image}"
                      alt="caption"
                    />`)}
              ${card.image ? html`<img src=${card.image} alt="card" />` : ""}
            </div>`)}
      </div>`;
  }
  render() {
    if (this.cards.length == 0) {
      return this._task.render({
        complete: (cards) => {
          return this.load_cards(cards);
        },
        error: (e) => html`<p>Error: ${e}</p>`,
        pending: () => html`<p>Loading cards...</p>`
      });
    }
    return this.load_cards(this.cards);
  }
  _task = new Task(this, {
    task: async ([], { signal }) => {
      console.log("loading cards");
      const cards = await getCards(this.repo);
      console.log({ cards });
      return cards;
    },
    args: () => []
  });
}
__legacyDecorateClassTS([
  property()
], Cards.prototype, "cards", undefined);
__legacyDecorateClassTS([
  property()
], Cards.prototype, "repo", undefined);
__legacyDecorateClassTS([
  property()
], Cards.prototype, "loading", undefined);
Cards = __legacyDecorateClassTS([
  customElement("cards-element")
], Cards);
export {
  SmallFry,
  MyElement
};

//# debugId=3FA28B1459EEB3C864756E2164756E21
//# sourceMappingURL=app.js.map
