import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { metadata, post } from "./lib";
const meta = await fetch("/client-metadata.json").then((r) => r.json());
@customElement("input-element")
export class Input extends LitElement {
  image;
  @property()
  imageTag: string;
  @query("textarea", true) _input!: HTMLInputElement;
  // onchange={async (e) => {
  //   console.log(${image});
  //   const bytes = await image!.arrayBuffer();
  //   imageTag = ${html`data:${image!.type};base64,${btoa(bytes)}`};
  // }}
  //
  //
  //
  //
  // onchange={(e) => (image = (e.target as HTMLInputElement).files![0])}
  //
  //
  //         onsubmit={async (e) => {
  //   e.preventDefault();
  //   console.log(e.target);
  //   loading = true;
  //   const handle = localStorage["handle"]
  //   await post({text, metadata: meta, image,handle});
  //   cards = await getCards(handle);
  //   text = "";
  //   loading = false;
  //   imageTag = undefined;
  // }}
  //           onpaste={async (e) => {
  // https://web.dev/patterns/clipboard/paste-images
  //   const clipboardItems = await navigator.clipboard.read();
  //   console.log({ clipboardItems });
  //   for (const clipboardItem of clipboardItems) {
  //     console.log({ clipboardItem });
  //     const itemTypes = clipboardItem.types;
  //     for (const itemType of itemTypes!) {
  //       console.log({ itemType });
  //       const blob = await clipboardItem.getType(itemType);
  //       if (itemType.includes("image/")) {
  //         image = blob;
  //       }
  //       if (itemType == "text/html") {
  //         const text = await blob.text();
  //         console.log({ text });
  //         imageTag = text;
  //       }
  //       // Do something with the image blob.
  //     }
  //   }
  // }}
  render() {
    return html` <div class="w-full lg:w-1/2">
      <div>
        <form enctype="multipart/form-data" method="post">
          <div>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              class=""
            />
          </div>
        </form>
      </div>
      <div>
        <div>
          <form
            class="mb-8"
            @submit=${{
              handleEvent: async (e) => {
                e.preventDefault();
                await post({
                  text: this._input.value,
                  metadata: meta,
                  image: this.image,
                  handle: "nandi.weird.one",
                });
              },
            }}
          >
            <textarea
              name="pasted_text"
              placeholder="paste image here and insert text"
              class="border w-64 h-36 mt-10 bg-white text-black dark:bg-gray-800 dark:text-white"
              @input=${{
                handleEvent: () => {
                  const value = this._input.value;
                  console.log("test", value);
                },
              }}
              @paste=${{
                handleEvent: async () => {
                  // https://web.dev/patterns/clipboard/paste-images
                  const clipboardItems = await navigator.clipboard.read();
                  console.log({ clipboardItems });
                  for (const clipboardItem of clipboardItems) {
                    console.log({ clipboardItem });
                    const itemTypes = clipboardItem.types;
                    for (const itemType of itemTypes!) {
                      console.log({ itemType });
                      const blob = await clipboardItem.getType(itemType);
                      if (itemType.includes("image/")) {
                        this.image = blob;
                      }
                      if (itemType == "text/html") {
                        const text = await blob.text();
                        console.log({ text });
                        this.imageTag = text;
                      }
                      // Do something with the image blob.
                    }
                  }
                },
              }}
            ></textarea>
            <div
              class="mt-2 w-fit px-3 py-1 bg-gray-200 text-black border border-black rounded-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <input type="submit" />
            </div>

            <div>
              <div>
                <div class="w-60 mt-10">
                  <!-- <img src="${this.imageTag}" alt="caption" /> -->
                  ${unsafeHTML(this.imageTag)}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>`;
  }

  createRenderRoot() {
    return this;
  }
}
