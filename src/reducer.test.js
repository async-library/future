import { init, start, fulfill, reject, cancel } from "./actionCreators"
import { stateReducer, compose } from "./reducer"
import withAbortController from "./withAbortController"
import withMetadata from "./withMetadata"

const reducer = compose(
  stateReducer,
  withMetadata,
  withAbortController,
)

const initialState = reducer({}, init({}))

describe("with unknown action", () => {
  it("passes state verbatim", () => {
    const state = { status: "pending" }
    const result = stateReducer(state, { type: "unknown" })
    expect(result).toBe(state)
  })
})

describe("unfinished sequence", () => {
  it("becomes pending", () => {
    let state = initialState
    state = reducer(state, start({}))
    expect(state.status).toBe("pending")
    expect(state.startedCount).toBe(1)
    expect(state.startedAt).toBeInstanceOf(Date)
  })
})

describe("succesful sequence", () => {
  it("becomes fulfilled with data", () => {
    let state = initialState
    const data = { a: 1 }

    state = reducer(state, start({}))
    expect(state.status).toBe("pending")

    state = reducer(state, fulfill({ data }))
    expect(state.status).toBe("fulfilled")
    expect(state.data).toBe(data)
    expect(state.finishedAt).toBeInstanceOf(Date)
  })

  it("replaces optimistic data", () => {
    let state = initialState
    const data1 = { a: 1 }
    const data2 = { a: 2 }

    state = reducer(state, start({ data: data1 }))
    expect(state.data).toBe(data1)

    state = reducer(state, fulfill({ data: data2 }))
    expect(state.data).toBe(data2)
  })
})

describe("failed sequence", () => {
  it("becomes rejected with error", () => {
    let state = initialState
    const error = new Error("oops")

    state = reducer(state, start({}))
    state = reducer(state, reject({ error }))

    expect(state.status).toBe("rejected")
    expect(state.error).toBe(error)
    expect(state.finishedAt).toBeInstanceOf(Date)
  })
})

describe("cancelled first sequence", () => {
  it("reverts to initial state", () => {
    let state = initialState

    state = reducer(state, start({}))
    state = reducer(state, cancel())

    expect(state.status).toBe("initial")
    expect(state.startedCount).toBe(1)
  })
})

describe("cancelled second sequence", () => {
  it("reverts to previous state", () => {
    let state = initialState
    const data = { a: 1 }

    state = reducer(state, start({}))
    state = reducer(state, fulfill({ data }))
    state = reducer(state, start({}))
    state = reducer(state, cancel())

    expect(state.status).toBe("fulfilled")
    expect(state.data).toBe(data)
    expect(state.startedCount).toBe(2)
  })
})

describe("failed third sequence", () => {
  it("becomed rejected with error and data", () => {
    let state = initialState
    const data = { a: 1 }
    const error = new Error("oops")

    state = reducer(state, start({}))
    state = reducer(state, fulfill({ data }))
    state = reducer(state, start({}))
    state = reducer(state, reject({ error }))
    state = reducer(state, start({}))
    state = reducer(state, cancel())

    expect(state.status).toBe("rejected")
    expect(state.error).toBe(error)
    expect(state.data).toBe(data)
    expect(state.startedCount).toBe(3)
  })
})

describe("race condition", () => {
  it("ignores the outdated run", () => {
    let state = initialState
    const fn1 = () => {}
    const fn2 = () => {}
    const data1 = { a: 1 }
    const data2 = { a: 2 }

    state = reducer(state, start({ fn: fn1 }))
    state = reducer(state, start({ fn: fn2 }))
    state = reducer(state, fulfill({ fn: fn2, data: data2 }))
    state = reducer(state, fulfill({ fn: fn1, data: data1 }))

    expect(state.status).toBe("fulfilled")
    expect(state.data).toBe(data2)
  })
})

describe("with AbortController", () => {
  it("aborts on start", () => {
    let state = initialState
    const abort = jest.fn()
    state.abortController = { abort }

    state = reducer(state, start({}))

    expect(abort).toHaveBeenCalled()
  })

  it("creates a new AbortController on each start", () => {
    const first = reducer(initialState, start({}))
    expect(first.abortController).toBeInstanceOf(AbortController)

    const second = reducer(first, start({}))
    expect(second.abortController).toBeInstanceOf(AbortController)
    expect(second.abortController).not.toBe(first.abortController)
  })
})
