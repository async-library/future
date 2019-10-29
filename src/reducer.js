import * as actionHandlers from "./actionHandlers"
import withMetadata from "./withMetadata"
import withStatusProps from "./withStatusProps"

export const initialState = {
  status: "initial",
  data: undefined,
  error: undefined,
}

export const stateReducer = (state = initialState, action = {}) => {
  const handler = actionHandlers[action.type] || (state => state)
  return handler(state, action.payload || {})
}

export const compose = (...reducers) => (state, action) =>
  reducers.reduce((state, reducer) => reducer(state, action), state)

export default compose(
  stateReducer,
  withMetadata,
  withStatusProps,
)
