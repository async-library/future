export const init = (state, payload) => {
  return {
    ...state,
    fn: payload.fn,
    status: "initial",
    data: payload.data,
    error: payload.error,
    settled: false,
  }
}

export const start = (state, payload) => {
  return {
    ...state,
    fn: payload.fn,
    status: "pending",
    data: payload.data || state.data,
    error: payload.data ? undefined : state.error,
    settled: state.settled,
  }
}

export const fulfill = (state, payload) => {
  if (state.fn !== payload.fn) {
    return state
  }
  return {
    ...state,
    fn: state.fn,
    status: "fulfilled",
    data: payload.data,
    error: undefined,
    settled: true,
  }
}

export const reject = (state, payload) => {
  if (state.fn !== payload.fn) {
    return state
  }
  return {
    ...state,
    fn: state.fn,
    status: "rejected",
    data: state.data,
    error: payload.error,
    settled: true,
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
