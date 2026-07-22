/*
 * Утилиты генерации учебных данных для главы «Вероятность и данные».
 * Модель используется только для демонстрации выборочной изменчивости и не
 * утверждает, что реальное время сна обязательно имеет нормальное
 * распределение. В демонстрации часы сна имеют центр около 7, стандартное
 * отклонение около 1.2 и ограничены интервалом [3, 10].
 */

export const POPULATION_MEAN = 7
export const POPULATION_SD = 1.2
export const POPULATION_MIN = 3
export const POPULATION_MAX = 10

// Нормальная величина по методу Бокса — Мюллера.
export function randomNormal(mean = 0, sd = 1) {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return mean + sd * z
}

// Одно наблюдение «часов сна» из модельной совокупности.
export function sampleSleepHour() {
  let x = randomNormal(POPULATION_MEAN, POPULATION_SD)
  x = Math.min(POPULATION_MAX, Math.max(POPULATION_MIN, x))
  return Math.round(x * 10) / 10
}

// Выборка из n наблюдений.
export function sampleSleepHours(n) {
  const out = []
  for (let i = 0; i < n; i += 1) out.push(sampleSleepHour())
  return out
}

export function mean(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function standardDeviation(values) {
  const n = values.length
  if (n < 2) return 0
  const m = mean(values)
  const variance =
    values.reduce((sum, value) => sum + (value - m) ** 2, 0) / (n - 1)
  return Math.sqrt(variance)
}

// Среднее одной свежей выборки размера n (без хранения самих наблюдений).
export function sampleMean(n) {
  let sum = 0
  for (let i = 0; i < n; i += 1) sum += sampleSleepHour()
  return sum / n
}

// Массив средних из repeat независимых выборок размера n.
export function manySampleMeans(n, repeat) {
  const means = []
  for (let i = 0; i < repeat; i += 1) means.push(sampleMean(n))
  return means
}

export function formatHours(value) {
  return value.toFixed(1).replace('.', ',')
}

/*
 * Бернуллиевские утилиты для части «Вероятность как язык неопределённости».
 * Модель бинарного события: 1 — событие произошло, 0 — не произошло.
 * Функции проверяют параметры, не мутируют входные массивы и возвращают
 * предсказуемые типы. Симуляции генерируются пакетно (см. §23 ТЗ).
 */

// Проверка, что вероятность лежит в допустимом диапазоне [0, 1].
function assertProbability(probability) {
  if (
    typeof probability !== 'number' ||
    Number.isNaN(probability) ||
    probability < 0 ||
    probability > 1
  ) {
    throw new RangeError('Probability must be between 0 and 1.')
  }
}

// Одно бернуллиевское испытание: возвращает 1 с вероятностью probability.
export function generateBernoulliTrial(probability) {
  assertProbability(probability)
  return Math.random() < probability ? 1 : 0
}

// Серия из count независимых испытаний как массив нулей и единиц.
export function generateBernoulliSeries(probability, count) {
  assertProbability(probability)
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError('Count must be a non-negative integer.')
  }
  const out = new Array(count)
  for (let i = 0; i < count; i += 1) {
    out[i] = Math.random() < probability ? 1 : 0
  }
  return out
}

// Относительная частота (доля единиц) в массиве значений 0/1.
export function calculateRelativeFrequency(values) {
  if (!values.length) return 0
  let successes = 0
  for (let i = 0; i < values.length; i += 1) successes += values[i]
  return successes / values.length
}

/*
 * Распределение относительных частот: seriesCount независимых серий по
 * sampleSize испытаний, для каждой серии — своя относительная частота.
 * Возвращает массив долей длиной seriesCount.
 */
export function generateFrequencyDistribution(
  probability,
  sampleSize,
  seriesCount,
) {
  assertProbability(probability)
  if (!Number.isInteger(sampleSize) || sampleSize <= 0) {
    throw new RangeError('Sample size must be a positive integer.')
  }
  if (!Number.isInteger(seriesCount) || seriesCount <= 0) {
    throw new RangeError('Series count must be a positive integer.')
  }
  const frequencies = new Array(seriesCount)
  for (let series = 0; series < seriesCount; series += 1) {
    let successes = 0
    for (let trial = 0; trial < sampleSize; trial += 1) {
      if (Math.random() < probability) successes += 1
    }
    frequencies[series] = successes / sampleSize
  }
  return frequencies
}

// Число единиц в массиве значений 0/1 (без мутации входа).
export function countSuccesses(values) {
  let successes = 0
  for (let i = 0; i < values.length; i += 1) successes += values[i]
  return successes
}

// Запятая как десятичный разделитель, фиксированное число знаков.
export function formatDecimal(value, digits = 3) {
  return value.toFixed(digits).replace('.', ',')
}
