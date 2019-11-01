import { fulfill, reject } from "./actionCreators"

const callbacks = []
const run = action => callbacks.forEach(callback => callback && callback(action))
const add = callback => callbacks.push(callback) - 1
const remove = id => (callbacks[id] = undefined)

export const register = callback => {
  const id = add(callback)
  callback({ type: "init" })
  return () => remove(id)
}

export const dispatch = async action => {
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
