export default function withStatusProps(state) {
  return {
    ...state,
    isInitial: state.status === "initial",
    isPending: state.status === "pending",
    isFulfilled: state.status === "fulfilled",
    isRejected: state.status === "rejected",
    isSettled: state.status === "fulfilled" || state.status === "rejected",
  }
}
