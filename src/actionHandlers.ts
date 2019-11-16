import { AsyncState, InitPayload, StartPayload, FulfillPayload, RejectPayload } from "./types"

export const init = <T>(state: AsyncState<T>, payload: InitPayload<T>) => {
  return {
    // ...state,
    fn: payload.fn,
    status: "initial",
    settled: false,
    data: payload.data,
    error: payload.error,
  }
}

export const start = <T>(state: AsyncState<T>, payload: StartPayload<T>) => {
  return {
    // ...state,
    fn: payload.fn,
    status: "pending",
    settled: state.settled,
    data: payload.data || state.data,
    error: payload.data ? undefined : state.error,
  }
}

export const fulfill = <T>(state: AsyncState<T>, payload: FulfillPayload<T>) => {
  if (state.fn !== payload.fn) {
    return state
  }
  return {
    // ...state,
    fn: state.fn,
    status: "fulfilled",
    settled: true,
    data: payload.data,
    error: undefined,
  }
}

export const reject = <T>(state: AsyncState<T>, payload: RejectPayload<T>) => {
  if (state.fn !== payload.fn) {
    return state
  }
  return {
    // ...state,
    fn: state.fn,
    status: "rejected",
    settled: true,
    data: state.data,
    error: payload.error,
  }
}
