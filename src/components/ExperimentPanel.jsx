import { useMemo, useState } from 'react'

const DEFAULT_SETTINGS = {
  sampleSize: 20,
  distribution: 'uniform',
  repetitions: 1000,
}

const DISTRIBUTION_LABELS = {
  uniform: 'Равномерное',
  normal: 'Нормальное',
  exponential: 'Экспоненциальное',
}

/*
 * Генерирует одно наблюдение из выбранного распределения.
 */
function generateObservation(distribution) {
  if (distribution === 'normal') {
    /*
     * Преобразование Бокса — Мюллера:
     * превращает два равномерных случайных числа
     * в одно наблюдение из N(0, 1).
     */
    const firstUniform = Math.max(Math.random(), Number.EPSILON)
    const secondUniform = Math.random()

    return (
      Math.sqrt(-2 * Math.log(firstUniform)) *
      Math.cos(2 * Math.PI * secondUniform)
    )
  }

  if (distribution === 'exponential') {
    /*
     * Экспоненциальное распределение с параметром λ = 1.
     * Его математическое ожидание равно 1.
     */
    const uniform = Math.max(Math.random(), Number.EPSILON)

    return -Math.log(uniform)
  }

  /*
   * Равномерное распределение U(0, 1).
   */
  return Math.random()
}

/*
 * Создаёт одну выборку размера sampleSize
 * и возвращает её среднее.
 */
function generateSampleMean(sampleSize, distribution) {
  let sum = 0

  for (let index = 0; index < sampleSize; index += 1) {
    sum += generateObservation(distribution)
  }

  return sum / sampleSize
}

/*
 * Повторяет эксперимент repetitions раз.
 */
function generateSampleMeans({
  sampleSize,
  distribution,
  repetitions,
}) {
  const sampleMeans = []

  for (let index = 0; index < repetitions; index += 1) {
    sampleMeans.push(
      generateSampleMean(sampleSize, distribution),
    )
  }

  return sampleMeans
}

/*
 * Размер демонстрационной выборки для показа формы
 * исходного распределения. Эти наблюдения нужны только
 * для первого графика и не влияют на симуляцию средних.
 */
const SOURCE_SAMPLE_SIZE = 8000

/*
 * Большая выборка отдельных наблюдений из выбранного
 * распределения — чтобы показать его форму.
 */
function generateSourceSample(distribution, size = SOURCE_SAMPLE_SIZE) {
  const observations = []

  for (let index = 0; index < size; index += 1) {
    observations.push(generateObservation(distribution))
  }

  return observations
}

/*
 * Приводит число повторений к допустимому диапазону.
 */
function clampRepetitions(value) {
  return Math.min(
    Math.max(Number(value) || 100, 100),
    10000,
  )
}

/*
 * Строит интервалы гистограммы.
 */
function createHistogram(values, numberOfBins = 24) {
  if (values.length === 0) {
    return []
  }

  const minimum = Math.min(...values)
  const maximum = Math.max(...values)

  /*
   * Если все значения случайно совпали,
   * создаём один столбец.
   */
  if (minimum === maximum) {
    return [
      {
        start: minimum,
        end: maximum,
        center: minimum,
        count: values.length,
      },
    ]
  }

  const binWidth = (maximum - minimum) / numberOfBins

  const bins = Array.from(
    { length: numberOfBins },
    (_, index) => {
      const start = minimum + index * binWidth
      const end = start + binWidth

      return {
        start,
        end,
        center: start + binWidth / 2,
        count: 0,
      }
    },
  )

  values.forEach((value) => {
    const rawBinIndex = Math.floor(
      (value - minimum) / binWidth,
    )

    /*
     * Максимальное значение должно попасть
     * в последний столбец, а не выйти за границы массива.
     */
    const binIndex = Math.min(
      rawBinIndex,
      numberOfBins - 1,
    )

    bins[binIndex].count += 1
  })

  return bins
}

