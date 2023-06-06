/**
 * @file solitaire-sort.ts
 * @author Henry Wilder (henrythepony@gmail.com)
 * @brief Sorting algorithm which plays a game of faux-solitare to order elements.
 * @version 0.1
 * @date 2023-06-06
 *
 * @copyright Copyright (c) 2023
 *
 * @remark This project is explicitly a joke and not meant for production.
 */

type Card = string;

class CardStackBase {
}

/**
 * A stack of cards.
 */
class CardStack {
    constructor(
        protected cards: Card[],
        public faceUp: number,
    ) { }

    public pushToTop(cards: Card[]): void {
        this.cards.concat(cards)
        this.faceUp += cards.length;
    }
}

/**
 * A CardStack that can have cards pushed to the bottom of the stack.
 */
class Deck extends CardStack {
    public pushToBottom(cards: Card[]): void {
        this.cards = cards.concat(this.cards);
    }
}

/**
 * Transfers `n` cards from `src` to `dest`.
 * @param dest Destination stack. Cards will be added to this.
 * @param src Source stack. Cards will be removed from this.
 * @param n Number of cards to transfer. `src` will shrink by this number, `dest` will grow by this number.
 */
const transfer = (dest: CardStack, src: CardStack, n: number): void => {
    if (n === 0) {
        return;
    }

    console.assert(src.cards.length >= n);
    console.assert(src.faceUp >= n);

    dest.concat
}

export const solitaireSort = (data: Card[]) => {
    console.log("Hello world");
}
