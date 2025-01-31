import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { finalize } from "../lib";
const meta = await fetch("/client-metadata.json").then((r) => r.json());
@customElement("callback-element")
class Callback extends LitElement {
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
