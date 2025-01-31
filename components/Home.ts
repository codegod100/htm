import { printFlag } from "@yuler/china-flag";
import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { authorizationUrl, getProfile } from "../lib";
const meta = await fetch("/client-metadata.json").then((r) => r.json());
const sessions = JSON.parse(localStorage["atcute-oauth:sessions"]);
const did = Object.keys(sessions)[0];
const profile = await getProfile(did);
const handle = profile.handle;
console.log({ did, profile });
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
    return html`
      <div>Hello ${handle}</div>
      <a href=${`/cards/${handle}`}>view cards</a>
      <p>${this.count} ${this.json}</p>
      <button @click="${this._increment}">click me</button>
      <button @click="${this._reset}">reset</button>
      ${this.form}
    `;
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
