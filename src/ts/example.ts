import { Card, solitaireSort } from "./solitaire-sort";

const data: Card[] = [];
const cardOptions: string = "A234567890JQK";
for (let i = 0; i < 52; ++i) {
    data.push(cardOptions[i % cardOptions.length] as Card);
}
try {
    solitaireSort(data);
} catch (err) {
    console.error(err);
}
