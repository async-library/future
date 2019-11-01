import { start, cancel } from "./actionCreators"
import reducer from "./reducer"
import { dispatch, register } from "./dispatcher"

it("runs to fulfilment", async () => {
  let state
  register(action => (state = reducer(state, action)))

  dispatch()
  expect(state).toEqual(
    expect.objectContaining({
      status: "initial",
      data: undefined,
      error: undefined,
      startedCount: 0,
      finishedCount: 0,
      startedAt: undefined,
      finishedAt: undefined,
    }),
  )

  const data = { a: 1 }
  const fn = () => Promise.resolve(data)

  const done = dispatch(start({ fn }))
  expect(state).toEqual(
    expect.objectContaining({
      status: "pending",
      data: undefined,
      error: undefined,
      startedCount: 1,
      finishedCount: 0,
      startedAt: expect.any(Date),
      finishedAt: undefined,
      fn,
    }),
  )

  await done
  expect(state).toEqual(
    expect.objectContaining({
      status: "fulfilled",
      data,
      error: undefined,
      startedCount: 1,
      finishedCount: 1,
      startedAt: expect.any(Date),
      finishedAt: expect.any(Date),
    }),
  )
})

it("runs to rejection", async () => {
  let state
  register(action => (state = reducer(state, action)))

  dispatch()
  expect(state).toEqual(
    expect.objectContaining({
      status: "initial",
      data: undefined,
      error: undefined,
      startedCount: 0,
      finishedCount: 0,
      startedAt: undefined,
      finishedAt: undefined,
    }),
  )

  const error = new Error("oops")
  const fn = () => Promise.reject(error)

  const done = dispatch(start({ fn }))
  expect(state).toEqual(
    expect.objectContaining({
      status: "pending",
      data: undefined,
      error: undefined,
      startedCount: 1,
      finishedCount: 0,
      startedAt: expect.any(Date),
      finishedAt: undefined,
      fn,
    }),
  )

  await done
  expect(state).toEqual(
    expect.objectContaining({
      status: "rejected",
      data: undefined,
      error,
      startedCount: 1,
      finishedCount: 1,
      startedAt: expect.any(Date),
      finishedAt: expect.any(Date),
    }),
  )
})

it("returns to previous state when cancelled", async () => {
  let state
  register(action => (state = reducer(state, action)))

  dispatch()
  expect(state.status).toBe("initial")

  const data = { a: 1 }
  const fn = () => Promise.resolve(data)

  const done = dispatch(start({ fn }))
  expect(state.status).toBe("pending")

  dispatch(cancel())
  await done
  expect(state.status).toBe("initial")
})

it("ignores outdated promises on subsequent runs", async () => {
  let state
  register(action => (state = reducer(state, action)))
  dispatch()

  const fn1 = () => new Promise(resolve => setTimeout(resolve, 0, "one"))
  const fn2 = () => new Promise(resolve => setTimeout(resolve, 10, "two"))

  const one = dispatch(start({ fn: fn1 }))
  const two = dispatch(start({ fn: fn2 }))
  expect(state.status).toBe("pending")
  expect(state.fn).toBe(fn2)

  await one
  expect(state.status).toBe("pending")

  await two
  expect(state.status).toBe("fulfilled")
  expect(state.data).toBe("two")
})
