import { layout } from "./utils";
const html = `<div class="mb-5 font-bold text-red-500">Testing</div>
<div><my-element></my-element></div>`;
const main = layout(html);
Bun.write("templates/main.html", main);

const card = `<div><input-element></input-element></div><div><cards-element></cards-element></div><script type="module" src="../input.ts"></script>`;
const cards = layout(card);
Bun.write("templates/cards.html", cards);