function calculateMean(values) {
  if (values.length === 0) {
    return 0
  }

  const sum = values.reduce(
    (currentSum, value) => currentSum + value,
    0,
  )

  return sum / values.length
}

function calculateStandardDeviation(values, mean) {
  if (values.length < 2) {
    return 0
  }

  const squaredDifferencesSum = values.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0,
  )

  return Math.sqrt(
    squaredDifferencesSum / (values.length - 1),
  )
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '—'
  }

  if (Math.abs(value) >= 10) {
    return value.toFixed(1)
  }

  return value.toFixed(3)
}

function Histogram({
  bins,
  sampleMean,
  standardDeviation,
  showNormalCurve = false,
  axisLabel = 'Выборочное среднее',
  ariaLabel = 'Гистограмма распределения выборочных средних',
  markerLabel = 'Среднее',
  primaryStatLabel = 'Среднее средних',
  secondaryStatLabel = 'Стандартное отклонение',
}) {
  const width = 720
  const height = 600

  const margin = {
    top: 30,
    right: 24,
    bottom: 70,
    left: 54,
  }

  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const maximumCount = Math.max(
    ...bins.map((bin) => bin.count),
    1,
  )

  const firstBin = bins[0]
  const lastBin = bins[bins.length - 1]

  const minimumX = firstBin?.start ?? 0
  const maximumX = lastBin?.end ?? 1

  const xRange = maximumX - minimumX || 1

  function getXPosition(value) {
    return (
      margin.left +
      ((value - minimumX) / xRange) * chartWidth
    )
  }

  const barSlotWidth = chartWidth / Math.max(bins.length, 1)
  const barWidth = Math.max(barSlotWidth - 2, 1)

  const meanX = getXPosition(sampleMean)

  // Опорная кривая нормального распределения N(среднее, ст. отклонение),
  // отмасштабированная так, чтобы её пик совпадал с самым высоким столбцом.
  const normalCurvePath =
    showNormalCurve && standardDeviation > 0
      ? Array.from({ length: 65 }, (_, index) => {
          const value = minimumX + (xRange * index) / 64
          const z = (value - sampleMean) / standardDeviation
          const curveHeight = Math.exp(-(z * z) / 2) * chartHeight
          const px = getXPosition(value)
          const py = margin.top + chartHeight - curveHeight
          return `${index === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`
        }).join(' ')
      : null

  return (
    <div className="histogram">
      <svg
        className="histogram__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        <line
          className="histogram__grid-line"
          x1={margin.left}
          x2={width - margin.right}
          y1={margin.top}
          y2={margin.top}
        />

        <line
          className="histogram__grid-line"
          x1={margin.left}
          x2={width - margin.right}
          y1={margin.top + chartHeight / 2}
          y2={margin.top + chartHeight / 2}
        />

        <line
          className="histogram__axis"
          x1={margin.left}
          x2={margin.left}
          y1={margin.top}
          y2={margin.top + chartHeight}
        />

        <line
          className="histogram__axis"
          x1={margin.left}
          x2={width - margin.right}
          y1={margin.top + chartHeight}
          y2={margin.top + chartHeight}
        />

        {bins.map((bin, index) => {
          const barHeight =
            (bin.count / maximumCount) * chartHeight

          const x = margin.left + index * barSlotWidth
          const y = margin.top + chartHeight - barHeight

          return (
            <rect
              className="histogram__bar"
              key={`${bin.start}-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="2"
            >
              <title>
                {`${formatNumber(bin.start)}–${formatNumber(
                  bin.end,
                )}: ${bin.count}`}
              </title>
            </rect>
          )
        })}

        {normalCurvePath && (
          <path className="histogram__normal" d={normalCurvePath} />
        )}

        <line
          className="histogram__mean-line"
          x1={meanX}
          x2={meanX}
          y1={margin.top}
          y2={margin.top + chartHeight}
        />

        <text
          className="histogram__mean-label"
          x={Math.min(meanX + 8, width - 135)}
          y={margin.top + 17}
        >
          {markerLabel}: {formatNumber(sampleMean)}
        </text>

        <text
          className="histogram__tick-label"
          x={margin.left}
          y={height - 34}
          textAnchor="start"
        >
          {formatNumber(minimumX)}
        </text>

        <text
          className="histogram__tick-label"
          x={margin.left + chartWidth / 2}
          y={height - 34}
          textAnchor="middle"
        >
          {formatNumber((minimumX + maximumX) / 2)}
        </text>

        <text
          className="histogram__tick-label"
          x={width - margin.right}
          y={height - 34}
          textAnchor="end"
        >
          {formatNumber(maximumX)}
        </text>

        <text
          className="histogram__axis-label"
          x={margin.left + chartWidth / 2}
          y={height - 7}
          textAnchor="middle"
        >
          {axisLabel}
        </text>

        <text
          className="histogram__tick-label"
          x={margin.left - 10}
          y={margin.top + 4}
          textAnchor="end"
        >
          {maximumCount}
        </text>

        <text
          className="histogram__tick-label"
          x={margin.left - 10}
          y={margin.top + chartHeight + 4}
          textAnchor="end"
        >
          0
        </text>
      </svg>

      <div className="histogram__statistics">
        <div>
          <span>{primaryStatLabel}</span>
          <strong>{formatNumber(sampleMean)}</strong>
        </div>

        <div>
          <span>{secondaryStatLabel}</span>
          <strong>{formatNumber(standardDeviation)}</strong>
        </div>
      </div>
    </div>
  )
}

function ExperimentPanel() {
  const [sampleSize, setSampleSize] = useState(
    DEFAULT_SETTINGS.sampleSize,
  )

  const [distribution, setDistribution] = useState(
    DEFAULT_SETTINGS.distribution,
  )

  const [repetitions, setRepetitions] = useState(
    DEFAULT_SETTINGS.repetitions,
  )

  const [experimentResult, setExperimentResult] = useState(() =>
    generateSampleMeans(DEFAULT_SETTINGS),
  )

  const [isRunning, setIsRunning] = useState(false)

  const histogramBins = useMemo(
    () => createHistogram(experimentResult),
    [experimentResult],
  )

  const resultMean = useMemo(
    () => calculateMean(experimentResult),
    [experimentResult],
  )

  const resultStandardDeviation = useMemo(
    () =>
      calculateStandardDeviation(
        experimentResult,
        resultMean,
      ),
    [experimentResult, resultMean],
  )

  /*
   * Демонстрационная выборка исходного распределения.
   * Зависит только от выбранного распределения:
   * ни размер выборки, ни число повторений её не меняют.
   */
  const sourceSample = useMemo(
    () => generateSourceSample(distribution),
    [distribution],
  )

  const sourceBins = useMemo(
    () => createHistogram(sourceSample),
    [sourceSample],
  )

  const sourceMean = useMemo(
    () => calculateMean(sourceSample),
    [sourceSample],
  )

  const sourceStandardDeviation = useMemo(
    () => calculateStandardDeviation(sourceSample, sourceMean),
    [sourceSample, sourceMean],
  )

  /*
   * Смена распределения обновляет оба графика:
   * форму исходного распределения (через sourceSample выше)
   * и распределение выборочных средних (перегенерируем здесь).
   */
  function handleDistributionChange(nextDistribution) {
    setDistribution(nextDistribution)

    setExperimentResult(
      generateSampleMeans({
        sampleSize: Number(sampleSize),
        distribution: nextDistribution,
        repetitions: clampRepetitions(repetitions),
      }),
    )
  }

  function handleRunExperiment() {
    const safeRepetitions = clampRepetitions(repetitions)

    setRepetitions(safeRepetitions)
    setIsRunning(true)

    /*
     * Небольшая задержка нужна только для того,
     * чтобы пользователь увидел состояние кнопки.
     */
    window.setTimeout(() => {
      const newResult = generateSampleMeans({
        sampleSize: Number(sampleSize),
        distribution,
        repetitions: safeRepetitions,
      })

      setExperimentResult(newResult)
      setIsRunning(false)
    }, 120)
  }

  function handleReset() {
    setSampleSize(DEFAULT_SETTINGS.sampleSize)
    setDistribution(DEFAULT_SETTINGS.distribution)
    setRepetitions(DEFAULT_SETTINGS.repetitions)

    setExperimentResult(
      generateSampleMeans(DEFAULT_SETTINGS),
    )
  }

  return (
    <div className="experiment">
      <div className="experiment-settings">
        <div className="control-group control-group--range">
          <div className="control-group__heading">
            <label htmlFor="sample-size">
              Размер выборки (n)
            </label>

            <strong>n = {sampleSize}</strong>
          </div>

          <input
            id="sample-size"
            max="200"
            min="1"
            step="1"
            type="range"
            value={sampleSize}
            onChange={(event) =>
              setSampleSize(Number(event.target.value))
            }
          />

          <div className="range-limits">
            <span>1</span>
            <span>200</span>
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="distribution">
            Исходное распределение
          </label>

          <select
            id="distribution"
            value={distribution}
            onChange={(event) =>
              handleDistributionChange(event.target.value)
            }
          >
            <option value="uniform">
              Равномерное
            </option>

            <option value="normal">
              Нормальное
            </option>

            <option value="exponential">
              Экспоненциальное
            </option>
          </select>
        </div>

        <div className="control-group control-group--repetitions">
          <label htmlFor="repetitions">
            Число повторений
          </label>

          <input
            id="repetitions"
            max="10000"
            min="100"
            step="100"
            type="number"
            value={repetitions}
            onChange={(event) =>
              setRepetitions(event.target.value)
            }
          />
        </div>

        <div className="experiment-settings__buttons">
          <button
            className="primary-button"
            type="button"
            disabled={isRunning}
            onClick={handleRunExperiment}
          >
            {isRunning ? 'Считаем…' : 'Запустить'}
          </button>

          <button
            className="secondary-button"
            type="button"
            disabled={isRunning}
            onClick={handleReset}
          >
            Сбросить
          </button>
        </div>
      </div>

      <p className="experiment-now">
        <span className="experiment-now__icon" aria-hidden="true">
          ⓘ
        </span>

        Сейчас исследуем:{' '}
        <strong>
          {DISTRIBUTION_LABELS[distribution].toLowerCase()}{' '}
          распределение, n = {sampleSize},{' '}
          {experimentResult.length.toLocaleString('ru-RU')} повторений
        </strong>
      </p>

      <div className="chart-container">
        <p className="chart-hint">
          Первый график показывает отдельные наблюдения. Второй —
          средние, полученные из множества выборок. Сравни их форму,
          центр и разброс.
        </p>

        <div className="distribution-comparison">
          <div className="distribution-chart-card">
            <div className="distribution-chart-card__heading">
              <h4>Исходное распределение</h4>

              <p className="distribution-chart-card__subtitle">
                Отдельные наблюдения.
              </p>
            </div>

            <Histogram
              bins={sourceBins}
              sampleMean={sourceMean}
              standardDeviation={sourceStandardDeviation}
              axisLabel="Наблюдение"
              ariaLabel="Гистограмма исходного распределения"
              primaryStatLabel="Среднее наблюдений"
            />
          </div>

          <div className="distribution-chart-card">
            <div className="distribution-chart-card__heading">
              <h4>Распределение выборочных средних</h4>

              <p className="distribution-chart-card__subtitle">
                Одно значение — среднее одной выборки.
              </p>
            </div>

            <Histogram
              bins={histogramBins}
              sampleMean={resultMean}
              standardDeviation={resultStandardDeviation}
              showNormalCurve
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExperimentPanel