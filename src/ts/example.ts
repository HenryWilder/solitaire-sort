import { solitaireSort } from "./solitaire-sort";

const data: string[] = [];
for (let i = 0; i < 52; ++i) {
    data.push("A234567890JQK"[Math.floor(Math.random() * 13)])
}
solitaireSort(data);
