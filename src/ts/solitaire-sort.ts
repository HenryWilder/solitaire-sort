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

/**
 * A stack of cards.
 */
class CardStack {
    public constructor(
        protected cards: Card[],
        public faceUp: number,
    ) { }
    /**
     * Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
     */
    public get size(): number {
        return this.cards.length;
    }

    public get faceDown(): number {
        return this.size - this.faceUp;
    }


    /**
     * Gives a readable list of all `faceUp` cards from the top of the stack.
     */
    public get faceUpCards(): Card[] {
        return this.cards.slice(this.size - this.faceUp);
    }

    /**
     * Places `cards` on top of the stack. The new cards will be `faceUp`.\
     * Existing `faceUp` cards on top of the stack will *remain* `faceUp`.
     */
    public pushToTop(cards: Card[]): void {
        this.cards = this.cards.concat(cards)
        this.faceUp += cards.length;
    }

    /**
     * Removes the requested (visible) cards from the stack and returns them.
     */
    public pullFromTop(n: number): Card[] {
        const result: Card[] = this.cards.slice(this.size - n);
        this.cards.length = this.cards.length - n; // not sure if "-=" works with getter/setter
        return result;
    }

    /**
     * Makes `n`-**more** cards `faceUp`.
     */
    public reveal(n: number): void {
        this.faceUp += n;
    }


    /**
     * Makes `n`-**fewer** cards `faceUp`.
     */
    public conceal(n: number): void {
        this.faceUp -= n;
    }
}

/**
 * A CardStack that can have cards pushed to the bottom of the stack.
 */
class Deck extends CardStack {

    /**
     * Slides `cards` underneath the stack. The new cards will **not** be `faceUp`.\
     * Existing `faceUp` cards on top of the stack will *remain* `faceUp`.
     */
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

    console.assert(n <= src.size);
    console.assert(n <= src.faceUp);

    dest.pushToTop(src.pullFromTop(n));
}

export const solitaireSort = (data: Card[]) => {
    console.log("Hello world");
}
