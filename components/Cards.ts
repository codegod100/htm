import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getCards, type Card } from "../utils";
import { Task } from "@lit/task";
import { map } from "lit/directives/map.js";
import "./Input";

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
