import { start } from "./actionCreators"
import { dispatch, register, unregister } from "./dispatcher"

it("allows registering a callback that is invoked on dispatch", () => {
  const callback = jest.fn()
  const action = {}
  register(callback)
  dispatch(action)
  expect(callback).toHaveBeenCalledWith(action)
})

it("allows unregistering a registered callback", () => {
  const callback = jest.fn()
  const id = register(callback)
  dispatch()
  unregister(id)
  dispatch()
  expect(callback).toHaveBeenCalledTimes(1)
})

it("dispatches actions to all registered callbacks", () => {
  const callback = jest.fn()
  for (let i = 0; i < 5; i++) register(callback)
  dispatch()
  expect(callback).toHaveBeenCalledTimes(5)
})

it("invokes the provided function on start", () => {
  const fn = jest.fn()
  dispatch(start({ fn }))
  expect(fn).toHaveBeenCalled()
})

describe("with synchronous fn", () => {
  it("synchronously dispatches the fulfill action when the fn returns", async () => {
    const data = { a: 1 }
    const fn = () => data
    const callback = jest.fn()
    register(callback)

    dispatch(start({ fn }))
    expect(callback).toHaveBeenCalledWith({ type: "start", payload: { fn } })
    expect(callback).toHaveBeenLastCalledWith({ type: "fulfill", payload: { fn, data } })
  })

  it("synchronously dispatches the reject action when the fn throws", async () => {
    const error = new Error("oops")
    const fn = () => {
      throw error
    }
    const callback = jest.fn()
    register(callback)

    dispatch(start({ fn }))
    expect(callback).toHaveBeenCalledWith({ type: "start", payload: { fn } })
    expect(callback).toHaveBeenLastCalledWith({ type: "reject", payload: { fn, error } })
  })
})

describe("with asynchronous fn", () => {
  it("asynchronously dispatches the fulfill action when the async fn resolves", async () => {
    const data = { a: 1 }
    const fn = () => Promise.resolve(data)
    const callback = jest.fn()
    register(callback)

    await dispatch(start({ fn }))
    expect(callback).toHaveBeenCalledWith({ type: "start", payload: { fn } })
    expect(callback).toHaveBeenLastCalledWith({ type: "fulfill", payload: { fn, data } })
  })

  it("asynchronously dispatches the reject action when the async fn rejects", async () => {
    const error = new Error("oops")
    const fn = () => Promise.reject(error)
    const callback = jest.fn()
    register(callback)

    await dispatch(start({ fn }))
    expect(callback).toHaveBeenCalledWith({ type: "start", payload: { fn } })
    expect(callback).toHaveBeenLastCalledWith({ type: "reject", payload: { fn, error } })
  })
})
