import createIntegration from "./integration"

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

// it("supports adding new data to old data", async () => {
//   const fn = (params, state) => Promise.resolve(state.concat(params))
//   const app = createApp({ fn, initialValue: [] })

//   await app.run([1, 2])
//   await app.run([3, 4])

//   expect(state.data).toEqual([1, 2, 3, 4])
// })
