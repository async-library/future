import { init, fulfill, reject } from "./actionCreators"

const callbacks = []
const run = action => callbacks.forEach(callback => callback && callback(action))
const add = callback => callbacks.push(callback) - 1
const remove = id => (callbacks[id] = undefined)

export const register = (callback, initialState = {}) => {
  const id = add(callback)
  callback(init(initialState))
  return () => remove(id)
}

export const dispatch = async (action, getState) => {
  if (typeof action === "function") {
    action(dispatch, getState)
    return
  }

  run(action)

  if (action.type === "start") {
    const { fn } = action.payload
    try {
      const result = fn()
      const data = result instanceof Promise ? await result : result
      run(fulfill({ fn, data }))
    } catch (error) {
      run(reject({ fn, error }))
    }
  }
}

export const bind = (actionCreator, getState) => (...args) =>
  dispatch(actionCreator(...args), getState)
