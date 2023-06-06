/**
 * @file solitaire-sort.c
 * @author Henry Wilder (henrythepony@gmail.com)
 * @brief Sorting algorithm which plays a game of faux-solitare to order elements.
 * @version 0.1
 * @date 2023-06-05
 *
 * @copyright Copyright (c) 2023
 *
 * @remark This file does not adhere to the "Power Of 10" standard, as it is explicitly a joke and not meant for production.
 */

// I know the parameter orders are a bit unorthodox, I wanted to make sure SAL was able to access the size parameters.

#include <time.h>
#include <sal.h>
#include <stdlib.h>
#include "solitaire-sort.h"

int RandBetween(
    int min,
    int max)
{
    int result = rand() * (max - min) + min;
    return result;
}

// Constants
enum
{
    NUM_FIELD_STACKS = 8,
    NUM_CARDS_IN_HAND = 3,
    MAX_RETRIES = 3,
};

typedef struct
{
    _Field_size_(numCards) card_t *cards;
    size_t numCards;
    /** Should not transfer more than this outside of setup. */
    _Field_range_(0, numCards) size_t visible;

} CardStack;

/**
 * Unassertable assumption: src array must be EXACTLY (count)-many elements.
 * To construct empty, provide empty array and 0 in count.
 */
void ConstructStack(
    _Out_ CardStack *stack,
    _In_reads_(count) const card_t src[],
    const size_t count,
    const size_t visible)
{
    stack->cards = (card_t *)malloc(count);
    stack->numCards = count;
    stack->visible = visible;
}

// Might be misunderstanding the SAL notation.
// In case I get warnings or errors later on: stack will not be null, but its insides will be emptied and nullified.
void DestructStack(
    _Inout_ CardStack *stack)
{
    if (stack->cards)
    {
        free(stack->cards);
    }

    // Just to be safe in case some schmuck like myself tries to reuse a destructed stack.
    stack->cards = NULL;
    stack->numCards = 0;
    stack->visible = 0;
}

/**
 * Unassertable assumption: src array must be AT LEAST (start + count)-many elements.
 */
void PushToStack(
    _Inout_ CardStack *stack,
    _In_reads_(start + count) const card_t src[],
    const size_t start,
    const size_t count)
{
    card_t *temp = stack->cards;

    const size_t newNumCards = stack->numCards + count;
    stack->cards = (card_t *)malloc(newNumCards);

    {
        size_t i = 0;
        // Copy over pre-existing elements
        for (; i < stack->numCards; ++i)
        {
            stack->cards[i] = temp[i];
        }
        // Push new elements
        for (size_t j = start; (i < newNumCards) && (j < start + count); ++i, ++j)
        {
            stack->cards[i] = src[j];
        }
    }

    // The fact that temp might have been null will not matter until we try to free it.
    // The for loop above would only have tried to access temp's elements if numCards != 0,
    // which would mean it was initialized incorrectly anyway--and that's not this function's problem to deal with.
    if (temp)
    {
        free(temp);
    }

    stack->numCards = newNumCards;
}

void PopFromStack(
    _Inout_ CardStack *stack,
    const size_t count)
{
    stack->numCards -= count;
}

void TransferCards(
    const size_t start,
    const size_t count,
    _Inout_ CardStack *src,
    _Inout_ CardStack *dest)
{
    PushToStack(dest, src->cards, start, count);
    PopFromStack(src, count);
}

typedef CardStack Deck;

typedef struct
{
    Deck deck;
    CardStack hand;
    CardStack field[NUM_FIELD_STACKS]; // Unordered cards in the process of being ordered
    CardStack ordered[1];              // Where complete pile goes - Would have a set of four stacks in real solitare, but we're only sorting one list.
} Board;

void Shuffle(
    _Inout_ Deck *deck)
{
    // todo
}

/**
 * Splits deck onto field
 */
void Deal(
    _Inout_ Deck *deck,
    _Out_ Board *board)
{
    for (size_t stackToFill = NUM_FIELD_STACKS; stackToFill > 0; --stackToFill)
    {
        for (size_t i = 0; i < stackToFill; ++i)
        {
            // todo
        }
    }
}

/**
 * Treat output as boolean
 */
char CheckOrdered(
    _In_reads_(size) const card_t *const data[],
    const size_t size)
{
    for (size_t i = 1; i < size; ++i)
    {
        if (data[i - 1] > data[i])
        {
            return 0;
        }
    }
    return 1;
}

_Success_(return == 0) int TrySort(
    _Out_ CardStack *result,
    _In_reads_(size) const card_t data[],
    const size_t size)
{
    Deck deck;
    ConstructStack(&deck, data, size, 0);

    Board board;
    Deal(&deck, &board);

    // todo
    ConstructStack(result, data, size, 0);

    // todo

    CheckOrdered(&(result->cards), result->numCards);
}

_Success_(return == 0) int SolitaireSort(
    _Inout_updates_all_(size) card_t *data[],
    const size_t size)
{
    for (size_t i = 0; i < MAX_RETRIES; ++i) // Can retry a maximum of three times before returning with error.
    {
        CardStack result; // Will get assigned by TrySort
        if (TrySort(&result, *data, size) == 0)
        {
            for (size_t i = 0; i < size; ++i)
            {
                (*data)[i] = result.cards[i];
            }
            DestructStack(&result);
            return 0;
        }
        DestructStack(&result);
    }
    return 1;
}
