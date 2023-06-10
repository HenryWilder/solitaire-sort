/**
 * @file solitaire-sort.js
 * @author Henry Wilder (henrythepony@gmail.com)
 * @brief Sorting algorithm which plays a game of faux-solitare to order elements.
 * @version 0.1
 * @date 2023-06-06
 *
 * @copyright Copyright (c) 2023
 *
 * @remark This project is explicitly a joke and not meant for production.
 */

"use strict"

/**
 * Types
 * @typedef {'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'J' | 'Q' | 'K'} Card An abstraction for the data being sorted
 * @typedef {Card[]} Deck An alias
 * @typedef {Card[]} Hand An alias
 * @typedef {Card[]} CardStack An alias
 * @typedef {[CardStack, CardStack, CardStack, CardStack, CardStack, CardStack, CardStack, CardStack]} Field An alias
 * @typedef {Card[]} FoundationStack An alias
 * @typedef {[FoundationStack]} Foundation An alias
 * @typedef {{ deck: Deck; hand: Hand; field: Field; foundation: Foundation }} Game
 */


/**
 * Compares two instances of `Card` to see what order they should be in.
 * @param {Card} a
 * @param {Card} b
 * @returns {number}
 */
const compareCard = (a, b) => {
    /** @param {Card} x @returns {number} */
    const numify = (x) => "A234567890JQK".indexOf(x);
    return numify(b) - numify(a);
};

/**
 * Whether the given cards can be stacked.
 * @param {Card} a The card below.
 * @param {Card} b The card above.
 * @returns {boolean}
 */
const stackable = (a, b) => {
    return compareCard(a, b) === 1;
}

/**
 * Returns the number of moveable cards in the stack.
 * Will only ever be below 1 if the array is empty.
 * @param {Card[]} cards
 * @returns {number}
 */
const countMoveable = (cards) => {
    for (let i = cards.length - 1; i >= 1; --i) {
        if (!stackable(cards[i], cards[i - 1])) {
            return cards.length - i;
        }
    }
    return cards.length;
}

/**
 * Returns the number of moveable cards in the stack.
 * Will only ever be below 1 if the array is empty.
 * @param {Card[]} cards
 * @returns {number}
 */
const countImmoveable = (cards) => {
    return cards.length - countMoveable(cards);
}

/**
 * Namespace for Solitaire Sort rules.
 * @namespace
 */
const rules = {
    /**
     * Whether random access is allowed for `Hand`.
     * @type {boolean}
     * @readonly
     * @constant
     */
    HAND_ALLOW_RANDOM_ACCESS: true,

    /**
     * The maximum number of elements allowed in a `Hand`.
     * @type {number}
     * @readonly
     * @constant
     */
    HAND_SIZE_MAX: 3,
};

/**
 * @readonly
 * @enum {number}
 */
const GameStatus = {
    /**
     * @type {number}
     * @readonly
    */
    Loss: 0,

    /**
     * @type {number}
     * @readonly
     */
    Playing: 1,

    /**
     * @type {number}
     * @readonly
     */
    Win: 2,
};

/**
 * Prints the current gamestate to the console.
 * @param {Game} game The gamestate object.
 * @returns {void}
 */
