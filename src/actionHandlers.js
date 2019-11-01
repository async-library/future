export const start = (state, payload) => {
  return {
    ...state,
    fn: payload.fn,
    status: "pending",
    data: payload.data || state.data,
    error: payload.data ? undefined : state.error,
  }
}

export const fulfill = (state, payload) => {
  if (state.fn !== payload.fn) {
    return state
  }
  return {
    ...state,
    settled: true,
    status: "fulfilled",
    data: payload.data,
    error: undefined,
  }
}

export const reject = (state, payload) => {
  if (state.fn !== payload.fn) {
    return state
  }
  return {
    ...state,
    settled: true,
    status: "rejected",
    error: payload.error,
  }
}

export const cancel = state => {
  // Wrap fn to change its reference
  const fn = state.fn && ((...args) => state.fn(...args))
  return !state.settled
    ? { ...state, fn, status: "initial" }
    : state.error
    ? { ...state, fn, status: "rejected" }
    : { ...state, fn, status: "fulfilled" }
}
