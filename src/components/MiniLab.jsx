import { useMemo, useState } from 'react'
import { usePersistentState } from '../usePersistentState'

/*
 * Мини-лаборатория — самостоятельная секция со своей логикой.
 * Не зависит от основного эксперимента.
 */

const DEFAULTS = {
  distribution: 'exponential',
  repetitions: 1000,
  sampleSize: 2,
}

const N_MIN = 2
const N_MAX = 100
const HISTORY_LIMIT = 4

/* Одно наблюдение из выбранного распределения. */
function generateObservation(distribution) {
  if (distribution === 'normal') {
    const firstUniform = Math.max(Math.random(), Number.EPSILON)
    const secondUniform = Math.random()

    return (
      Math.sqrt(-2 * Math.log(firstUniform)) *
      Math.cos(2 * Math.PI * secondUniform)
    )
  }

  if (distribution === 'exponential') {
    const uniform = Math.max(Math.random(), Number.EPSILON)

    return -Math.log(uniform)
  }

  return Math.random()
}

/* Массив выборочных средних для заданного размера выборки. */
function generateSampleMeans(sampleSize, distribution, repetitions) {
  const means = []

  for (let index = 0; index < repetitions; index += 1) {
    let sum = 0

    for (let inner = 0; inner < sampleSize; inner += 1) {
      sum += generateObservation(distribution)
    }

    means.push(sum / sampleSize)
  }

  return means
}

const mean = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length

function standardDeviation(values, average) {
  if (values.length < 2) {
    return 0
  }

  const squared = values.reduce(
    (sum, value) => sum + (value - average) ** 2,
    0,
  )

  return Math.sqrt(squared / (values.length - 1))
}

/*
 * Гистограмма по фиксированному диапазону оси.
 * Именно фиксированная шкала позволяет увидеть,
 * как распределение сужается при росте n.
 */
function histogramFixed(values, axisMin, axisMax, binCount) {
  const width = (axisMax - axisMin) / binCount
  const counts = new Array(binCount).fill(0)

  values.forEach((value) => {
    const rawIndex = Math.floor((value - axisMin) / width)
    const index = Math.max(0, Math.min(binCount - 1, rawIndex))

    counts[index] += 1
  })

  return counts.map((count, index) => ({
    start: axisMin + index * width,
    end: axisMin + (index + 1) * width,
    count,
  }))
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '—'
  }

  return value.toFixed(3).replace('.', ',')
}

