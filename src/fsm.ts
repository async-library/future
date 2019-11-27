import { createMachine, assign, StateMachine } from "@xstate/fsm"

export interface Context<T> {
  settled: boolean
  data?: T
  error?: Error
}

type Start<T> = {
  type: "START"
  payload: (ctx: Context<T>) => T | Error | Promise<T>
  send: (event: Event<T> | Event<T>["type"]) => void
}
type Fulfill<T> = { type: "FULFILL"; payload: T }
type Reject = { type: "REJECT"; payload: Error }
type Cancel = { type: "CANCEL" }
export type Event<T> = Start<T> | Fulfill<T> | Reject | Cancel

type Initial<T> = {
  value: "initial"
  context: Context<T> & { data: undefined; error: undefined }
}
type Pending<T> = {
  value: "pending"
  context: Context<T>
}
type Fulfilled<T> = {
  value: "fulfilled"
  context: Context<T> & { data: T; error: undefined }
}
type Rejected<T> = {
  value: "rejected"
  context: Context<T> & { error: Error }
}
export type State<T> = Initial<T> | Pending<T> | Fulfilled<T> | Rejected<T>

type ActionFn<T> = (ctx: Context<T>, event: Event<T>) => void

const handleStart = <T>(fn: ActionFn<T>) => (ctx: Context<T>, event: Start<T>) => fn(ctx, event)
const handleResolve = <T>(event: Start<T>) => (payload: T) =>
  event.send({ type: "FULFILL", payload })
const handleReject = <T>(event: Start<T>) => (payload: Error) =>
  event.send({ type: "REJECT", payload })

export default <T>({ initialValue, onStart = handleStart }) =>
  createMachine<Context<T>, Event<T>, State<T>>({
    id: "async",
    initial: "initial",
    context: {
      settled: false,
      data: initialValue instanceof Error ? undefined : initialValue,
      error: initialValue instanceof Error ? initialValue : undefined,
    },
    states: {
      initial: {
        on: { START: "pending" },
      },
      pending: {
        entry: onStart((ctx: Context<T>, event: Start<T>) => {
          const result = event.payload(ctx)
          if (result instanceof Promise) {
            result.then(handleResolve(event), handleReject(event))
          } else if (result instanceof Error) {
            handleReject(event)(result)
          } else {
            handleResolve(event)(result)
          }
        }),
        on: {
          START: "pending",
          FULFILL: {
            target: "fulfilled",
            actions: assign({
              settled: true,
              data: (ctx: Context<T>, event: Fulfill<T>) => event.payload,
            }),
          },
          REJECT: {
            target: "rejected",
            actions: assign({
              settled: true,
              error: (ctx: Context<T>, event: Reject) => event.payload,
            }),
          },
          CANCEL: [
            { target: "initial", cond: ctx => !ctx.settled },
            { target: "fulfilled", cond: ctx => !ctx.error },
            { target: "rejected" },
          ],
        },
      },
      fulfilled: {
        on: { START: "pending" },
      },
      rejected: {
        on: { START: "pending" },
      },
    },
  })
