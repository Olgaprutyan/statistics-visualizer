import { useEffect, useMemo, useRef, useState } from 'react'
import { usePersistentState } from '../usePersistentState'

/*
 * «Как рождается распределение выборочных средних» —
 * самостоятельный анимированный этап. Показывает цепочку:
 * новая выборка → её среднее → новый столбец на гистограмме.
 */

const DIST_PARAMS = {
  exponential: {
    label: 'Экспоненциальное',
    obsMin: 0,
    obsMax: 6,
    mean: 1,
    std: 1,
  },
  uniform: {
    label: 'Равномерное',
    obsMin: 0,
    obsMax: 1,
    mean: 0.5,
    std: 0.288675,
  },
  normal: {
    label: 'Нормальное',
    obsMin: -3.6,
    obsMax: 3.6,
    mean: 0,
    std: 1,
  },
}

const SPEED_MODES = {
  slow: { interval: 650, batch: 1, staggerDelay: 260 },
  fast: { interval: 110, batch: 1, staggerDelay: 0 },
  veryfast: { interval: 45, batch: 25, staggerDelay: 0 },
}

const N_MIN = 2
const N_MAX = 50
const BIN_COUNT = 28
const DEFAULTS = {
  distribution: 'exponential',
  sampleSize: 20,
  speed: 'slow',
  maxReps: 1000,
}

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
    return -Math.log(Math.max(Math.random(), Number.EPSILON))
  }

  return Math.random()
}

function generateSample(sampleSize, distribution) {
  const observations = []

  for (let index = 0; index < sampleSize; index += 1) {
    observations.push(generateObservation(distribution))
  }

  return observations
}

const average = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length

/* Полный набор выборочных средних — для восстановления после перезагрузки. */
function buildFullRun(sampleSize, distribution, count) {
  const result = []

  for (let index = 0; index < count; index += 1) {
    result.push(average(generateSample(sampleSize, distribution)))
  }

  return result
}

function standardDeviation(values) {
  if (values.length < 2) {
    return 0
  }

  const mean = average(values)
  const squared = values.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0,
  )

  return Math.sqrt(squared / (values.length - 1))
}

function meansAxis(distribution, sampleSize) {
  const params = DIST_PARAMS[distribution]
  const spread = params.std / Math.sqrt(sampleSize)

  let low = params.mean - 3.4 * spread
  const high = params.mean + 3.6 * spread

  if (distribution !== 'normal') {
    low = Math.max(0, low)
  }

  return [low, high]
}

function binIndex(value, axisMin, axisMax) {
  const width = (axisMax - axisMin) / BIN_COUNT
  const raw = Math.floor((value - axisMin) / width)

  return Math.max(0, Math.min(BIN_COUNT - 1, raw))
}

function buildBins(values, axisMin, axisMax) {
  const width = (axisMax - axisMin) / BIN_COUNT
  const counts = new Array(BIN_COUNT).fill(0)

  values.forEach((value) => {
    counts[binIndex(value, axisMin, axisMax)] += 1
  })

  return counts.map((count, index) => ({
    start: axisMin + index * width,
    count,
  }))
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '—'
  }

  return value.toFixed(2).replace('.', ',')
}

/* Левая часть: точки текущей выборки на числовой оси. */
function SampleAxis({ observations, meanValue, distribution, highlighted }) {
  const width = 320
  const height = 140
  const margin = { left: 16, right: 16 }
  const axisY = 96
  const { obsMin, obsMax } = DIST_PARAMS[distribution]
  const range = obsMax - obsMin || 1
  const plotWidth = width - margin.left - margin.right

  const scaleX = (value) => {
    const clamped = Math.max(obsMin, Math.min(obsMax, value))

    return margin.left + ((clamped - obsMin) / range) * plotWidth
  }

  const ticks = [0, 0.5, 1].map((fraction) => obsMin + fraction * range)

  return (
    <svg
      className="builder-sample__svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Наблюдения текущей выборки на числовой оси"
    >
      <line
        className="builder-axis"
        x1={margin.left}
        x2={width - margin.right}
        y1={axisY}
        y2={axisY}
      />

      {ticks.map((tick) => (
        <text
          className="builder-tick"
          key={tick}
          x={scaleX(tick)}
          y={axisY + 18}
          textAnchor="middle"
        >
          {formatNumber(tick)}
        </text>
      ))}

      {observations.map((value, index) => (
        <circle
          className="builder-dot"
          key={index}
          cx={scaleX(value)}
          cy={axisY - 14 - (index % 6) * 11}
          r="4"
        />
      ))}

      {meanValue !== null && (
        <line
          className={
            highlighted
              ? 'builder-mean-line builder-mean-line--active'
              : 'builder-mean-line'
          }
          x1={scaleX(meanValue)}
          x2={scaleX(meanValue)}
          y1={12}
          y2={axisY}
        />
      )}
    </svg>
  )
}

