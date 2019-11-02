import { init, start, fulfill, reject, cancel } from "./actionHandlers"

describe("init", () => {
  it("defines the initial state", () => {
    const result = init({}, {})
    expect(result).toEqual(
      expect.objectContaining({
        fn: undefined,
        status: "initial",
        data: undefined,
        error: undefined,
        settled: false,
      }),
    )
  })

  it("retains unrelated state props", () => {
    const state = { a: 1 }
    const result = init(state, {})
    expect(result).toEqual(expect.objectContaining(state))
  })

  it("accepts initial data and error", () => {
    const data = { a: 1 }
    const error = new Error("oops")
    const result = init({}, { data, error })
    expect(result.data).toBe(data)
    expect(result.error).toBe(error)
  })
})

describe("start", () => {
  it("updates status and fn", () => {
    const fn = () => {}
    const state = { status: "initial" }
    const payload = { fn }
    const result = start(state, payload)
    expect(result.status).toBe("pending")
    expect(result.fn).toBe(fn)
  })

  it("supports optimistic update", () => {
    const state = { status: "initial" }
    const payload = { data: "optimistic" }
    const result = start(state, payload)
    expect(result.status).toBe("pending")
    expect(result.data).toBe("optimistic")
  })
})

describe("fulfill", () => {
  it("updates status and data", () => {
    const data = { a: 1 }
    const state = { status: "pending" }
    const payload = { data }
    const result = fulfill(state, payload)
    expect(result.status).toBe("fulfilled")
    expect(result.data).toBe(data)
  })

  it("clears any error", () => {
    const state = { status: "rejected", error: new Error("oops") }
    const payload = { data: "okay" }
    const result = fulfill(state, payload)
    expect(result.status).toBe("fulfilled")
    expect(result.error).toBeUndefined()
  })

  it("ignores payload if fn reference is outdated", () => {
    const fn = () => {}
    const state = { status: "pending", data: "okay", fn }
    const payload = { data: "outdated", fn: () => {} }
    const result = fulfill(state, payload)
    expect(result).toBe(state)
  })
})

describe("reject", () => {
  it("updates status and error, retains data", () => {
    const error = new Error("oops")
    const state = { status: "pending" }
    const payload = { error }
    const result = reject(state, payload)
    expect(result.status).toBe("rejected")
    expect(result.error).toBe(error)
  })

  it("retains data", () => {
    const state = { status: "pending", data: "cool" }
    const payload = { error: new Error("oops") }
    const result = reject(state, payload)
    expect(result.status).toBe("rejected")
    expect(result.data).toBe("cool")
  })

  it("ignores payload if fn reference is outdated", () => {
    const fn = () => {}
    const error = new Error("oops")
    const state = { status: "pending", data: "okay", fn }
    const payload = { error, fn: () => {} }
    const result = reject(state, payload)
    expect(result).toBe(state)
  })
})

describe("cancel", () => {
  it("changes the fn reference", () => {
    const fn = () => {}
    const state = { status: "pending", fn }
    const result = cancel(state)
    expect(result.fn).not.toBe(fn)
  })

  describe("without data or error", () => {
    it("returns to the initial state", () => {
      const state = { status: "pending" }
      const result = cancel(state)
      expect(result.status).toBe("initial")
      expect(result.data).toBeUndefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe("with data", () => {
    it("returns to fulfilled state", () => {
      const data = { a: 1 }
      const state = { status: "pending", data, settled: true }
      const result = cancel(state)
      expect(result.status).toBe("fulfilled")
      expect(result.data).toBe(data)
    })

    it("accepts undefined as data", () => {
      const data = undefined
      const state = { status: "pending", data, settled: true }
      const result = cancel(state)
      expect(result.status).toBe("fulfilled")
      expect(result.data).toBe(data)
    })
  })

  describe("with error", () => {
    it("returns to rejected state", () => {
      const data = { a: 1 }
      const error = new Error("oops")
      const state = { status: "pending", data, error, settled: true }
      const result = cancel(state)
      expect(result.status).toBe("rejected")
      expect(result.error).toBe(error)
      expect(result.data).toBe(data)
    })
  })
})
