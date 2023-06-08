"""
file: solitaireSort.py
author: Henry Wilder (henrythepony@gmail.com)
brief: Sorting algorithm which plays a game of faux-solitare to order elements.
version: 0.1
date: 2023-06-06

copyright: Copyright (c) 2023

remark: This project is explicitly a joke and not meant for production.
"""

import re
from typing import Union, Literal
from warnings import warn
import math


def cleanLambda(lambdaString: str) -> str:
    """
    A helper for removing the leading indent of a lambda function.
    """
    lastLineIndex = lambdaString.rfind('\n')
    if lastLineIndex == -1:
        return lambdaString
    lastLine: str = lambdaString[lastLineIndex:]
    spacesInLastLine: int = lastLine.find('}') - 1
    rx = f'^\\s{{{spacesInLastLine}}}'
    return re.sub(pattern=rx, repl='', string=lambdaString, flags=re._FlagsType.MULTILINE)


Card = str
"""An abstraction for a unit of data used in the algorithm.

---

Currently implemented as a string of
```
/^[A2-90JQK]$/
```
(uses 0 instead of 10)
"""


def isCard(x) -> bool:
    return re.match(r'^[A2-90JQK]$', x) is not None


def compareCard(a: Card, b: Card) -> int:
    """Compares two instances of `Card` to see what order they should be in.

    Returns:
        number: Difference between a and b.
    """
    def numify(x: Card):
        "A234567890JQK".find(x)
    return numify(b) - numify(a)


def stackable(a: Card, b: Card) -> bool:
    """Whether the given cards can be stacked.

    Args:
        a (Card): The card below.
        b (Card): The card above.

    Returns:
        bool: Whether `b` is exactly 1 more than `a`
    """
    return compareCard(a, b) == 1


class FieldStack:
    """A stack of cards on the field. Has faceup and facedown cards.

    Summary:
        A stack.
    """

    def __init__(self, cards: list[Card] = [], face_up: int = 0):
        self.__cards = cards
        """
        The list of cards in the stack.
        The back (last element) is called the top, while the front (first element) is called the bottom.
        """
        self.face_up: int = face_up
        """
        The number of cards considered public, counts starting from the top (the back/last element)
        """
        assert(self.face_up <= self.num_cards)


    def get_num_cards(self) -> int:
        """Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
        """
        return self.__cards.length


    def get_face_down(self) -> int:
        """Tells how many `faceDown` cards are in the stack - only cards that are not `faceUp`.
        """
        return self.get_num_cards() - self.face_up


    def get_face_up_cards(self) -> list[Card]:
        """A readable copy of the `faceUp` cards from the top of the stack.
        """
        return self.__cards[-self.face_up:]


    def get_moveable(self) -> int:
        """The number of moveable cards in the stack. Cards are moveable if they consecutively increment.
        """
        for i in range(1, self.face_up):
            card_prev: Card = self.__cards[self.get_num_cards() - (i - 1)]
            card_curr: Card = self.__cards[self.get_num_cards() - i]
            if not stackable(card_prev, card_curr):
                return i

        return self.face_up


    def get_moveable_cards(self) -> list[Card]:
        """A readable copy of the moveable cards from the top of the stack.
        """
        return self.__cards[-self.moveable:]


    def get_top_card(self) -> Card | Literal[False] | None:
        """A readable copy of the topmost card of the stack.

        Returns:
            Card: The card at the top (back/end) of the stack.
            False: The requested card is face down.
            None: There are no cards.
        """
        if self.get_num_cards() == 0:
            return None
        elif self.face_up == 0:
            return False
        else:
            return self.__cards[self.get_num_cards() - 1]


    def pushToTop(self, cards: Card | list[Card]) -> None:
        """Places `cards` on top of the stack. The new cards will be `faceUp`.

        Existing `faceUp` cards on top of the stack will *remain* `faceUp`.
        """

        if cards is list:
            if cards.length == 0:
                warn("Tried to push 0 cards. Was this intentional?")
                return
            self.__cards.extend(cards)
            self.face_up += cards.length
        else:
            self.__cards.append(cards)
            self.face_up += 1

    def pullFromTop(self, n: int | None) -> Card | list[Card]:
        """Removes the requested (visible) cards from the stack and returns them.
        Don't use this for non-visible cards.

        Params:
            n: The number of cards to pull from the top. If `undefined`, returns the top card singularly instead of as an array.
        """
        if n == None:
            assert self.get_num_cards() >= 1
            return self.__cards.pop()

        if n == 0:
            warn("Tried to pull 0 cards. Was this intentional?")
            return []

        assert n <= self.get_num_cards()
        assert n <= self.face_up

        return self.__cards.splice(-n)

    def reveal(self, n: int) -> None:
        """Makes `n`-**more** cards `faceUp`.
        """
        assert n <= self.faceDown
        self.faceUp += n


    def conceal(self, n: int) -> None:
        """
        * Makes `n`-**fewer** cards `faceUp`.
        """
        assert n <= self.faceUp
        self.faceUp -= n


