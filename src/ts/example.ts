import { solitaireSort } from "./solitaire-sort";

const data: string[] = [];
for (let i = 0; i < 52; ++i) {
    data.push(`${Math.floor(Math.random() * 13) + 1}`)
}
solitaireSort(data);