/* Правая часть: растущая гистограмма выборочных средних. */
function BuildingHistogram({ bins, axisMin, axisMax, highlightBin }) {
  const width = 600
  const height = 340
  const margin = { top: 20, right: 18, bottom: 42, left: 24 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom

  const maxCount = Math.max(...bins.map((bin) => bin.count), 1)
  const range = axisMax - axisMin || 1
  const barSlot = plotWidth / bins.length
  const barWidth = Math.max(barSlot - 1.5, 1)

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(
    (fraction) => axisMin + fraction * range,
  )
  const scaleX = (value) =>
    margin.left + ((value - axisMin) / range) * plotWidth

  return (
    <svg
      className="builder-hist__svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Гистограмма распределения выборочных средних, которая постепенно строится"
    >
      <line
        className="builder-axis"
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
            className={
              index === highlightBin
                ? 'builder-bar builder-bar--active'
                : 'builder-bar'
            }
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx="1.5"
          />
        )
      })}

      {ticks.map((tick) => (
        <text
          className="builder-tick"
          key={tick}
          x={scaleX(tick)}
          y={height - 22}
          textAnchor="middle"
        >
          {formatNumber(tick)}
        </text>
      ))}

      <text
        className="builder-axis-label"
        x={margin.left + plotWidth / 2}
        y={height - 6}
        textAnchor="middle"
      >
        Выборочное среднее
      </text>
    </svg>
  )
}

const STATEMENTS = [
  {
    id: 'one-mean',
    text: 'Каждая выборка добавляет одно новое среднее.',
    correct: true,
  },
  {
    id: 'same-mean',
    text: 'Все выборки дают одинаковое среднее.',
    correct: false,
  },
  {
    id: 'clearer',
    text: 'Чем больше повторений, тем отчётливее становится форма распределения.',
    correct: true,
  },
  {
    id: 'changes-source',
    text: 'Новые выборки изменяют исходное распределение.',
    correct: false,
  },
]

