import { interpret } from "@xstate/fsm"

import createMachine from "./fsm"

let state
const createService = ({ initialValue } = {}) => {
  const service = interpret(createMachine({ initialValue }))
  service.subscribe(update => (state = update))
  service.start()
  return service
}
afterEach(() => {
  state = undefined
})

const createFn = (value, ms = 0) => {
  const res = {}
  res.done = new Promise(done => {
    res.fn = jest.fn(() => {
      return new Promise((resolve, reject) =>
        setTimeout(() => {
          value instanceof Error ? reject(value) : resolve(value)
          done()
        }, ms),
      )
    })
  })
  return res
}

it("accepts initial data", () => {
  const data = { a: 1 }
  createService({ initialValue: data })
  expect(state.value).toBe("initial")
  expect(state.context.data).toBe(data)
})

it("accepts initial error", () => {
  const error = new Error("not cool")
  createService({ initialValue: error })
  expect(state.value).toBe("initial")
  expect(state.context.error).toBe(error)
})

it("runs to fulfilment", async () => {
  const data = { a: 1 }
  const { fn, done } = createFn(data)
  const { send } = createService()

  send({ type: "START", payload: fn, send })
  expect(state).toEqual(
    expect.objectContaining({
      value: "pending",
      context: expect.objectContaining({
        data: undefined,
        error: undefined,
      }),
    }),
  )

  await done
  expect(state).toEqual(
    expect.objectContaining({
      value: "fulfilled",
      context: expect.objectContaining({
        data,
        error: undefined,
      }),
    }),
  )
})

it("runs to rejection", async () => {
  const error = new Error("oops")
  const { fn, done } = createFn(error)
  const { send } = createService()

  send({ type: "START", payload: fn, send })
  expect(state).toEqual(
    expect.objectContaining({
      value: "pending",
      context: expect.objectContaining({
        data: undefined,
        error: undefined,
      }),
    }),
  )

  await done
  expect(state).toEqual(
    expect.objectContaining({
      value: "rejected",
      context: expect.objectContaining({
        data: undefined,
        error,
      }),
    }),
  )
})

test("supports synchronous operation", async () => {
  const { send } = createService()
  const fn = jest.fn(() => "cool")

  send({ type: "START", payload: fn, send })
  expect(fn).toHaveBeenCalled()
  expect(state.value).toBe("fulfilled")
  expect(state.context.data).toBe("cool")
})

test("supports asynchronous operation", async () => {
  const { send } = createService()
  const { fn, done } = createFn("cool")

  send({ type: "START", payload: fn, send })
  expect(fn).toHaveBeenCalled()
  expect(state.value).toBe("pending")

  await done
  expect(state.value).toBe("fulfilled")
  expect(state.context.data).toBe("cool")
})

it("returns to previous state when cancelled", async () => {
  const { send } = createService()
  const { fn, done } = createFn("cool")

  send({ type: "START", payload: fn, send })
  expect(fn).toHaveBeenCalled()
  expect(state.value).toBe("pending")
  send({ type: "CANCEL" })

  await done
  expect(state.value).toBe("initial")
  expect(state.context.data).toBe(undefined)
})

it("ignores outdated promises on subsequent runs", async () => {
  let ms = 0
  const fn = arg => new Promise(resolve => setTimeout(resolve, (ms += 10), arg))
  const { send } = createService()

  const one = createFn("one")
  const two = createFn("two", 10)

  send({ type: "START", payload: one.fn, send })
  send({ type: "START", payload: two.fn, send })

  expect(state.value).toBe("pending")

  await one.done
  expect(state.value).toBe("pending")

  await two.done
  expect(state.value).toBe("fulfilled")
  expect(state.context.data).toBe("two")
})