const visualize = (game) => {
    console.group("snapshot");

    /**
     * If `cards` is not empty, returns `cards.length` followed by "cards".\
     * If `cards` is empty, prints "empty".
     * @param {Card[]} cards List to check.
     * @returns {string}
     * ---
     * @example
     * ```
     * numCardsOrEmpty(5) => "5 cards"
     * numCardsOrEmpty(0) => "empty"
     * ```
     */
    const numCardsOrEmpty = (cards) => cards.length && `${cards.length} cards` || "empty";

    /**
     * Returns a formatted string of the list of cards.
     * @param {Card[]} cards
     * @param {number | undefined} slots Number of slots to make space for, even if not all are filled.
     * @returns {string}
     * ---
     * @example
     * ```
     * listCards(['A','5','2','J','8']) => "[[A][5][2][J][8]]"
     * listCards([]) => "[]"
     * ```
     */
    const listCards = (cards, slots = undefined) => '[ ' + cards.join(' ').padEnd((slots ?? 0), ' ') + ' ]';

    /**
     * If `cards` is not empty, logs an indented line listing `cards` (see {@linkcode listCards}).\
     * If `cards` is empty, does nothing.
     * @param {Card[]} cards The list of cards to try printing.
     * @param {number | undefined} slots Number of slots to make space for, even if not all are filled.
     * @returns {void}
     * ---
     * #### Code
     * ```js
     * console.log("hand: empty")
     * logIndentedCardLineIfThereAreCards([])
     * console.log("deck: 5 cards")
     * logIndentedCardLineIfThereAreCards(['A','5','2','J','8'])
     * ```
     * #### Output
     * ```plaintext
     * hand: empty
     * deck: 5 cards
     *   [[A][5][2][J][8]]
     * ```
     */
    const logIndentedCardLineIfThereAreCards = (cards, slots = undefined) => (cards.length > 0) && console.log(`  ${listCards(cards, slots)}`);

    console.group("deck");
    console.log(listCards(game.deck));
    console.groupEnd();

    console.group("hand");
    console.log(listCards(game.hand, rules.HAND_SIZE_MAX));
    console.groupEnd();

    console.group("field");
    /** @type {number} */
    const maxColumnLength = game.field.reduce((c, p) => (c.length > p.length) ? c : p, []).length;
    /** @type {number[]} */
    const immoveableByCol = game.field.map(countImmoveable);
    console.log('.---'.repeat(game.field.length) + '.');
    for (let i = 0; i < maxColumnLength; ++i) {
        const row = game.field.map((col, colNum) => (col.length > i) ? (i < immoveableByCol[colNum] ? ` ${col[i]} ` : `[${col[i]}]`) : '   ').join('|');
        console.log('|' + row + '|');
    }
    console.log('\'---'.repeat(game.field.length) + '\'');
    console.groupEnd();

    console.group("foundation");
    for (let i = 0; i < game.foundation.length; ++i) {
        console.log(listCards(game.foundation[i]));
    }
    console.groupEnd();

    console.groupEnd();
}

/**
 * The only real place where gamerules are used.
 * @param {Game} game  The gamestate object.
 * @returns {GameStatus}
 */
const tryMakeMove = (game) => {
    return GameStatus.Loss;
}

/**
 * @param {Card[]} data The data to sort
 * @returns {Card[] | null}
 */
const play = (data) => {

    const game = {
        /** @type {Deck} @readonly */
        deck: [],

        /** @type {Hand} @readonly */
        hand: [],

        /** @type {Field} @readonly */
        field: [[], [], [], [], [], [], [], []],

        /** @type {Foundation} @readonly */
        foundation: [[]],
    };

    // Setup
    {
        // Populate deck
        game.deck.push(...data);
    
        // Shuffle deck
        for (let i = game.deck.length - 1; i > 0; --i) {
            const j = Math.floor(Math.random() * (i + 1));
            [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]]; // Swaps elements i and j
        }

        for (let i = 0; i < game.field.length; ++i) {
            game.field[i] = game.deck.splice(-(i + 1));
        }
        
        const handCards = data.splice(-rules.HAND_SIZE_MAX);
        game.hand.push(...handCards);
    }

    while (true) {

        // Display the game state before each move
        visualize(game);

        switch (tryMakeMove(game)) {

            case GameStatus.Loss:
                console.log("Lost");
                return null;

            case GameStatus.Playing:
                break;

            case GameStatus.Win:
                return game.foundation.flatMap(stack => stack.allCards);
        }
    }
};

/**
 * @param {Card[]} data The data to sort
 * @returns {Card[]} The sorted list
 */
export const solitaireSort = (data) => {
    console.log(data);
    const maxTries = 1;
    for (let i = 0; i < maxTries; ++i) {
        /** @type {Card[] | null} */ const sorted = play(data.slice());
        if (sorted !== null) {
            return sorted || data;
        }
    }
    console.error(`Lost ${maxTries} times in a row. Not retrying.`);
};
