import { start, cancel } from "./actionCreators"
import { register, bind } from "./dispatcher"
import reducer from "./reducer"

export default function createService({ getState, setState, fn, initialValue }) {
  const initialState =
    initialValue instanceof Error ? { error: initialValue } : { data: initialValue }

  const destroy = register(action => setState(reducer(getState(), action)), initialState)

  return {
    run: params => bind(start, getState)({ fn: () => fn(params, getState()) }),
    cancel: bind(cancel),
    subscribe: () =>
      bind(start, getState)({ fn: (fulfill, reject) => fn(fulfill, reject, getState) }),
    destroy,
  }
}
