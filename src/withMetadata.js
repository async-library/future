export default function withMetadata(state, action = {}) {
  const { startedCount = 0, finishedCount = 0, startedAt, finishedAt } = state
  switch (action.type) {
    case "start":
      return {
        ...state,
        startedCount: startedCount + 1,
        startedAt: new Date(),
      }
    case "fulfill":
    case "reject":
      return {
        ...state,
        finishedCount: finishedCount + 1,
        finishedAt: new Date(),
      }
    default:
      if (typeof state.finishedCount === "number") return state
      return { ...state, startedCount, finishedCount, startedAt, finishedAt }
  }
}
