const clone = (value) => JSON.parse(JSON.stringify(value))

export const readLocal = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : clone(fallback)
  } catch {
    return clone(fallback)
  }
}

export const writeLocal = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}
