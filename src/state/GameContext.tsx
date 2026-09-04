import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { setSoundEnabled } from '../lib/sound'
import type { GameState } from '../types'
import { gameReducer, loadState, saveState, type Action } from './gameReducer'

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<Action>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    setSoundEnabled(state.sound)
  }, [state.sound])

  // Dev only: ruční ovládání z konzole prohlížeče (window.__game.dispatch({...}))
  useEffect(() => {
    if (import.meta.env.DEV) {
      ;(window as unknown as { __game?: unknown }).__game = { state, dispatch }
    }
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
