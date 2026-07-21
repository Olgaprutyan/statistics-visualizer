import { useEffect, useState } from 'react'

/*
 * Сохраняет состояние в localStorage, чтобы прогресс (ответы на вопросы,
 * раскрытые объяснения, пройденные шаги) не сбрасывался при перезагрузке.
 * Работает без бэкенда и без личного кабинета — данные хранятся в браузере.
 */

const PREFIX = 'statlab:'

function readValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)

    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    /* Приватный режим или недоступное хранилище — работаем без сохранения. */
    return fallback
  }
}

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    const fallback = typeof initial === 'function' ? initial() : initial

    return readValue(key, fallback)
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* Хранилище переполнено или недоступно — просто не сохраняем. */
    }
  }, [key, value])

  return [value, setValue]
}

/* Полностью очищает сохранённый прогресс всех разделов. */
export function clearPersistedProgress() {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.localStorage.removeItem(key))
  } catch {
    /* Хранилище недоступно — очищать нечего. */
  }
}
