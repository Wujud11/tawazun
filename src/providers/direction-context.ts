import { createContext, useContext } from 'react'

export type Direction = 'rtl' | 'ltr'

export const DirectionContext = createContext<Direction>('rtl')

export function useDirection(): Direction {
  return useContext(DirectionContext)
}