function SamplingBuilder() {
  const [distribution, setDistribution] = useState(DEFAULTS.distribution)
  const [sampleSize, setSampleSize] = useState(DEFAULTS.sampleSize)
  const [speed, setSpeed] = useState(DEFAULTS.speed)
  const [maxReps, setMaxReps] = useState(DEFAULTS.maxReps)

  const [isRunning, setIsRunning] = useState(false)
  const [finished, setFinished] = usePersistentState('builder.finished', false)
  /*
   * Если раздел уже был пройден, восстанавливаем построенную гистограмму,
   * чтобы не заставлять запускать анимацию заново.
   */
  const [means, setMeans] = useState(() =>
    finished
      ? buildFullRun(
          DEFAULTS.sampleSize,
          DEFAULTS.distribution,
          DEFAULTS.maxReps,
        )
      : [],
  )
  const [currentSample, setCurrentSample] = useState(null)
  const [currentMean, setCurrentMean] = useState(null)
  const [highlight, setHighlight] = useState({ phase: 'idle', bin: null })

  const [answers, setAnswers] = usePersistentState('builder.answers', () =>
    STATEMENTS.map(() => false),
  )
  const [checkResult, setCheckResult] = usePersistentState(
    'builder.check',
    'none',
  )

  const [axisMin, axisMax] = useMemo(
    () => meansAxis(distribution, sampleSize),
    [distribution, sampleSize],
  )

  const bins = useMemo(
    () => buildBins(means, axisMin, axisMax),
    [means, axisMin, axisMax],
  )
  const meanOfMeans = useMemo(
    () => (means.length ? average(means) : null),
    [means],
  )
  const stdOfMeans = useMemo(() => standardDeviation(means), [means])

  /* Рефы, чтобы анимация не зависела от устаревших замыканий. */
  const runningRef = useRef(false)
  const timerRef = useRef(null)
  const meansRef = useRef([])
  const axisRef = useRef([axisMin, axisMax])
  const configRef = useRef({
    sampleSize,
    distribution,
    maxReps,
    speed,
  })

  useEffect(() => {
    axisRef.current = [axisMin, axisMax]
  }, [axisMin, axisMax])

  useEffect(() => {
    configRef.current = { sampleSize, distribution, maxReps, speed }
  }, [sampleSize, distribution, maxReps, speed])

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    },
    [],
  )

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function finishSimulation() {
    runningRef.current = false
    clearTimer()
    setIsRunning(false)
    setFinished(true)
  }

  function pushMean(value) {
    meansRef.current = [...meansRef.current, value]
    setMeans(meansRef.current)
  }

  function runStep() {
    if (!runningRef.current) {
      return
    }

    const config = configRef.current
    const mode = SPEED_MODES[config.speed]
    const [currentAxisMin, currentAxisMax] = axisRef.current

    if (meansRef.current.length >= config.maxReps) {
      finishSimulation()
      return
    }

    if (mode.batch > 1) {
      const remaining = config.maxReps - meansRef.current.length
      const count = Math.min(mode.batch, remaining)
      const added = []
      let lastSample = null
      let lastMean = null
      let lastBin = null

      for (let index = 0; index < count; index += 1) {
        const sample = generateSample(
          config.sampleSize,
          config.distribution,
        )
        const mean = average(sample)

        added.push(mean)
        lastSample = sample
        lastMean = mean
        lastBin = binIndex(mean, currentAxisMin, currentAxisMax)
      }

      meansRef.current = [...meansRef.current, ...added]
      setMeans(meansRef.current)
      setCurrentSample(lastSample)
      setCurrentMean(lastMean)
      setHighlight({ phase: 'bin', bin: lastBin })

      if (meansRef.current.length >= config.maxReps) {
        finishSimulation()
        return
      }

      timerRef.current = setTimeout(runStep, mode.interval)
      return
    }

    const sample = generateSample(
      config.sampleSize,
      config.distribution,
    )
    const mean = average(sample)
    const bin = binIndex(mean, currentAxisMin, currentAxisMax)

    setCurrentSample(sample)
    setCurrentMean(mean)

    if (mode.staggerDelay > 0) {
      /* Медленно: сначала подсвечиваем среднее на оси выборки, */
      setHighlight({ phase: 'mean', bin })

      timerRef.current = setTimeout(() => {
        if (!runningRef.current) {
          return
        }

        /* затем добавляем его на гистограмму и подсвечиваем столбец. */
        pushMean(mean)
        setHighlight({ phase: 'bin', bin })

        if (meansRef.current.length >= config.maxReps) {
          finishSimulation()
          return
        }

        timerRef.current = setTimeout(
          runStep,
          Math.max(mode.interval - mode.staggerDelay, 60),
        )
      }, mode.staggerDelay)

      return
    }

    pushMean(mean)
    setHighlight({ phase: 'bin', bin })

    if (meansRef.current.length >= config.maxReps) {
      finishSimulation()
      return
    }

    timerRef.current = setTimeout(runStep, mode.interval)
  }

  function handleStart() {
    if (isRunning || meansRef.current.length >= maxReps) {
      return
    }

    runningRef.current = true
    setIsRunning(true)
    setFinished(false)
    clearTimer()
    timerRef.current = setTimeout(runStep, 0)
  }

  function handlePause() {
    runningRef.current = false
    clearTimer()
    setIsRunning(false)
  }

  function resetSimulation() {
    runningRef.current = false
    clearTimer()
    meansRef.current = []
    setIsRunning(false)
    setFinished(false)
    setMeans([])
    setCurrentSample(null)
    setCurrentMean(null)
    setHighlight({ phase: 'idle', bin: null })
    setAnswers(STATEMENTS.map(() => false))
    setCheckResult('none')
  }

  function handleDistributionChange(value) {
    resetSimulation()
    setDistribution(value)
  }

  function handleSampleSizeChange(value) {
    resetSimulation()
    setSampleSize(value)
  }

  function handleMaxRepsChange(value) {
    resetSimulation()
    setMaxReps(value)
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
    const correct = STATEMENTS.every(
      (statement, index) => answers[index] === statement.correct,
    )

    setCheckResult(correct ? 'correct' : 'incorrect')
  }

  const highlightBin =
    highlight.phase === 'bin' ? highlight.bin : null

  return (
    <div className="builder">
      <div className="builder-controls">
        <div className="control-group">
          <label htmlFor="builder-distribution">
            Исходное распределение
          </label>

          <select
            id="builder-distribution"
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

        <div className="control-group control-group--range">
          <div className="control-group__heading">
            <label htmlFor="builder-sample-size">Размер выборки</label>
            <strong>n = {sampleSize}</strong>
          </div>

          <input
            id="builder-sample-size"
            type="range"
            min={N_MIN}
            max={N_MAX}
            step="1"
            value={sampleSize}
            onChange={(event) =>
              handleSampleSizeChange(Number(event.target.value))
            }
          />
        </div>

        <div
          className="builder-speed"
          role="radiogroup"
          aria-label="Скорость"
        >
          <span className="builder-speed__label">Скорость</span>

          <div className="builder-speed__options">
            {[
              { value: 'slow', label: 'Медленно' },
              { value: 'fast', label: 'Быстро' },
              { value: 'veryfast', label: 'Очень быстро' },
            ].map((mode) => (
              <label key={mode.value}>
                <input
                  type="radio"
                  name="builder-speed"
                  value={mode.value}
                  checked={speed === mode.value}
                  onChange={() => setSpeed(mode.value)}
                />

                <span>{mode.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="control-group control-group--repetitions">
          <label htmlFor="builder-max-reps">
            Максимум повторений
          </label>

          <select
            id="builder-max-reps"
            value={maxReps}
            onChange={(event) =>
              handleMaxRepsChange(Number(event.target.value))
            }
          >
            <option value={200}>200</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>

        <div className="builder-controls__buttons">
          <button
            className="primary-button"
            type="button"
            onClick={handleStart}
            disabled={isRunning || means.length >= maxReps}
          >
            ▶ Старт
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={handlePause}
            disabled={!isRunning}
          >
            ⏸ Пауза
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={resetSimulation}
          >
            ↺ Сброс
          </button>
        </div>
      </div>

      <div className="builder-stage">
        <div className="builder-sample">
          <h4>Текущая выборка</h4>
          <p className="builder-sample__caption">Отдельные наблюдения</p>

          {currentSample ? (
            <SampleAxis
              observations={currentSample}
              meanValue={currentMean}
              distribution={distribution}
              highlighted={highlight.phase !== 'idle'}
            />
          ) : (
            <div className="builder-sample__placeholder">
              Нажми «Старт», чтобы появилась первая выборка.
            </div>
          )}

          <div className="builder-sample__mean">
            <span>Среднее этой выборки</span>
            <strong>
              {currentMean === null ? '—' : formatNumber(currentMean)}
            </strong>
          </div>
        </div>

        <div className="builder-hist">
          <div className="builder-hist__head">
            <div>
              <h4>Распределение выборочных средних</h4>
              <p>Каждая новая выборка добавляет одно новое среднее.</p>
            </div>

            <span className="builder-hist__count" aria-live="polite">
              Повторений: {means.length} / {maxReps}
            </span>
          </div>

          <BuildingHistogram
            bins={bins}
            axisMin={axisMin}
            axisMax={axisMax}
            highlightBin={highlightBin}
          />

          <dl className="builder-stats">
            <div>
              <dt>Среднее всех средних</dt>
              <dd>
                {meanOfMeans === null ? '—' : formatNumber(meanOfMeans)}
              </dd>
            </div>

            <div>
              <dt>Стандартное отклонение</dt>
              <dd>{means.length < 2 ? '—' : formatNumber(stdOfMeans)}</dd>
            </div>

            <div>
              <dt>Добавлено средних</dt>
              <dd>{means.length.toLocaleString('ru-RU')}</dd>
            </div>
          </dl>
        </div>
      </div>

      {finished && (
        <div className="builder-after">
          <div className="builder-summary">
            <h3>Что произошло?</h3>

            <p>
              Каждая выборка дала только одно новое среднее. Постепенно
              из множества таких средних сформировалось распределение.
              Чем больше повторений мы выполнили, тем лучше стала видна
              его форма.
            </p>
          </div>

          <div className="builder-quiz">
            <h3>Попробуй сделать вывод самостоятельно</h3>

            <p>
              Посмотри на то, как строилась гистограмма. Отметь только
              те утверждения, которые действительно подтверждаются
              экспериментом.
            </p>

            <form className="builder-checklist">
              {STATEMENTS.map((statement, index) => (
                <label className="builder-checkbox" key={statement.id}>
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
              Проверить
            </button>

            {checkResult === 'incorrect' && (
              <div className="builder-feedback builder-feedback--hint">
                <p>
                  Посмотри ещё раз, как менялась гистограмма во время
                  симуляции. Попробуй проследить путь одной новой
                  выборки: выборка → среднее → гистограмма.
                </p>
              </div>
            )}

            {checkResult === 'correct' && (
              <>
                <div className="builder-feedback builder-feedback--success">
                  <h4>Что удалось увидеть?</h4>

                  <p>
                    Распределение выборочных средних не возникает
                    мгновенно. Оно постепенно строится из средних
                    большого числа случайных выборок.
                  </p>

                  <p>
                    Каждая новая выборка добавляет только одно новое
                    значение. Вместе эти значения и образуют
                    распределение выборочных средних.
                  </p>
                </div>

                <p className="section-transition">
                  Теперь возникает новый вопрос. Почему большинство
                  средних оказывается около центра, а очень большие и
                  очень маленькие значения встречаются редко?
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SamplingBuilder
