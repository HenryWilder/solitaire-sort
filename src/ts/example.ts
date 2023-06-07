import { Card, solitaireSort } from "./solitaire-sort";

const data: Card[] = [];
for (let i = 0; i < 52; ++i) {
    data.push("A234567890JQK"[Math.floor(Math.random() * 13)] as Card);
}
try {
    solitaireSort(data);
} catch (err) {
    console.error(err);
}
