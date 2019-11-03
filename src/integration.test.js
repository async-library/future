import createIntegration from "./integration"

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let state
const getState = () => state
const setState = value => (state = value)

let _app
const createApp = options => {
  _app = createIntegration({ getState, setState, ...options })
  return _app
}
afterEach(() => {
  _app.destroy()
  state = undefined
})

it("accepts initial data", () => {
  const data = { a: 1 }
  createApp({ initialValue: data })
  expect(state.status).toBe("initial")
  expect(state.data).toBe(data)
})

it("accepts initial error", () => {
  const error = new Error("not cool")
  createApp({ initialValue: error })
  expect(state.status).toBe("initial")
  expect(state.error).toBe(error)
})

it("runs to fulfilment", async () => {
  const data = { a: 1 }
  const fn = () => Promise.resolve(data)
  const app = createApp({ fn })

  const done = app.run()
  expect(state).toEqual(
    expect.objectContaining({
      status: "pending",
      data: undefined,
      error: undefined,
      startedCount: 1,
      finishedCount: 0,
      startedAt: expect.any(Date),
      finishedAt: undefined,
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
  const app = createApp({ fn })

  const done = app.run()
  expect(state).toEqual(
    expect.objectContaining({
      status: "pending",
      data: undefined,
      error: undefined,
      startedCount: 1,
      finishedCount: 0,
      startedAt: expect.any(Date),
      finishedAt: undefined,
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
  const data = { a: 1 }
  const fn = () => Promise.resolve(data)
  const app = createApp({ fn })
  expect(state.status).toBe("initial")

  const done = app.run()
  expect(state.status).toBe("pending")

  app.cancel()
  await done
  expect(state.status).toBe("initial")
})

it("ignores outdated promises on subsequent runs", async () => {
  let ms = 0
  const fn = arg => new Promise(resolve => setTimeout(resolve, (ms += 10), arg))
  const app = createApp({ fn })

  const one = app.run("one")
  const two = app.run("two")
  expect(state.status).toBe("pending")

  await one
  expect(state.status).toBe("pending")

  await two
  expect(state.status).toBe("fulfilled")
  expect(state.data).toBe("two")
})

it("supports adding new data to old data", async () => {
  const values = { a: [1, 2], b: [3, 4] }
  const fn = (key, state) => Promise.resolve(state.data.concat(values[key]))
  const app = createApp({ fn, initialValue: [] })

  await app.run("a")
  await app.run("b")

  expect(state.data).toEqual([1, 2, 3, 4])
})

it("supports subscriptions", async () => {
  const fn = (fulfill, reject) => {
    setTimeout(fulfill, 10, "one")
    setTimeout(fulfill, 20, "two")
    setTimeout(reject, 30, new Error("oops"))
    return "zero"
  }
  const app = createApp({ fn })

  app.subscribe()
  expect(state.data).toBe("zero")

  await delay(10)
  expect(state.data).toBe("one")

  await delay(10)
  expect(state.data).toBe("two")

  await delay(10)
  expect(state.error.message).toBe("oops")
})
