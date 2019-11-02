import * as actionHandlers from "./actionHandlers"
import withAbortController from "./withAbortController"
import withMetadata from "./withMetadata"
import withStatusProps from "./withStatusProps"

export const stateReducer = (state, action) => {
  const handler = actionHandlers[action.type] || (state => state)
  return handler(state, action.payload || {})
}

export const compose = (...reducers) => (state, action) =>
  reducers.reduce((state, reducer) => reducer(state, action), state)

export default compose(
  stateReducer,
  withMetadata,
  withStatusProps,
  withAbortController,
)
