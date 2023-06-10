import { solitaireSort } from "./solitaire-sort.mjs"

/** @type {Card[]} */
const data = [];
/** @type {string} */
const cardOptions = "A234567890JQK";
for (let i = 0; i < 52; ++i) {
    data.push(cardOptions[i % cardOptions.length]);
}
try {
    solitaireSort(data);
} catch (err) {
    console.error(err);
}
