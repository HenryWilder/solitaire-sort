#ifndef SOLITAIRE_SORT
#define SOLITAIRE_SORT

typedef char card_t;

/**
 * @brief Sorts an array of chars by playing Solitaire with it.
 *
 * @param data The char array.
 * @param size The size of the char array.
 */
_Success_(return == 0) int SolitaireSort(
    _Inout_updates_all_(size) card_t *data[],
    const size_t size);

#endif
