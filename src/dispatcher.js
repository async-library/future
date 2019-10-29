import { fulfill, reject } from "./actionCreators"

const callbacks = []
const run = action => callbacks.forEach(cb => cb && cb(action))

export const register = callback => callbacks.push(callback) - 1
export const unregister = id => (callbacks[id] = undefined)

export const dispatch = async (action = {}) => {
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
