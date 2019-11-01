import * as actionCreators from "./actionCreators"
import reducer from "./reducer"
import { register, dispatch } from "./dispatcher"

const bindAction = actionCreator => (...args) => dispatch(actionCreator(...args))
const boundActions = Object.keys(actionCreators).reduce(
  (acc, key) => ({ ...acc, [key]: bindAction(actionCreators[key]) }),
  {},
)

export default (getState, setState) => {
  const destroy = register(action => setState(reducer(getState(), action)))
  return { ...boundActions, destroy }
}
