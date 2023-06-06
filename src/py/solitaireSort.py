"""
file: solitaireSort.py
author: Henry Wilder (henrythepony@gmail.com)
brief: Sorting algorithm which plays a game of faux-solitare to order elements.
version: 0.1
date: 2023-06-06

copyright: Copyright (c) 2023

remark: This project is explicitly a joke and not meant for production.
"""

class _CardStack:
    def __init__(self, cards: list = [], visible: int = 0):
        self.cards: list = cards
        self.visible: int = visible

def solitaireSort(cards: list):
    """
    Plays a game of faux-solitare to order elements.
    """
    print('Hello world')
