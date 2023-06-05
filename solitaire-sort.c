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

#include <stdlib.h>
#include "solitaire-sort.h"

typedef struct
{
    char *cards;
    int deckSize;
} Deck;

typedef struct
{
    Deck deck;
    char hand[3];
    char *field[8];  // Unordered cards in the process of being ordered
    char *stacks[1]; // Where complete piles go - Would have a set of four stacks in real solitare, but we're only sorting one list.
} Board;

void Scramble(Deck *deck)
{
    // todo
}

void Deal(Deck *deck, const char *data, const int size)
{
    deck->deckSize = size;
    deck->cards = malloc(deck->deckSize);
    for (int i = 0; i < size; ++i)
    {
        deck->cards[i] = data[i];
    }
}
void PackUp(Deck *deck)
{
    free(deck->cards);
}

int SolitaireSort(char *data, const int size)
{
    Deck deck;
    Deal(&deck, data, size);
    for (int i = 0; i < 3; ++i) // Can retry a maximum of three times before returning with error.
    {
        Scramble(&deck);
    }
    PackUp(&deck);
    return 1;
}
