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
     * @returns {string}
     * ---
     * @example
     * ```
     * listCards(['A','5','2','J','8']) => "[[A][5][2][J][8]]"
     * listCards([]) => "[]"
     * ```
     */
    const listCards = (cards) => '[' + cards.map(c => `[${c}]`).join('') + ']';

    /**
     * If `cards` is not empty, logs an indented line listing `cards` (see {@linkcode listCards}).\
     * If `cards` is empty, does nothing.
     * @param {Card[]} cards The list of cards to try printing.
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
     *   cards: [[A][5][2][J][8]]
     * ```
     */
    const logIndentedCardLineIfThereAreCards = (cards) => (cards.length > 0) && console.log(`  cards: ${listCards(cards)}`);

    console.log(`deck: ${numCardsOrEmpty(game.deck)}`);
    logIndentedCardLineIfThereAreCards(game.deck);

    console.log(`hand: ${numCardsOrEmpty(game.hand)} (${rules.HAND_SIZE_MAX} max)`);
    logIndentedCardLineIfThereAreCards(game.hand);

    console.group("field");
    for (let i = 0; i < game.field.length; ++i) {
        console.log(`${i}: ${numCardsOrEmpty(game.field[i])}`);
        logIndentedCardLineIfThereAreCards(game.field[i]);
    }
    console.groupEnd();

    console.group("foundation");
    for (let i = 0; i < game.foundation.length; ++i) {
        console.log(`${i}: ${numCardsOrEmpty(game.foundation[i])}`);
        logIndentedCardLineIfThereAreCards(game.foundation[i]);
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
