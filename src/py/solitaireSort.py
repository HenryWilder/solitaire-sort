"""file: solitaireSort.py
author: Henry Wilder (henrythepony@gmail.com)
brief: Sorting algorithm which plays a game of faux-solitare to order elements.
version: 0.1
date: 2023-06-06

copyright: Copyright (c) 2023

remark: This project is explicitly a joke and not meant for production.
"""


import re
from typing import Literal, Callable
from warnings import warn
import traceback
import math
import random
import solitaireSortRules as rules


def cleanLambda(lambdaString: str) -> str:
    """A helper for removing the leading indent of a lambda function.
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

    Parameters:
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
        self._cards = cards
        """The list of cards in the stack.
        The back (last element) is called the top, while the front (first element) is called the bottom.
        """
        self.face_up: int = face_up
        """The number of cards considered public, counts starting from the top (the back/last element)
        """
        assert(self.face_up <= self.num_cards)


    def get_num_cards(self) -> int:
        """Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
        """
        return len(self._cards)


    num_cards = property(get_num_cards)
    """Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
    """


    def get_face_down(self) -> int:
        """Tells how many `faceDown` cards are in the stack - only cards that are not `faceUp`.
        """
        return self.num_cards() - self.face_up


    face_down = property(get_face_down)
    """Tells how many `faceDown` cards are in the stack - only cards that are not `faceUp`.
    """


    def get_face_up_cards(self) -> list[Card]:
        """A readable copy of the `faceUp` cards from the top of the stack.
        """
        return self._cards[-self.face_up:]


    face_up_cards = property(get_face_up_cards)
    """A readable copy of the `faceUp` cards from the top of the stack.
    """


    def get_moveable(self) -> int:
        """The number of moveable cards in the stack. Cards are moveable if they consecutively increment.
        """
        for i in range(1, self.face_up):
            card_prev: Card = self._cards[self.get_num_cards() - (i - 1)]
            card_curr: Card = self._cards[self.get_num_cards() - i]
            if not stackable(card_prev, card_curr):
                return i

        return self.face_up


    moveable = property(get_moveable)
    """The number of moveable cards in the stack. Cards are moveable if they consecutively increment.
    """


    def get_moveable_cards(self) -> list[Card]:
        """A readable copy of the moveable cards from the top of the stack.
        """
        return self._cards[-self.moveable:]


    moveable_cards = property(get_moveable_cards)
    """A readable copy of the moveable cards from the top of the stack.
    """


    def get_top_card(self) -> Card | Literal[False] | None:
        """A readable copy of the topmost card of the stack.

        Returns:
            Card: The card at the top (back/end) of the stack.
            False: The requested card is face down.
            None: There are no cards.
        """
        if self.num_cards == 0:
            return None
        elif self.face_up == 0:
            return False
        else:
            return self._cards[self.num_cards - 1]


    top_card = property(get_top_card)
    """A readable copy of the topmost card of the stack.

    Returns:
        Card: The card at the top (back/end) of the stack.
        False: The requested card is face down.
        None: There are no cards.
    """


    def push_to_top(self, cards: Card | list[Card]) -> None:
        """Places `cards` on top of the stack. The new cards will be `faceUp`.

        Existing `faceUp` cards on top of the stack will *remain* `faceUp`.
        """

        if cards is list:
            if len(cards) == 0:
                warn("Tried to push 0 cards. Was this intentional?")
                return
            self._cards.extend(cards)
            self.face_up += len(cards)
        else:
            self._cards.append(cards)
            self.face_up += 1


    def pull_from_top(self, n: int | None) -> Card | list[Card]:
        """Removes the requested (visible) cards from the stack and returns them.
        Don't use this for non-visible cards.

        Parameters:
            n: The number of cards to pull from the top. If `undefined`, returns the top card singularly instead of as an array.
        """
        if n == None:
            assert self.num_cards >= 1
            return self._cards.pop()

        if n == 0:
            warn("Tried to pull 0 cards. Was this intentional?")
            return []

        assert n <= self.num_cards
        assert n <= self.face_up

        result = self._cards[-n:]
        self._cards = self._cards[:-n]

        return result


    def reveal(self, n: int) -> None:
        """Makes `n`-more cards `faceUp`.
        """
        assert n <= self.face_down
        self.face_up += n


    def conceal(self, n: int) -> None:
        """Makes `n`-fewer cards `faceUp`.
        """
        assert n <= self.face_up
        self.face_up -= n


class FoundationStack:
    """A stack of cards on the foundation.
    Only the top card is visible. Elements can only be added if they are greater than the card on top.

    ---

    Hey wait a sec, how is this algorithm supposed to sort sparse arrays without knowing the correct order ahead of time?

    Won't this run into the issue of being able to soft lock by placing, for example, a 10 on top of a 3, despite there being an 5 in the field?

    ---

    Summary:
        An append-only stack.
    """

    def __init__(self, cards: list[Card] = []):
        self._cards: list[Card] = cards,
        """The list of cards in the stack.
        The back (last element) is called the top, while the front (first element) is called the bottom.
        """

    def get_num_cards(self) -> int:
        """Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
        """
        return len(self._cards)


    num_cards = property(get_num_cards)
    """Tells how many **total** cards are in the stack - both `faceUp` and `faceDown`.
    """


    def get_top_card(self) -> Card:
        """A readable copy of the visible card on top of the stack.
        """
        assert self.num_cards != 0
        return self._cards[self.num_cards - 1]


    top_card = property(get_top_card)
    """A readable copy of the visible card on top of the stack.
    """


    def get_all_cards(self) -> list[Card]:
        """A readable copy of the stack's cards.
        """
        return self._cards.copy()


    all_cards = property(get_all_cards)
    """A readable copy of the stack's cards.
    """


    def push_to_top(self, cards: Card | list[Card]) -> None:
        """Places `cards` on top of the stack.

        Parameters:
            cards: The cards to push to the stack. **Must be in order**.\
            Because it is likely the cards will have already been removed from their source,\
            returning `false` is insufficient. If the cards being added are `<` the\
            `top_card`, **an exception will be thrown.**

        Exceptions:
            "Out of order" error: `cards` is not increasing in value or is of lesser value than {@linkcode FoundationStack.topCard|top}.
        """
        if cards is list:
            if len(cards) == 0:
                warn("Tried to push 0 cards. Was this intentional?")
                return None

            self._cards.extend(cards)
        else:
            self._cards.append(cards)


class Deck:
    """A queue of cards that can have cards pushed to the bottom and pulled from the top.
    Cards in the deck cannot be faceup, and all are facedown.
    It is expected that the Deck only has its cards interacted with via the {@linkcode Hand}.

    Summary:
        A queue.
    """
    def __init__(self, cards = []):
        self._cards: list[Card] = cards
        """The list of cards in the stack.
        The back (last element) is called the top, while the front (first element) is called the bottom.
        """

    def get_num_cards(self) -> int:
        """The total number of cards in the deck.
        """
        return len(self._cards)


    num_cards = property(get_num_cards)
    """The total number of cards in the deck.
    """


    def pushToBottom(self, cards: list[Card]) -> None:
        """Slides `cards` underneath the stack.

        Parameters:
            cards: The cards to push to the front of the queue.
        """
        cards.extend(self._cards)
        self._cards = cards


    def pullFromTop(self, n: int) -> list[Card]:
        """## Only {@linkcode Hand} is intended use this.
        And Game, during setup.
        ### It's not like anything is gonna break, it's just the rules of the game.
        Removes and returns the requested number of cards from the queue.

        Parameters:
            n: The number of cards to pull from the back of the queue.
        """
        assert n <= self.num_cards
        result = self._cards[-n:]
        self._cards = self._cards[:-n]
        return result


    def shuffle(self) -> None:
        """
        * Randomizes the order of the elements.
        """
        for i in reversed(range(self.num_cards)):
            j = random.randint(0, i)
            self._cards[i], self._cards[j] = (self._cards[j], self._cards[i]) # Swaps elements i and j


class Hand:
    """A bounded card stack that has a maximum capacity (of HAND_SIZE_MAX).
    Only allows pulling one element at a time.
    Random access is allowed when HAND_ALLOW_RANDOM_ACCESS is `true`.

    Cards cannot be pushed individually, and can only be given in the form of a `Deck`.

    Summary:
        A fixed-capacity vector.
    """

    def __init__(self, cards: list[Card] = []):
        self._cards: list[Card] = cards
        """The list of cards in the stack.
        The back (last element) is called the top, while the front (first element) is called the bottom.
        """
        assert len(cards) <= rules.HAND_SIZE_MAX

    def get_cards_in_hand(self) -> list[Card]:
        """A readable copy of the cards in the hand.
        """
        return self._cards[:]

    cards_in_hand = property(get_cards_in_hand)
    """A readable copy of the cards in the hand.
    """

    def get_top_card(self) -> Card:
        """A readable copy of the card at the back of the list.
        """
        return self._cards[self.get_num_cards - 1]


    @staticmethod
    def get_is_random_access() -> bool:
        """Tells whether the Hand is allowed random access for cards.
        See:
            HAND_ALLOW_RANDOM_ACCESS
            pullAt
        """
        return rules.HAND_ALLOW_RANDOM_ACCESS
    

    is_random_access = property(get_is_random_access)
    """Tells whether the Hand is allowed random access for cards.
    See:
        HAND_ALLOW_RANDOM_ACCESS
        pullAt
    """


    @staticmethod
    def get_max_cards() -> int:
        """The maximum capacity of the Hand.
        @see HAND_SIZE_MAX
        """
        return rules.HAND_SIZE_MAX
    

    max_cards = property(get_max_cards)
    """The maximum capacity of the Hand.
    @see HAND_SIZE_MAX
    """


    def get_num_cards(self) -> int:
        """The number of cards currently in the hand.
        [0..HAND_SIZE_MAX)
        """
        return len(self._cards)


    num_cards = property(get_num_cards)
    """The number of cards currently in the hand.
    [0..HAND_SIZE_MAX)
    """


    def pullAt(self, index: int) -> Card | Literal[False]:
        """
        * Removes and returns the card at the provided index.
        * Do not use if `cards` is empty.
        * @returns `Literal[False]` if {@linkcode rules.HAND_ALLOW_RANDOM_ACCESS|HAND_ALLOW_RANDOM_ACCESS} is false.
        * @param index The zero-based index of the card to pull.
        """

        if not rules.HAND_ALLOW_RANDOM_ACCESS:
            print("Random Hand access is currently disallowed by the HAND_ALLOW_RANDOM_ACCESS rule.")
            traceback.print_exc()
            return False

        assert self.get_num_cards > 0
        assert index < self.get_num_cards

        return self._cards.pop(index)


    """
     * Removes and returns the card at the top.
     * @returns The card at the top.
    """
    def pull(self) -> Card:
        assert self.get_num_cards > 0
        return self._cards.pop()


    """
     * Draws a new set of cards from the deck.
     * Passes the full contents of the hand to the bottom of the deck, then pulls
     * {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX} cards from the top of the deck to insert back into the hand.
     * If the deck has fewer than {@linkcode rules.HAND_SIZE_MAX|HAND_SIZE_MAX} cards,
     * the entire remaining deck will be emptied into the hand.
    """
    def draw(self, deck: Deck) -> None:
        deck.pushToBottom(self._cards)
        self._cards = deck.pullFromTop(min(rules.HAND_SIZE_MAX, deck.num_cards))


"""
 * Storage for gameplay elements.
