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
 * An abstraction for a unit of data used in the algorithm.
 *
 * ---
 *
 * Currently implemented as a string--intended to be treated as a C/C++ `char`.
 */
type Card = string;

/**
 * A stack of cards on the field.
 * Has faceup and facedown cards.
 *
 * @summary A stack.
 */
class FieldStack {

    public constructor(
        /**
         * The list of cards in the stack.
         * The back (last element) is called the top, while the front (first element) is called the bottom.
         */
        private cards: Card[] = [],
        /**
         * The number of cards considered public, counts starting from the top (the back/last element)
         */
        public faceUp: number = 0,
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
    public pushToTop(cards: Card | Card[]): void {
        if (Array.isArray(cards)) {
            if (cards.length === 0) {
                console.warn("Tried to push 0 cards. Was this intentional?");
                return;
            }
            this.cards = this.cards.concat(cards)
            this.faceUp += cards.length;
        } else {
            this.cards.push(cards);
            ++this.faceUp;
        }
    }

    /**
     * Removes the requested (visible) cards from the stack and returns them.
     * Don't use this for non-visible cards.
     * @param n The number of cards to pull from the top. If `undefined`, returns the top card singularly instead of as an array.
     */
    public pullFromTop(n: number | undefined): Card | Card[] {

        if (n === undefined) {
            console.assert(this.numCards >= 1);
            return this.cards.pop()!;
        }

        if (n === 0) {
            console.warn("Tried to pull 0 cards. Was this intentional?");
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
 * A stack of cards on the foundation.
 * Only the top card is visible. Elements can only be added if they are greater than the card on top.
 * ! Hey wait a sec, how is this algorithm supposed to sort sparse arrays without knowing the correct order ahead of time?
 * ! Won't this run into the issue of being able to soft lock by placing, for example, a 10 on top of a 3, despite there being an 5 in the field?
 *
 * @summary An append-only stack.
 */
class FoundationStack {
    public constructor(
        /**
         * The list of cards in the stack.
         * The back (last element) is called the top, while the front (first element) is called the bottom.
         */
        private cards: Card[] = [],
    ) { }

    /**
     * Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
     */
    public get numCards(): number {
        return this.cards.length;
    }

    /**
     * A readable copy of the visible card on top of the stack.
     */
    public get top(): Card {
        console.assert(this.numCards !== 0);
        return this.cards[this.numCards - 1];
    }

    /**
     * A readable copy of the stack's cards.
     */
    public get all(): Card[] {
        return this.cards;
    }

    /**
     * Places `cards` on top of the stack.
     * @param cards The cards to push to the stack. **Must be in order**.\
     * Because it is likely the cards will have already been removed from their source,
     * returning `false` is insufficient. If the cards being added are `<` the
     * {@linkcode FoundationStack.top|top}, **an exception will be thrown.**
     * @throws "Out of order" error - `cards` is not increasing in value or is of lesser value than {@linkcode FoundationStack.top|top}.
     *
     */
    public pushToTop(cards: Card | Card[]): void {
        if (Array.isArray(cards)) {
            if (cards.length === 0) {
                console.warn("Tried to push 0 cards. Was this intentional?");
                return;
            }
            this.cards = this.cards.concat(cards)
        } else {
            this.cards.push(cards);
        }
    }
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
        private cards: Card[] = [],
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
     * And Game, during setup.
     * ### It's not like anything is gonna break, it's just the rules of the game.
     * Removes and returns the requested number of cards from the queue.
     * @param n The number of cards to pull from the back of the queue.
     */
    public pullFromTop(n: number): Card[] {
        console.assert(n <= this.numCards);
        return this.cards.splice(-n);
    }

    /**
     * Randomizes the order of the elements.
     */
    public shuffle(): void {
        for (let i = this.numCards - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // Swaps elements i and j
        }
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
        private cards: Card[] = [],
    ) {
        console.assert(cards.length <= rules.HAND_SIZE_MAX);
    }

    /**
     * A readable list of the cards in the hand.
     */
    public get cardsInHand(): Card[] {
        return this.cards;
    }

    /**
     * Tells whether the Hand is allowed random access for cards.
     * @see {@linkcode rules.HAND_ALLOW_RANDOM_ACCESS|HAND_ALLOW_RANDOM_ACCESS}
     * @see {@linkcode Hand.pullAt|pullAt}
     */
    public static get isRandomAccess(): boolean {
        return rules.HAND_ALLOW_RANDOM_ACCESS;
    }

    /**
     * The maximum capacity of the Hand.
     * @see {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX}
     */
    public static get maxCards(): number {
        return rules.HAND_SIZE_MAX;
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
 * Storage for gameplay elements.
 */
class Game {

    public constructor(deck: Card[]) {
        this.deck = new Deck(deck);
        this.hand = new Hand();
        this.foundation = [new FoundationStack()];
        this.field = [
            new FieldStack(),
            new FieldStack(),
            new FieldStack(),
            new FieldStack(),
            new FieldStack(),
            new FieldStack(),
            new FieldStack(),
            new FieldStack(),
        ];
    }

    /**
     * The source of cards.
     */
    public deck: Deck;

    /**
     * The "working memory" of the deck.
     */
    public hand: Hand;

    /**
     * The destination of sorted stacks.
     */
    public foundation: FoundationStack[];

    /**
     * The destination
     */
    public field: FieldStack[];

    /**
     * Deals out cards to the field.
     * Each stack in the field gets one more card than the previous, and the first gets 1.
     */
    private dealToField(): void {
        for (let i: number = 0; i < this.field.length; ++i) {
            this.field[i].pushToTop(this.deck.pullFromTop(i + 1));
        }
    }

    /**
     * Sets up the game.
     * 1. Shuffles the deck
     * 2. Deals cards to the field
     * 3. Deals cards to hand
     */
    public setup(): void {
        this.deck.shuffle();
        this.dealToField();
        this.hand.draw(this.deck);
    }

    /**
     * Prints a snapshot of the game to the console.
     */
    public visualize(): void {
        console.group("snapshot");

        if (this.deck.numCards > 0) {
            console.log(`deck: ${this.deck.numCards} cards`);
        } else {
            console.log(`deck: empty`);
        }

        if (this.hand.numCards > 0) {
            console.log(`hand: ${this.hand.numCards} (out of ${Hand.maxCards} max) cards: [[${this.hand.cardsInHand.join('][')}]]`);
        } else {
            console.log(`hand: empty (${Hand.maxCards} max)`);
        }

        console.group("field");
        for (let i = 0; i < this.field.length; ++i) {
            if (this.field[i].numCards > 0) {
                console.log(`${i}: ${this.field[i].numCards} cards: [${'[?]'.repeat(this.field[i].faceDown)}[${this.field[i].faceUpCards.join('][')}]]`);
            } else {
                console.log(`${i}: empty`);
            }
        }
        console.groupEnd();

        console.group("foundation");
        for (let i = 0; i < this.foundation.length; ++i) {
            if (this.foundation[i].numCards > 0) {
                console.log(`${i}: ${this.foundation[i].numCards} cards: top: [${this.foundation[i].top}]`);
            } else {
                console.log(`${i}: empty`);
            }
        }
        console.groupEnd();

        console.groupEnd();
    }
}

/**
 * AI player. Selects strategy based on rules.
 * @todo
 */
class Gamer {
    public constructor() {
        if (Hand.isRandomAccess) {
            this.makeMove = this.makeMove_randomAccess;
        } else {
            this.makeMove = this.makeMove_topAccess;
        }
    }

    /**
     * Makes a move in the game. Uses random access rules.
     * @param game The game to make a move in. **Will have contents modified.**
     */
    private makeMove_randomAccess(game: Game): void {

    }

    /**
     * Makes a move in the game. Uses top access rules.
     * @param game The game to make a move in. **Will have contents modified.**
     */
    private makeMove_topAccess(game: Game): void {

    }

    /**
     * Makes a move in the game. **Modifies game.**
     * @param game The game to make a move in. **Will have contents modified.**
     */
    public makeMove(game: Game): void {
        throw new Error("Using uninitialized makeMove method");
    }
}

/**
 * Plays a game of solitaire.
 * @param data The input cards.
 * @returns The sorted list. Returns `null` if lost.
 * @todo
 */
const play = (data: Card[]): Card[] | null => {
    const game: Game = new Game(data);
    game.setup();
    game.visualize();
    const gamer: Gamer = new Gamer();

    gamer.makeMove(game);

    // Todo: Play the game

    return game.foundation.flatMap(stack => stack.all);
}

/**
 * Sorts the data by playing a game of faux-solitaire.
 * @param data The list of cards to be sorted.
 */
export const solitaireSort = (data: Card[]): Card[] => {
    const maxTries: number = 3;
    for (let i = 0; i < maxTries; ++i) {
        const sorted: Card[] | null = play(data.map(e => e));
        if (sorted !== null) {
            return sorted;
        }
    }
    throw new Error(`Lost ${maxTries} times. Not retrying.`);
}
