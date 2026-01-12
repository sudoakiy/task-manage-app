import { Board, List, Card } from '@prisma/client'

export type { Board, List, Card }

export type ListWithCards = List & {
  cards: Card[]
}

export type BoardWithLists = Board & {
  lists: ListWithCards[]
}
