import { LitElement, html } from "lit";
import { Task } from "@lit/task";
import { customElement, property } from "lit/decorators.js";
import { authorizationUrl, finalize } from "./lib";
const meta = await fetch("/client-metadata.json").then((r) => r.json());
const url = await authorizationUrl("nandi.weird.one", meta);

@customElement("my-element")
export class MyElement extends LitElement {
  @property({ type: Number }) count = 0;
  @property({ type: String }) json = "";
  render() {
    return html`<p>
        Hello from my template. ${this.count} ${this.json}
        <a href="${url}">authorize</a>
      </p>
      <button @click="${this._increment}">click me</button>
      <button @click="${this._reset}">reset</button>`;
  }
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
      pending: () => html`<p>Loading product...</p>`,
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
