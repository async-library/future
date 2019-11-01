export default function withAbortController(state, action = {}) {
  if (action.type === "start") {
    state.abortController && state.abortController.abort()
    const abortController = "AbortController" in window && new AbortController()
    return { ...state, abortController }
  }
  return state
}
