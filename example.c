#include <stdio.h>
#include "solitaire-sort.h"

int main()
{
    card_t data[] = {
        '1',
        '5',
        '2',
        '5',
        '3',
        '9',
        '6',
        '9',
        '7',
        '0',
        '4',
    };
    const int numItems = sizeof(data) / sizeof(card_t);
    int success = SolitaireSort(((card_t **)(&data)), numItems);
    for (int i = 0; i < numItems; ++i)
    {
        printf("%c, ", data[i]);
    }
    return success;
}