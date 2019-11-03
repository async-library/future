import { start, cancel } from "./actionCreators"
import { register, bind } from "./dispatcher"
import reducer from "./reducer"

export default ({ fn, getState, setState, initialValue }) => {
  const initialState =
    initialValue instanceof Error ? { error: initialValue } : { data: initialValue }
  const destroy = register(action => setState(reducer(getState(), action)), initialState)
  return {
    run: params => bind(start)({ fn: () => fn(params, getState()) }),
    cancel: bind(cancel),
    destroy,
  }
}
