export type Resolver<T> = () => T | Promise<T>

export interface AbstractState<T> {
  fn?: Resolver<T>
}
export type Initial<T, S = AbstractState<T>> = S & {
  status: "initial"
  settled: false
  data: undefined
  error: undefined
}
export type Pending<T, S = AbstractState<T>> = S & {
  status: "pending"
  settled: boolean
  data: T | undefined
  error: Error | undefined
}
export type Fulfilled<T, S = AbstractState<T>> = S & {
  status: "fulfilled"
  settled: true
  data: T
  error: undefined
}
export type Rejected<T, S = AbstractState<T>> = S & {
  status: "rejected"
  settled: true
  data: T | undefined
  error: Error
}

export type BaseState<T, S> = Initial<T, S> | Pending<T, S> | Fulfilled<T, S> | Rejected<T, S>
export type AsyncState<T, S extends AbstractState<T> = AbstractState<T>> = BaseState<T, S>

export type InitPayload<T> = { fn: Resolver<T>; data?: T; error?: Error }
export type StartPayload<T> = { fn: Resolver<T>; data?: T }
export type FulfillPayload<T> = { fn: Resolver<T>; data: T }
export type RejectPayload<T> = { fn: Resolver<T>; error: Error }
export type Payload<T> = InitPayload<T> | StartPayload<T> | FulfillPayload<T> | RejectPayload<T>
