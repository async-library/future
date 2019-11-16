import * as actionHandlers from "./actionHandlers"
import { AsyncState, Payload } from "./types"
import withAbortController from "./withAbortController"
import withMetadata from "./withMetadata"
import withStatusProps from "./withStatusProps"

type Action<T> = {
  type: keyof typeof actionHandlers
  payload: Payload<T>
}

export const stateReducer = <T>(state: AsyncState<T>, action: Action<T>) => {
  const handler = actionHandlers[action.type] || ((state: AsyncState<T>) => state)
  return handler(state, action.payload || {})
}

export const compose = (...reducers) => (state, action) =>
  reducers.reduce((state, reducer) => reducer(state, action), state)

export default compose(stateReducer, withMetadata, withStatusProps, withAbortController)
