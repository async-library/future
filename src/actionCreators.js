export const start = ({ fn, data }) => ({ type: "start", payload: { fn, data } })
export const fulfill = ({ fn, data }) => ({ type: "fulfill", payload: { fn, data } })
export const reject = ({ fn, error }) => ({ type: "reject", payload: { fn, error } })
export const cancel = () => ({ type: "cancel" })
