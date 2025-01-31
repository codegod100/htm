import { printFlag } from "@yuler/china-flag";
import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { authorizationUrl } from "../lib";
const meta = await fetch("/client-metadata.json").then((r) => r.json());
@customElement("home-element")
export class Home extends LitElement {
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
