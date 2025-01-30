import { LitElement, css, html } from "lit";
import { Task } from "@lit/task";
import { customElement, property, query } from "lit/decorators.js";
import { authorizationUrl, finalize } from "./lib";
import { TemplateResultType } from "lit/directive-helpers.js";
import { getCards, type Card } from "./utils";
import { map } from "lit/directives/map.js";
import { printFlag } from "@yuler/china-flag";
import "./input";

const meta = await fetch("/client-metadata.json").then((r) => r.json());

@customElement("small-fry")
export class SmallFry extends LitElement {
  @property()
  count: number;
  render() {
    return html`yolo ${this.count}`;
  }
}
@customElement("my-element")
export class MyElement extends LitElement {
  @property()
  count = 0;
  @property({ type: String }) json = "";
  // @property({ type: String }) url = html``;
  @query("input", true) _input!: HTMLInputElement;
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
  @property()
  cards: Card[] = [];
  @property()
  // repo = new URLSearchParams(location.search).get("repo");
  repo = location.pathname.split("/")[2];
  @property()
  loading: string = "";
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

  load_cards(cards: Card[]) {
    return html`<div
        @posted="${async () => {
          this.cards = await getCards(this.repo!);
        }}"
      >
        <input-element repo=${this.repo}></input-element>
      </div>
      <div class="cards-parent">
        ${map(
          cards,
          (card) =>
            html`<div class="card">
              <div>${card.value.text}</div>
              ${map(
                card.value.links,
                (link) =>
                  html`<a href=${link.url} class="text-blue-500 hover:underline"
                      >${link.title}</a
                    >${link.description}<img
                      src="${link.image}"
                      alt="caption"
                    />`,
              )}
              ${card.image ? html`<img src=${card.image} alt="card" />` : ""}
            </div>`,
        )}
      </div>`;
  }
  render() {
    if (this.cards.length == 0) {
      return this._task.render({
        complete: (cards) => {
          return this.load_cards(cards);
        },
        error: (e) => html`<p>Error: ${e}</p>`,
        pending: () => html`<p>Loading cards...</p>`,
      });
    }

    return this.load_cards(this.cards);
    // @import "./styles.css"
  }
  // createRenderRoot() {
  //   return this;
  // }
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
