import { LitElement, html } from "lit";
import { Task } from "@lit/task";
import { customElement, property, query } from "lit/decorators.js";
import { authorizationUrl, finalize } from "./lib";
import { TemplateResultType } from "lit/directive-helpers.js";
import { getCards } from "./utils";
import { map } from "lit/directives/map.js";
const meta = await fetch("/client-metadata.json").then((r) => r.json());

@customElement("my-element")
export class MyElement extends LitElement {
  @property({ type: Number }) count = 0;
  @property({ type: String }) json = "";
  // @property({ type: String }) url = html``;
  @query("input", true) _input!: HTMLInputElement;
  form = html``;

  render() {
    if (!localStorage["atcute-oauth:sessions"]) {
      this.form = html`<input @change="${this._update}" type="text" />`;
    }
    return html`<p class="text-green-500">
        Hello from my template. ${this.count} ${this.json}
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
    return this;
  }

  private async _update() {
    console.log("updating", this._input.value);
    const url = await authorizationUrl(this._input.value, meta);
    // this.url = html`<a href="${url}">authorize</a>`;
    location.assign(url);
  }
  private async _login() {}
  private _increment() {
    this.count++;
  }
  private async _reset() {
    console.log("resetting");
    const resp = await fetch("/foo").then((r) => r.json());
    console.log({ resp });
    this.json = JSON.stringify(resp);
    this.count = 0;
  }
}

@customElement("other-element")
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
      pending: () => html`<p>Processing...</p>`,
    });
  }

  private _task = new Task(this, {
    task: async ([], { signal }) => {
      console.log("loading");
      const session = await finalize(this.params, meta);
      console.log({ session });
      return session;
    },
    args: () => [],
  });
}

@customElement("cards-element")
class Cards extends LitElement {
  cards = [];
  repo = new URLSearchParams(location.search).get("repo");
  render() {
    return this._task.render({
      complete: (cards) => {
        return html`<div
          class="columns-1  sm:columns-2 md:columns-3 lg:columns-2xs gap-4 space-y-4 bg-gray-900 text-white"
        >
          ${map(
            cards,
            (card) =>
              html`<div
                class="break-inside-avoid break-words bg-gray-900 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div>${card.value.text}</div>
                ${map(
                  card.value.links,
                  (link) =>
                    html`<a
                        href=${link.url}
                        class="text-blue-500 hover:underline"
                        >${link.title}</a
                      >${link.description}<img
                        src="${link.image}"
                        alt="caption"
                      />`,
                )}
                <img src=${card.image} alt="card" />
              </div>`,
          )}
        </div>`;
      },
      error: (e) => html`<p>Error: ${e}</p>`,
      pending: () => html`<p>Loading cards...</p>`,
    });
  }
  createRenderRoot() {
    return this;
  }
  private _task = new Task(this, {
    task: async ([], { signal }) => {
      console.log("loading cards");
      const cards = await getCards(this.repo!);
      console.log({ cards });
      return cards;
    },
    args: () => [],
  });
}