"""
class Game:

    def __init__(self, deck: list[Card]):
        self.deck = Deck(deck)
        self.hand = Hand()
        self.foundation = [FoundationStack()]
        self.field = [
            FieldStack(),
            FieldStack(),
            FieldStack(),
            FieldStack(),
            FieldStack(),
            FieldStack(),
            FieldStack(),
            FieldStack(),
        ]


    deck: Deck
    """The source of cards.
    """

    hand: Hand
    """The "working memory" of the deck.
    """

    foundation: list[FoundationStack]
    """The destination of sorted stacks.
    """

    field: list[FieldStack]
    """The destination
    """

    def _deal_to_field(self) -> None:
        """Deals out cards to the field.
        Each stack in the field gets one more card than the previous, and the first gets 1.
        """
        for i in range(len(self.field)):
            self.field[i].push_to_top(self.deck.pullFromTop(i + 1))


    def setup(self) -> None:
        """Sets up the game.
        1. Shuffles the deck
        2. Deals cards to the field
        3. Deals cards to hand
        """
        self.deck.shuffle()
        self.deal_to_field()
        self.hand.draw(self.deck)


    def visualize(self) -> None:
        """Prints a snapshot of the game to the console.
        """
        indent = 0

        def group(str):
            print(str)
            indent += 1

        def groupEnd():
            assert indent > 0
            indent -= 1

        group("snapshot")

        if self.deck.num_cards > 0:
            print('  '*indent+f'deck: {self.deck.num_cards} cards')
        else:
            print('  '*indent+'deck: empty')


        if self.hand.num_cards > 0:
            print('  '*indent+f'hand: {self.hand.num_cards} (out of {Hand.max_cards} max) cards: [[{self.hand.cards_in_hand.join("][")}]]')
        else:
            print('  '*indent+f'hand: empty ({Hand.max_cards} max)')


        group("field");
        for i in range(len(self.field)):
            if self.field[i].num_cards > 0:
                print('  '*indent+f'{i}: {self.field[i].num_cards} cards: [{"[?]".repeat(self.field[i].faceDown)}[{self.field[i].faceUpCards.join("][")}]]')
            else:
                print('  '*indent+f'{i}: empty')


        groupEnd()

        group("foundation")
        for i in range(len(self.foundation)):
            if self.foundation[i].num_cards > 0:
                print('  '*indent+f'{i}: {self.foundation[i].numCards} cards: top: [{self.foundation[i].topCard}]')
            else:
                print('  '*indent+f'{i}: empty')

        groupEnd()

        groupEnd()


class GameAction:
    """A performable move in the game.
    Call exec to perform the move.
    """

    score: int
    """Value of playing this move.
    """

    exec: Callable[[None], None]
    """Perform the action.
    """

    debug: str
    """
    """


class GameStatus:
    LOSS = 0,
    """No moves possible, didn't win.
    """

    PLAYING = 1,
    """Moves possible.
    """

    WIN = 2,
    """No moves possible, won.
    """

class Gamer:
    """AI player. Selects strategy based on rules.
    """

    def __init__(self, game: Game):
        self._game: Game = game
        """Personal reference to the game so we don't have to constantly pass it around.
        """
    

    def _get_move_options(self) -> list[GameAction]:
        """Returns a list of the possible moves in the gamestate.
        If the result is an empty array, no moves are possible and the game should end.
        """
        options: list[GameAction] = []

        if (Hand.is_random_access):
            self._game.hand.cards_in_hand
        else:
            self._game.hand.top_card

        for src in self._game.field:
            moveable_cards = src.moveable_cards
            moveable = len(moveable_cards)
            for dest in self._game.field:
                if src == dest:
                    continue

                dest_top = dest.top_card
                if not dest_top:
                    continue

                for num in range(moveable):
                    if stackable(dest_top, moveable_cards[num]):
                        options.append({
                            'score': 1,
                            'exec': lambda: dest.push_to_top(src.pull_from_top(num + 1)),
                            'debug': f'Move ',
                        })
                        break

        # Debug
        if self._game.hand.num_cards != 0:
            options.append({
                'score': 999,
                'exec': lambda:
                    # Transfers top card from hand into first column of the field
                    self._game.field[0].push_to_top(self._game.hand.pull())
            })
        return options

    def try_make_move(self) -> GameStatus:
        """Selects and performs a move in the game.
        @returns Success. If false, no moves are possible and game should end.
        """

        options: list[GameAction] = self._get_move_options()

        if len(options) == 0:
            # Todo: Add "win" condition
            # Todo: Make sure infinite loops are caught and treated as losses.
            return GameStatus.LOSS
        
        highest_scored_option = options[0]
        for opt in options:
            if opt.score > highest_scored_option.score:
                highest_scored_option = opt

        # print("move options")
        # for opt in options:
        #     print(cleanLambda(opt.exec)) # Not sure how to do this
        
        # print(f'Selected move: {cleanLambda(highest_scored_option.exec.toString())}') # Nor this

        highest_scored_option.exec()

        return GameStatus.PLAYING


def play(data: list[Card]) -> list[Card] | Literal[False]:
    """Plays a game of solitaire.
    @param data The input cards.
    @returns The sorted list. Returns `False` if lost.
    """
    game: Game = Game(data)
    game.setup()
    gamer: Gamer = Gamer(game)

    while True:

        # Display the game state before each move
        game.visualize()

        game_status = gamer.try_make_move()

        if game_status == GameStatus.LOSS:
            print("Lost")
            return False
        elif game_status == GameStatus.PLAYING:
            break
        elif game_status == GameStatus.WIN:
            stacks: list[list[Card]] = map(lambda stack: stack.all_cards, game.foundation)
            return [element for sublist in stacks for element in sublist] # This is so weird looking
        else:
            raise "What?"


def solitaireSort(data: list[Card], rules) -> list[Card]:
    """
    * Sorts the data by playing a game of faux-solitaire.
    * @param data The list of cards to be sorted.
    * @todo Pass in rules as object instead of using constants
    """
    # max_tries: int = 3
    # for i in range(max_tries):
    sorted: list[Card] | Literal[False] = play(data.copy())
    # if sorted != False:
    return sorted or data
    # 
    # 
    # throw new Error(`Lost ${maxTries} times. Not retrying.`);