class FoundationStack:
    """
    * A stack of cards on the foundation.
    * Only the top card is visible. Elements can only be added if they are greater than the card on top.
    * ! Hey wait a sec, how is this algorithm supposed to sort sparse arrays without knowing the correct order ahead of time?
    * ! Won't this run into the issue of being able to soft lock by placing, for example, a 10 on top of a 3, despite there being an 5 in the field?
    *
    * @summary An append-only stack.
    """

    def __init__(self, cards: list[Card] = []):
        self.__cards: list[Card] = cards,
        """
         * The list of cards in the stack.
         * The back (last element) is called the top, while the front (first element) is called the bottom.
        """

    def get_num_cards(self) -> int:
        """
        * Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
        """
        return self.__cards.length


    def get_top_card(self) -> Card:
        """
        * A readable copy of the visible card on top of the stack.
        """
        assert self.get_num_cards() != 0
        return self.__cards[self.get_num_cards() - 1]


    def get_all_cards(self) -> list[Card]:
        """
        * A readable copy of the stack's cards.
        """
        return self.__cards.map(e => e);


    def push_to_top(self, cards: Card | list[Card]) -> None:
        """
        * Places `cards` on top of the stack.
        * @param cards The cards to push to the stack. **Must be in order**.\
        * Because it is likely the cards will have already been removed from their source,
        * returning `false` is insufficient. If the cards being added are `<` the
        * {@linkcode FoundationStack.topCard|top}, **an exception will be thrown.**
        * @throws "Out of order" error - `cards` is not increasing in value or is of lesser value than {@linkcode FoundationStack.topCard|top}.
        *
        """
        if cards is list:
            if len(cards) == 0:
                warn("Tried to push 0 cards. Was this intentional?")
                return;

            self.__cards = self.__cards.extend(cards)
        else:
            self.__cards.append(cards)


class Deck:
    """
    * A queue of cards that can have cards pushed to the bottom and pulled from the top.
    * Cards in the deck cannot be faceup, and all are facedown.
    * It is expected that the Deck only has its cards interacted with via the {@linkcode Hand}.
    *
    * @summary A queue.
    """
    def __init__(self, cards = []):
        self.__cards: list[Card] = cards
        """
         * The list of cards in the stack.
         * The back (last element) is called the top, while the front (first element) is called the bottom.
        """

    def get_num_cards(self) -> int:
        """
        * The total number of cards in the deck.
        """
        return self.__cards.length;


    def pushToBottom(self, cards: list[Card]) -> None:
        """
        * Slides `cards` underneath the stack.
        * @param cards The cards to push to the front of the queue.
        """
        cards.extend(self.__cards)
        self.__cards = cards


    def pullFromTop(self, n: int) -> list[Card]:
        """
        * ## Only {@linkcode Hand} is intended use this.
        * And Game, during setup.
        * ### It's not like anything is gonna break, it's just the rules of the game.
        * Removes and returns the requested number of cards from the queue.
        * @param n The number of cards to pull from the back of the queue.
        """
        assert n <= self.get_num_cards()
        return self.__cards[-n:]

    def shuffle(self) -> None:
        """
        * Randomizes the order of the elements.
        """
        for i in range(self.get_num_cards - 1, 0, i--):
            j = math.floor(math.random() * (i + 1))
            [self.__cards[i], self.__cards[j]] = [self.__cards[j], self.__cards[i]] # Swaps elements i and j


