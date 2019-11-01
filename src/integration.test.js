import createApp from "./integration"

let state
const getState = () => state
const setState = value => (state = value)

let app
beforeEach(() => {
  app = createApp(getState, setState)
})
afterEach(() => {
  app.destroy()
  state = undefined
})

it("runs to fulfilment", async () => {
  const data = { a: 1 }
  const fn = () => Promise.resolve(data)

  const done = app.start({ fn })
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
  const error = new Error("oops")
  const fn = () => Promise.reject(error)

  const done = app.start({ fn })
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
  expect(state.status).toBe("initial")

  const data = { a: 1 }
  const fn = () => Promise.resolve(data)

  const done = app.start({ fn })
  expect(state.status).toBe("pending")

  app.cancel()
  await done
  expect(state.status).toBe("initial")
})

it("ignores outdated promises on subsequent runs", async () => {
  const fn1 = () => new Promise(resolve => setTimeout(resolve, 0, "one"))
  const fn2 = () => new Promise(resolve => setTimeout(resolve, 10, "two"))

  const one = app.start({ fn: fn1 })
  const two = app.start({ fn: fn2 })
  expect(state.status).toBe("pending")
  expect(state.fn).toBe(fn2)

  await one
  expect(state.status).toBe("pending")

  await two
  expect(state.status).toBe("fulfilled")
  expect(state.data).toBe("two")
})

it("supports adding new data to old data", () => {
  app.start({ fn: () => [1, 2] })
  app.start({ fn: () => [...state.data, 3, 4] })

  expect(state.data).toEqual([1, 2, 3, 4])
})
