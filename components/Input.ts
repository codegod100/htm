import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { metadata, post } from "../lib";
const meta = await fetch("/client-metadata.json").then((r) => r.json());
@customElement("input-element")
export class Input extends LitElement {
  @property()
  repo: string;
  @property()
  image: File;
  @property()
  imageTag: string;
  @property()
  disabled: boolean;
  @property()
  submit_value: string = "Submit query";

  @query("textarea", true) _input!: HTMLInputElement;
  static styles = css`
    .preview-image img {
      margin-top: 10px;
      max-height: 400px;
      width: auto; /* Maintain aspect ratio */
      height: auto; /* Maintain aspect ratio */
    }
    textarea {
      width: 50%; /* Full width of container */
      min-height: 150px; /* Minimum height */
      padding: 12px 20px; /* Inner spacing */
      box-sizing: border-box; /* Include padding in width/height */
      border: 2px solid #ccc; /* Border style */
      border-radius: 4px; /* Rounded corners */
      background-color: #f8f8f8; /* Light background */
      font-family: Arial, sans-serif;
      font-size: 16px;
      resize: vertical; /* Only allow vertical resizing */
      line-height: 1.4; /* Line spacing */
      color: #333; /* Text color */
    }
    @media (prefers-color-scheme: dark) {
      .submit-button {
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        background: #1a1a1a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        margin-top: 5px;
        text-decoration: none;
      }
    }

    #back-wrapper {
      margin-left: auto;
      width: 130px;
    }
  `;
  render() {
    return html` <div id="back-wrapper">
        <a class="submit-button" href="/">Back Home</a>
      </div>
      <div class="w-full lg:w-1/2">
        <div>
          <form enctype="multipart/form-data" method="post">
            <div>
              <input
                type="file"
                name="image"
                accept="image/*"
                required
                class="submit-button"
                @change=${async (e) => {
                  const image = (e.target as HTMLInputElement).files![0];
                  this.image = image;
                  const bytes = await image!.arrayBuffer();
                  // const imageTag = `<img
                  //   src="data:${image!.type};base64,${btoa(bytes)}"
                  // />`;
                  const base64String = btoa(
                    String.fromCharCode(...new Uint8Array(bytes)),
                  );
                  const imageTag = `<img src="data:${image!.type};base64,${base64String}" />`;
                  this.imageTag = imageTag;
                  console.log({ image, imageTag, bytes });
                }}
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
                  this.submit_value = "Loading...";
                  this.disabled = true;
                  // const repo = new URLSearchParams(location.search).get("repo");
                  await post({
                    text: this._input.value,
                    metadata: meta,
                    image: this.image,
                    handle: this.repo!,
                  });

                  //reset values
                  this.submit_value = "Submit query";
                  this._input.value = "";
                  this.imageTag = "";
                  this.image = null;

                  // location.reload();
                  this.dispatchEvent(
                    new Event("posted", { bubbles: true, composed: true }),
                  );
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
                <input
                  class="submit-button"
                  type="submit"
                  value=${this.submit_value}
                  ${this.disabled ? "disabled" : ""}
                />
              </div>

              <div>
                <div>
                  <div class="preview-image">
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

  // createRenderRoot() {
  //   return this;
  // }
}
