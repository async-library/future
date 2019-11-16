import { Resolver } from "./types"

export const init = <T>({ data, error }: { data?: T; error?: Error }) => ({
  type: "init",
  payload: { data, error },
})

export const start = <T>({ fn, data }: { fn: Resolver<T>; data?: T }) => ({
  type: "start",
  payload: { fn, data },
})

export const fulfill = <T>({ fn, data }: { fn: Resolver<T>; data: T }) => ({
  type: "fulfill",
  payload: { fn, data },
})

export const reject = <T>({ fn, error }: { fn: Resolver<T>; error: Error }) => ({
  type: "reject",
  payload: { fn, error },
})

export const cancel = () => ({ type: "cancel" })
