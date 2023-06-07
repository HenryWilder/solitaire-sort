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

import { rules } from "./solitaire-sort-rules";

/**
 * A "card".
 * Meant to be equivalent to a `char` in C.
 */
type Card = string;

/**
 * A stack of cards.
 * 
 * @summary A stack.
 */
class CardStack {

    public constructor(
        /**
         * The list of cards in the stack.
         * The back (last element) is called the top, while the front (first element) is called the bottom.
         */
        private cards: Card[],
        /**
         * The number of cards considered public, counts starting from the top (the back/last element)
         */
        public faceUp: number,
    ) {
        console.assert(this.faceUp <= this.numCards);
    }

    /**
     * Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
     */
    public get numCards(): number {
        return this.cards.length;
    }

    /**
     * Tells how many `faceDown` cards are in the stack - only cards that are not `faceUp`.
     */
    public get faceDown(): number {
        return this.numCards - this.faceUp;
    }

    /**
     * Gives a readable list of all `faceUp` cards from the top of the stack.
     */
    public get faceUpCards(): Card[] {
        return this.cards.slice(-this.faceUp);
    }

    /**
     * Places `cards` on top of the stack. The new cards will be `faceUp`.\
     * Existing `faceUp` cards on top of the stack will *remain* `faceUp`.
     */
    public pushToTop(cards: Card[]): void {
        if (cards.length === 0) {
            return;
        }
        this.cards = this.cards.concat(cards)
        this.faceUp += cards.length;
    }

    /**
     * Removes the requested (visible) cards from the stack and returns them.
     * Don't use this for non-visible cards.
     */
    public pullFromTop(n: number): Card[] {
        if (n === 0) {
            return [];
        }
        console.assert(n <= this.numCards);
        console.assert(n <= this.faceUp);
        return this.cards.splice(-n);
    }

    /**
     * Makes `n`-**more** cards `faceUp`.
     */
    public reveal(n: number): void {
        console.assert(n <= this.faceDown);
        this.faceUp += n;
    }

    /**
     * Makes `n`-**fewer** cards `faceUp`.
     */
    public conceal(n: number): void {
        console.assert(n <= this.faceUp);
        this.faceUp -= n;
    }
}

/**
 * Transfers `n` cards from `src` to `dest`.
 * @param dest Destination stack. Cards will be added to this.
 * @param src Source stack. Cards will be removed from this.
 * @param n Number of cards to transfer. `src` will shrink by this number, `dest` will grow by this number.
 */
const transferStack = (dest: CardStack, src: CardStack, n: number): void => {
    if (n === 0) {
        return;
    }

    console.assert(n <= src.numCards);
    console.assert(n <= src.faceUp);

    dest.pushToTop(src.pullFromTop(n));
}

/**
 * A queue of cards that can have cards pushed to the bottom and pulled from the top.
 * Cards in the deck cannot be faceup, and all are facedown.
 * It is expected that the Deck only has its cards interacted with via the {@linkcode Hand}.
 * 
 * @summary A queue.
 */
class Deck {

    public constructor(
        /**
         * The list of cards in the stack.
         * The back (last element) is called the top, while the front (first element) is called the bottom.
         */
        private cards: Card[],
    ) { }

    /**
     * The total number of cards in the deck.
     */
    get numCards(): number {
        return this.cards.length;
    }

    /**
     * Slides `cards` underneath the stack.
     * @param cards The cards to push to the front of the queue.
     */
    public pushToBottom(cards: Card[]): void {
        this.cards = cards.concat(this.cards);
    }

    /**
     * ## Only {@linkcode Hand} is intended use this.
     * ### It's not like anything is gonna break, it's just the rules of the game.
     * Removes and returns the requested number of cards from the queue.
     * @param n The number of cards to pull from the back of the queue.
     */
    public pullFromTop(n: number): Card[] {
        console.assert(n <= this.numCards);
        return this.cards.splice(-n);
    }
}

/**
 * A bounded card stack that has a maximum capacity (of {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX}).
 * Only allows pulling one element at a time.
 * Random access is allowed when {@linkcode rules.HAND_ALLOW_RANDOM_ACCESS|HAND_ALLOW_RANDOM_ACCESS} is `true`.
 * 
 * Cards cannot be pushed individually, and can only be given in the form of a `Deck`.
 * 
 * @summary A fixed-capacity vector.
 */
class Hand {

    public constructor(
        /**
         * The list of cards in the stack.
         * The back (last element) is called the top, while the front (first element) is called the bottom.
         */
        protected cards: Card[],
    ) {
        console.assert(cards.length <= rules.HAND_SIZE_MAX);
    }

    /**
     * The number of cards currently in the hand.
     * [0..{@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX})
     */
    public get numCards(): number {
        return this.cards.length;
    }

    /**
     * Removes and returns the card at the provided index.  
     * Do not use if `cards` is empty.
     * @returns `null` if {@linkcode rules.HAND_ALLOW_RANDOM_ACCESS|HAND_ALLOW_RANDOM_ACCESS} is false.
     * @param index The zero-based index of the card to pull.
     */
    public pullAt(index: number): Card | null {

        if (!rules.HAND_ALLOW_RANDOM_ACCESS) {
            console.error("Random Hand access is currently disallowed by the HAND_ALLOW_RANDOM_ACCESS rule.");
            return null;
        }

        console.assert(this.numCards > 0);
        console.assert(index < this.numCards);

        return this.cards.splice(index, 1)![0];
    }

    /**
     * Removes and returns the card at the top.
     * @returns The card at the top.
     */
    public pull(): Card {
        console.assert(this.numCards > 0);
        return this.cards.pop()!;
    }

    /**
     * Draws a new set of cards from the deck.
     * Passes the full contents of the hand to the bottom of the deck, then pulls
     * {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX} cards from the top of the deck to insert back into the hand.
     * If the deck has fewer than {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX} cards,
     * the entire remaining deck will be emptied into the hand.
     */
    public draw(deck: Deck): void {
        deck.pushToBottom(this.cards);
        this.cards = deck.pullFromTop(Math.min(rules.HAND_SIZE_MAX, deck.numCards));
    }
}

/**
 * Transfers `n` cards from `src` to `dest`.
 * @param dest Destination stack. Cards will be added to this.
 * @param src Source stack. Cards will be removed from this.
 * @param index The zero-based index of the card to take from the hand.
 * **Only allowed if {@linkcode rules.HAND_ALLOW_RANDOM_ACCESS|HAND_ALLOW_RANDOM_ACCESS} is true.**
 */
const transferFromHand = (dest: CardStack, src: Hand, index: number | undefined): void => {

    console.assert(src.numCards > 0);

    if (index === undefined) {

        dest.pushToTop([src.pull()]);

    } else {

        // Guard
        if (!rules.HAND_ALLOW_RANDOM_ACCESS) {
            console.error("Random Hand access is currently disallowed by the HAND_ALLOW_RANDOM_ACCESS rule. Transfer has been aborted.");
            return;
        }

        console.assert(index < src.numCards);
        dest.pushToTop([src.pullAt(index)!]);
    }
}

/**
 * Sorts the data by playing a game of faux-solitaire.
 * @param data The list of cards to be sorted.
 */
export const solitaireSort = (data: Card[]) => {
    console.log("Hello world");
}