/* Главный график. */
function MainChart({ bins, axisMin, axisMax, meanValue }) {
  const width = 680
  const height = 340
  const margin = { top: 24, right: 20, bottom: 46, left: 30 }

  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom

  const maxCount = Math.max(...bins.map((bin) => bin.count), 1)
  const axisRange = axisMax - axisMin || 1

  const scaleX = (value) =>
    margin.left + ((value - axisMin) / axisRange) * plotWidth

  const barSlot = plotWidth / bins.length
  const barWidth = Math.max(barSlot - 1.5, 1)
  const meanX = scaleX(meanValue)

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(
    (fraction) => axisMin + fraction * axisRange,
  )

  return (
    <svg
      className="minilab-plot"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Распределение выборочных средних, среднее ${formatNumber(
        meanValue,
      )}`}
    >
      <line
        className="minilab-plot__axis"
        x1={margin.left}
        x2={width - margin.right}
        y1={margin.top + plotHeight}
        y2={margin.top + plotHeight}
      />

      {bins.map((bin, index) => {
        const barHeight = (bin.count / maxCount) * plotHeight
        const x = margin.left + index * barSlot
        const y = margin.top + plotHeight - barHeight

        return (
          <rect
            className="minilab-bar"
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx="1.5"
          />
        )
      })}

      <line
        className="minilab-plot__mean"
        x1={meanX}
        x2={meanX}
        y1={margin.top}
        y2={margin.top + plotHeight}
      />

      {ticks.map((tick) => (
        <text
          className="minilab-plot__tick"
          key={tick}
          x={scaleX(tick)}
          y={height - 24}
          textAnchor="middle"
        >
          {formatNumber(tick)}
        </text>
      ))}

      <text
        className="minilab-plot__axis-label"
        x={margin.left + plotWidth / 2}
        y={height - 6}
        textAnchor="middle"
      >
        Выборочное среднее
      </text>
    </svg>
  )
}

/* Компактный мини-график для истории. */
function MiniChart({ heights }) {
  const width = 120
  const height = 38
  const slot = width / heights.length
  const barWidth = Math.max(slot - 0.6, 0.8)

  return (
    <svg
      className="mini-plot"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {heights.map((value, index) => {
        const barHeight = Math.max(value * height, value > 0 ? 1 : 0)

        return (
          <rect
            key={index}
            x={index * slot}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
          />
        )
      })}
    </svg>
  )
}

const STATEMENTS = [
  {
    id: 'narrower',
    text: 'Распределение выборочных средних становится уже.',
    correct: true,
  },
  {
    id: 'center-shifts',
    text: 'Центр распределения заметно смещается.',
    correct: false,
  },
  {
    id: 'symmetric',
    text: 'Распределение становится более симметричным.',
    correct: true,
  },
  {
    id: 'source-normal',
    text: 'Исходное распределение становится нормальным.',
    correct: false,
  },
  {
    id: 'concentrate',
    text: 'Средние начинают концентрироваться около одного значения.',
    correct: true,
  },
]

function MiniLab() {
  const [distribution, setDistribution] = useState(DEFAULTS.distribution)
  const [repetitions, setRepetitions] = useState(DEFAULTS.repetitions)
  const [sampleSize, setSampleSize] = useState(DEFAULTS.sampleSize)
  const [result, setResult] = useState(() =>
    generateSampleMeans(
      DEFAULTS.sampleSize,
      DEFAULTS.distribution,
      DEFAULTS.repetitions,
    ),
  )
  const [history, setHistory] = useState([])
  const [answers, setAnswers] = usePersistentState('minilab.answers', () =>
    STATEMENTS.map(() => false),
  )
  const [checkResult, setCheckResult] = usePersistentState(
    'minilab.check',
    'none',
  )

  /*
   * Фиксированный диапазон оси, рассчитанный по разбросу
   * при n = 2 (самый широкий случай). Зависит только
   * от выбранного распределения, не от n.
   */
  const [axisMin, axisMax] = useMemo(() => {
    const reference = generateSampleMeans(2, distribution, 3000)
    const referenceMean = mean(reference)
    const referenceStd = standardDeviation(reference, referenceMean)

    let low = referenceMean - 3 * referenceStd
    const high = referenceMean + 3.3 * referenceStd

    if (distribution !== 'normal') {
      low = Math.max(0, low)
    }

    return [low, high]
  }, [distribution])

  const resultMean = useMemo(() => mean(result), [result])
  const resultStd = useMemo(
    () => standardDeviation(result, resultMean),
    [result, resultMean],
  )
  const bins = useMemo(
    () => histogramFixed(result, axisMin, axisMax, 30),
    [result, axisMin, axisMax],
  )

  function regenerate(nextSampleSize, nextDistribution, nextRepetitions) {
    const next = generateSampleMeans(
      nextSampleSize,
      nextDistribution,
      nextRepetitions,
    )

    setResult(next)

    return next
  }

  function snapshotHistory(sample, nValue) {
    const miniBins = histogramFixed(sample, axisMin, axisMax, 20)
    const maxCount = Math.max(...miniBins.map((bin) => bin.count), 1)
    const heights = miniBins.map((bin) => bin.count / maxCount)

    setHistory((previous) => {
      const withoutDuplicateTail =
        previous.length > 0 &&
        previous[previous.length - 1].n === nValue
          ? previous.slice(0, -1)
          : previous

      return [
        ...withoutDuplicateTail,
        {
          key: `${nValue}-${previous.length}`,
          n: nValue,
          heights,
        },
      ].slice(-HISTORY_LIMIT)
    })
  }

  function handleSampleSizeChange(value) {
    setSampleSize(value)
    regenerate(value, distribution, repetitions)
  }

  function handleDistributionChange(value) {
    setDistribution(value)
    setHistory([])
    regenerate(sampleSize, value, repetitions)
  }

  function handleRepetitionsChange(value) {
    setRepetitions(value)
    regenerate(sampleSize, distribution, value)
  }

  function handleRun() {
    const next = regenerate(sampleSize, distribution, repetitions)
    snapshotHistory(next, sampleSize)
  }

  function handleReset() {
    setDistribution(DEFAULTS.distribution)
    setRepetitions(DEFAULTS.repetitions)
    setSampleSize(DEFAULTS.sampleSize)
    regenerate(
      DEFAULTS.sampleSize,
      DEFAULTS.distribution,
      DEFAULTS.repetitions,
    )
    setHistory([])
    setAnswers(STATEMENTS.map(() => false))
    setCheckResult('none')
  }

  function toggleAnswer(index) {
    setAnswers((previous) =>
      previous.map((value, current) =>
        current === index ? !value : value,
      ),
    )
    setCheckResult('none')
  }

  function handleCheck() {
    const isCorrect = STATEMENTS.every(
      (statement, index) => answers[index] === statement.correct,
    )

    setCheckResult(isCorrect ? 'correct' : 'incorrect')
  }

  return (
    <div className="minilab">
      <div className="minilab-settings">
        <div className="control-group">
          <label htmlFor="minilab-distribution">
            Исходное распределение
          </label>

          <select
            id="minilab-distribution"
            value={distribution}
            onChange={(event) =>
              handleDistributionChange(event.target.value)
            }
          >
            <option value="exponential">Экспоненциальное</option>
            <option value="uniform">Равномерное</option>
            <option value="normal">Нормальное</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="minilab-repetitions">
            Количество повторений
          </label>

          <select
            id="minilab-repetitions"
            value={repetitions}
            onChange={(event) =>
              handleRepetitionsChange(Number(event.target.value))
            }
          >
            <option value={500}>500</option>
            <option value={1000}>1000</option>
            <option value={2000}>2000</option>
            <option value={5000}>5000</option>
          </select>
        </div>

        <div className="minilab-settings__buttons">
          <button
            className="primary-button"
            type="button"
            onClick={handleRun}
          >
            Запустить
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={handleReset}
          >
            Сбросить
          </button>
        </div>
      </div>

      <div className="minilab-slider">
        <div className="minilab-slider__heading">
          <label htmlFor="minilab-sample-size">
            Размер выборки (n)
          </label>

          <strong>n = {sampleSize}</strong>
        </div>

        <input
          id="minilab-sample-size"
          type="range"
          min={N_MIN}
          max={N_MAX}
          step="1"
          value={sampleSize}
          onChange={(event) =>
            handleSampleSizeChange(Number(event.target.value))
          }
          onMouseUp={() => snapshotHistory(result, sampleSize)}
          onTouchEnd={() => snapshotHistory(result, sampleSize)}
          onKeyUp={() => snapshotHistory(result, sampleSize)}
        />

        <div className="range-limits">
          <span>{N_MIN}</span>
          <span>{N_MAX}</span>
        </div>
      </div>

      <div className="minilab-stage">
        <div className="minilab-chart">
          <MainChart
            bins={bins}
            axisMin={axisMin}
            axisMax={axisMax}
            meanValue={resultMean}
          />

          <dl className="minilab-stats">
            <div>
              <dt>Среднее</dt>
              <dd>{formatNumber(resultMean)}</dd>
            </div>

            <div>
              <dt>Стандартное отклонение</dt>
              <dd>{formatNumber(resultStd)}</dd>
            </div>

            <div>
              <dt>Количество выборочных средних</dt>
              <dd>{result.length.toLocaleString('ru-RU')}</dd>
            </div>
          </dl>
        </div>

        <aside className="minilab-history" aria-label="История изменений">
          <h4>История</h4>

          {history.length === 0 ? (
            <p className="minilab-history__empty">
              Двигай ползунок — сюда попадут прошлые состояния для
              сравнения.
            </p>
          ) : (
            <ul className="minilab-history__list">
              {history.map((item) => (
                <li className="minilab-history__item" key={item.key}>
                  <span>n = {item.n}</span>
                  <MiniChart heights={item.heights} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <div className="minilab-observe">
        <h3>Что изменилось?</h3>

        <p>
          Посмотри на разные значения n и отметь только те утверждения,
          которые действительно подтверждаются экспериментом.
        </p>

        <form className="minilab-checklist">
          {STATEMENTS.map((statement, index) => (
            <label className="minilab-checkbox" key={statement.id}>
              <input
                type="checkbox"
                checked={answers[index]}
                onChange={() => toggleAnswer(index)}
              />

              <span>{statement.text}</span>
            </label>
          ))}
        </form>

        <button
          className="primary-button"
          type="button"
          onClick={handleCheck}
        >
          Проверить наблюдения
        </button>

        {checkResult === 'incorrect' && (
          <div className="minilab-feedback minilab-feedback--hint">
            <p>Посмотри ещё раз на график. Попробуй обратить внимание отдельно на:</p>

            <ul>
              <li>ширину распределения;</li>
              <li>положение центра;</li>
              <li>форму распределения.</li>
            </ul>
          </div>
        )}

        {checkResult === 'correct' && (
          <>
            <div className="minilab-feedback minilab-feedback--success">
              <h4>Что удалось заметить?</h4>

              <p>
                При увеличении размера выборки одновременно происходят
                две вещи.
              </p>

              <p>
                Распределение выборочных средних становится более узким.
                Одновременно оно становится более похожим на нормальное.
                При этом центр распределения остаётся примерно на том же
                месте.
              </p>

              <p className="minilab-feedback__warning">
                Исходное распределение не меняется. Меняется только
                распределение выборочных средних.
              </p>
            </div>

            <p className="section-transition">
              Теперь возникает следующий вопрос. Почему происходят сразу
              оба этих эффекта?
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default MiniLab