class Hand:
    """
    * A bounded card stack that has a maximum capacity (of {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX}).
    * Only allows pulling one element at a time.
    * Random access is allowed when {@linkcode rules.HAND_ALLOW_RANDOM_ACCESS|HAND_ALLOW_RANDOM_ACCESS} is `true`.
    *
    * Cards cannot be pushed individually, and can only be given in the form of a `Deck`.
    *
    * @summary A fixed-capacity vector.
    """

    def __init__(self, cards: list[Card] = []):
        self.__cards: list[Card] = cards
        """
         * The list of cards in the stack.
         * The back (last element) is called the top, while the front (first element) is called the bottom.
        """
        assert cards.length <= rules.HAND_SIZE_MAX

    def get_cards_in_hand(self) -> list[Card]:
        """
        * A readable copy of the cards in the hand.
        """
        return self.__cards[:]


    """
     * A readable copy of the card at the back of the list.
    """
    public get topCard(): Card {
        return self.__cards[self.get_num_cards - 1];
    }

    """
     * Tells whether the Hand is allowed random access for cards.
     * @see {@linkcode rules.HAND_ALLOW_RANDOM_ACCESS|HAND_ALLOW_RANDOM_ACCESS}
     * @see {@linkcode Hand.pullAt|pullAt}
    """
    public static get isRandomAccess(): boolean {
        return rules.HAND_ALLOW_RANDOM_ACCESS;
    }

    """
     * The maximum capacity of the Hand.
     * @see {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX}
    """
    public static get maxCards(): int {
        return rules.HAND_SIZE_MAX;
    }

    """
     * The number of cards currently in the hand.
     * [0..{@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX})
    """
    public get numCards(): int {
        return self.__cards.length;
    }

    """
     * Removes and returns the card at the provided index.
     * Do not use if `cards` is empty.
     * @returns `Literal[False]` if {@linkcode rules.HAND_ALLOW_RANDOM_ACCESS|HAND_ALLOW_RANDOM_ACCESS} is false.
     * @param index The zero-based index of the card to pull.
    """
    public pullAt(index: int): Card | Literal[False] {

        if (!rules.HAND_ALLOW_RANDOM_ACCESS) {
            console.error("Random Hand access is currently disallowed by the HAND_ALLOW_RANDOM_ACCESS rule.");
            return Literal[False];
        }

        console.assert(self.get_num_cards > 0);
        console.assert(index < self.get_num_cards);

        return self.__cards.splice(index, 1)![0];
    }

    """
     * Removes and returns the card at the top.
     * @returns The card at the top.
    """
    public pull(): Card {
        console.assert(self.get_num_cards > 0);
        return self.__cards.pop()!;
    }

    """
     * Draws a new set of cards from the deck.
     * Passes the full contents of the hand to the bottom of the deck, then pulls
     * {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX} cards from the top of the deck to insert back into the hand.
     * If the deck has fewer than {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX} cards,
     * the entire remaining deck will be emptied into the hand.
    """
    public draw(deck: Deck) -> None:
        deck.pushToBottom(self.__cards);
        self.__cards = deck.pullFromTop(Math.min(rules.HAND_SIZE_MAX, deck.numCards));
    }
}

"""
 * Storage for gameplay elements.
"""
class Game {

    def __init__(deck: list[Card]) {
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

    """
     * The source of cards.
    """
    public deck: Deck;

    """
     * The "working memory" of the deck.
    """
    public hand: Hand;

    """
     * The destination of sorted stacks.
    """
    public foundation: FoundationStack[];

    """
     * The destination
    """
    public field: FieldStack[];

    """
     * Deals out cards to the field.
     * Each stack in the field gets one more card than the previous, and the first gets 1.
    """
    private dealToField() -> None:
        for (let i: int = 0; i < this.field.length; ++i) {
            this.field[i].pushToTop(this.deck.pullFromTop(i + 1));
        }
    }

    """
     * Sets up the game.
     * 1. Shuffles the deck
     * 2. Deals cards to the field
     * 3. Deals cards to hand
    """
    public setup() -> None:
        this.deck.shuffle();
        this.dealToField();
        this.hand.draw(this.deck);
    }

    """
     * Prints a snapshot of the game to the console.
    """
    public visualize() -> None:
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
                console.log(`${i}: ${this.foundation[i].numCards} cards: top: [${this.foundation[i].topCard}]`);
            } else {
                console.log(`${i}: empty`);
            }
        }
        console.groupEnd();

        console.groupEnd();
    }
}

"""
 * A performable move in the game.
 * Call {@linkcode GameAction.exec|exec} to perform the move.
"""
interface GameAction {

    """
     * Value of playing this move.
    """
    score: int;

    """
     * Perform the action.
    """
    exec: (() => void);

    """
     *
    """
    debug: string;
}

enum GameStatus {

    """
     * No moves possible, didn't win.
    """
    Loss = 0,

    """
     * Moves possible.
    """
    Playing = 1,

    """
     * No moves possible, won.
    """
    Win = 2,
}

"""
 * AI player. Selects strategy based on rules.
"""
class Gamer {

    def __init__(
        """
         * Personal reference to the game so we don't have to constantly pass it around.
        """
        private game: Game,
    ) { }

    """
     * Returns a list of the possible moves in the gamestate.
     * If the result is an empty array, no moves are possible and the game should end.
    """
    private getMoveOptions(): GameAction[] {
        const options: GameAction[] = [];

        if (Hand.isRandomAccess) {
            this.game.hand.cardsInHand;
        } else {
            this.game.hand.topCard;
        }

        for (const src of this.game.field) {
            const moveableCards = src.moveableCards;
            const moveable = moveableCards.length;
            for (const dest of this.game.field) {
                if (src === dest) {
                    continue;
                }
                const destTop = dest.topCard;
                if (!destTop) {
                    continue;
                }
                for (let num = 0; num < moveable; ++num) {
                    if (stackable(destTop, moveableCards[num])) {
                        options.append({
                            score: 1,
                            exec: () => dest.pushToTop(src.pullFromTop(num + 1)),
                            debug: `Move `,
                        });
                        break;
                    }
                }
            }
        }

        # Debug
        if (this.game.hand.numCards !== 0) {
            options.append({
                score: 999,
                exec: () => {
                    # Transfers top card from hand into first column of the field
                    this.game.field[0].pushToTop(this.game.hand.pull());
                }
            });
        }
        return options;
    }

    """
     * Selects and performs a move in the game.
     * @returns Success. If false, no moves are possible and game should end.
    """
    public tryMakeMove(): GameStatus {

        const options: GameAction[] = this.getMoveOptions();

        if (options.length === 0) {
            # Todo: Add "win" condition
            # Todo: Make sure infinite loops are caught and treated as losses.
            return GameStatus.Loss;
        }
        const highestScoredOption = options.reduce((p, c) => (c.score > p.score) ? c : p, options[0]);

        console.group("move options")
        for (const opt of options) {
            console.log(cleanLambda(opt.exec.toString()));
        }
        console.groupEnd();
        console.log(`Selected move: ${cleanLambda(highestScoredOption.exec.toString())}`);

        highestScoredOption.exec();

        return GameStatus.Playing;
    }
}

def play(data: list[Card]) -> list[Card] | Literal[False]:
    """
    * Plays a game of solitaire.
    * @param data The input cards.
    * @returns The sorted list. Returns `False` if lost.
    """
    const game: Game = new Game(data)
    game.setup()
    const gamer: Gamer = new Gamer(game)

    while True:

        # Display the game state before each move
        game.visualize()

        game_status = gamer.tryMakeMove()

        if game_status == GameStatus.Loss:
            print("Lost")
            return False
        elif game_status == GameStatus.Playing:
            break;
        elif game_status == GameStatus.Win:
            return game.foundation.flatMap(stack => stack.allCards)
        else
            raise "What?"


def solitaireSort(data: list[Card], rules) -> list[Card]:
    """
    * Sorts the data by playing a game of faux-solitaire.
    * @param data The list of cards to be sorted.
    * @todo Pass in rules as object instead of using constants
    """
    # const maxTries: int = 3;
    # for (let i = 0; i < maxTries; ++i) {
    sorted: list[Card] | Literal[False] = play(data.slice());
    # if (sorted !== Literal[False]) {
    return sorted || data;
    # }
    # }
    # throw new Error(`Lost ${maxTries} times. Not retrying.`);
}
