import type { ReactNode } from 'react'

import {
  DirectionContext,
  type Direction,
} from './direction-context'

type DirectionProviderProps = {
  children: ReactNode
  direction?: Direction
}

export function DirectionProvider({
  children,
  direction = 'rtl',
}: DirectionProviderProps) {
  return (
    <DirectionContext.Provider value={direction}>
      {children}
    </DirectionContext.Provider>
  )
}
