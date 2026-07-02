import type { Transition } from 'framer-motion'

export const defaultTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export { AnimatePresence, motion } from 'framer-motion'
