import { useEffect, useMemo, useRef, useState } from 'react'
import { usePersistentState } from '../usePersistentState'

/*
 * «Почему распределение становится уже?» — интуитивный шаг перед формулой.
 * Пользователь добавляет наблюдения по одному и видит, что среднее
 * с каждым разом сдвигается всё меньше. Затем сравнивает n = 5 и n = 50.
 */

const DIST_PARAMS = {
  exponential: {
    label: 'Экспоненциальное',
    obsMin: 0,
    obsMax: 6,
    mean: 1,
    meanAxis: [0, 3],
  },
  uniform: {
    label: 'Равномерное',
    obsMin: 0,
    obsMax: 1,
    mean: 0.5,
    meanAxis: [0, 1],
  },
  normal: {
    label: 'Нормальное',
    obsMin: -3.5,
    obsMax: 3.5,
    mean: 0,
    meanAxis: [-1.6, 1.6],
  },
}

const SPEED_MODES = {
  slow: { label: 'Медленно', interval: 850 },
  fast: { label: 'Быстро', interval: 420 },
  veryfast: { label: 'Очень быстро', interval: 190 },
}

const N_MIN = 2
const N_MAX = 50
const DEFAULT_N = 20

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

function makeDataset(size, distribution) {
  const values = []

  for (let index = 0; index < size; index += 1) {
    values.push(generateObservation(distribution))
  }

  return values
}

const average = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length

function formatNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—'
  }

  return value.toFixed(2).replace('.', ',')
}

/*
 * Плавно «переезжает» к целевому значению (анимация числа и маркера).
 * Использует метку времени requestAnimationFrame.
 */
function useTween(target, duration = 450) {
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)
  const frameRef = useRef(null)

  useEffect(() => {
    const to = target

    if (to === null || to === undefined) {
      valueRef.current = to
      /* Обновляем состояние асинхронно, вне тела эффекта. */
      frameRef.current = setTimeout(() => setValue(to), 0)

      return () => clearTimeout(frameRef.current)
    }

    const from =
      valueRef.current === null || valueRef.current === undefined
        ? to
        : valueRef.current

    /*
     * Анимация на setTimeout со счётчиком кадров (~16 мс) —
     * надёжнее requestAnimationFrame в фоновых/скрытых вкладках.
     */
    const totalFrames = Math.max(Math.round(duration / 16), 1)
    let frame = 0

    const tick = () => {
      frame += 1

      const progress = Math.min(frame / totalFrames, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      const current = from + (to - from) * eased

      valueRef.current = current
      setValue(current)

      if (progress < 1) {
        frameRef.current = setTimeout(tick, 16)
      }
    }

    frameRef.current = setTimeout(tick, 16)

    return () => clearTimeout(frameRef.current)
  }, [target, duration])

  return value
}

/* Левая ось: наблюдения как точки, новое — фиолетовое. */
function DotsAxis({ values, distribution, newIndex }) {
  const width = 340
  const height = 120
  const margin = { left: 18, right: 18 }
  const axisY = 84
  const { obsMin, obsMax } = DIST_PARAMS[distribution]
  const range = obsMax - obsMin || 1
  const plotWidth = width - margin.left - margin.right

  const scaleX = (value) => {
    const clamped = Math.max(obsMin, Math.min(obsMax, value))

    return margin.left + ((clamped - obsMin) / range) * plotWidth
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(
    (fraction) => obsMin + fraction * range,
  )

  return (
    <svg
      className="shrink-dots"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Наблюдения выборки на числовой оси"
    >
      <line
        className="shrink-axis"
        x1={margin.left}
        x2={width - margin.right}
        y1={axisY}
        y2={axisY}
      />

      {ticks.map((tick) => (
        <text
          className="shrink-tick"
          key={tick}
          x={scaleX(tick)}
          y={axisY + 20}
          textAnchor="middle"
        >
          {formatNumber(tick)}
        </text>
      ))}

      {values.map((value, index) => (
        <circle
          className={
            index === newIndex
              ? 'shrink-dot shrink-dot--new'
              : 'shrink-dot'
          }
          key={index}
          cx={scaleX(value)}
          cy={axisY - 12 - (index % 5) * 11}
          r={index === newIndex ? 5.5 : 4}
        />
      ))}
    </svg>
  )
}

/* Ось движения среднего: истинное среднее + текущее (и «призрак»). */
function MeanAxis({ distribution, meanValue, ghostValue, height = 96 }) {
  const width = 460
  const margin = { left: 18, right: 18 }
  const axisY = height - 34
  const { meanAxis, mean: trueMean } = DIST_PARAMS[distribution]
  const [axisMin, axisMax] = meanAxis
  const range = axisMax - axisMin || 1
  const plotWidth = width - margin.left - margin.right

  const scaleX = (value) => {
    const clamped = Math.max(axisMin, Math.min(axisMax, value))

    return margin.left + ((clamped - axisMin) / range) * plotWidth
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(
    (fraction) => axisMin + fraction * range,
  )

  return (
    <svg
      className="shrink-mean"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Движение выборочного среднего относительно истинного"
    >
      <line
        className="shrink-axis"
        x1={margin.left}
        x2={width - margin.right}
        y1={axisY}
        y2={axisY}
      />

      {ticks.map((tick) => (
        <text
          className="shrink-tick"
          key={tick}
          x={scaleX(tick)}
          y={axisY + 20}
          textAnchor="middle"
        >
          {formatNumber(tick)}
        </text>
      ))}

      <line
        className="shrink-mean__true"
        x1={scaleX(trueMean)}
        x2={scaleX(trueMean)}
        y1={12}
        y2={axisY}
      />

      {ghostValue !== null && ghostValue !== undefined && (
        <line
          className="shrink-mean__ghost"
          x1={scaleX(ghostValue)}
          x2={scaleX(ghostValue)}
          y1={20}
          y2={axisY}
        />
      )}

      {meanValue !== null && meanValue !== undefined && (
        <g>
          <line
            className="shrink-mean__current"
            x1={scaleX(meanValue)}
            x2={scaleX(meanValue)}
            y1={12}
            y2={axisY}
          />
          <circle
            className="shrink-mean__dot"
            cx={scaleX(meanValue)}
            cy={12}
            r="5"
          />
        </g>
      )}
    </svg>
  )
}

/* Второй этап: одно наблюдение в маленькой и большой выборке. */
function Comparison({ distribution }) {
  const [small, setSmall] = useState(() => makeDataset(5, distribution))
  const [large, setLarge] = useState(() => makeDataset(50, distribution))

  const smallMean = average(small)
  const largeMean = average(large)

  const dispSmall = useTween(smallMean)
  const dispLarge = useTween(largeMean)

  const [smallShift, setSmallShift] = useState(null)
  const [largeShift, setLargeShift] = useState(null)

  function addObservation() {
    const value = generateObservation(distribution)

    const nextSmall = [...small, value]
    const nextLarge = [...large, value]

    setSmallShift(average(nextSmall) - smallMean)
    setLargeShift(average(nextLarge) - largeMean)
    setSmall(nextSmall)
    setLarge(nextLarge)
  }

  return (
    <div className="shrink-compare">
      <div className="shrink-compare__head">
        <h4>Сравни: одно и то же наблюдение в двух выборках</h4>

        <button
          className="secondary-button"
          type="button"
          onClick={addObservation}
        >
          Добавить наблюдение в обе
        </button>
      </div>

      <div className="shrink-compare__grid">
        <div className="shrink-compare__card">
          <div className="shrink-compare__label">
            <strong>n = {small.length}</strong>
            <span>
              сдвиг:{' '}
              {smallShift === null
                ? '—'
                : `${smallShift >= 0 ? '+' : '−'}${formatNumber(
                    Math.abs(smallShift),
                  )}`}
            </span>
          </div>

          <MeanAxis
            distribution={distribution}
            meanValue={dispSmall}
            ghostValue={null}
            height={80}
          />
        </div>

        <div className="shrink-compare__card">
          <div className="shrink-compare__label">
            <strong>n = {large.length}</strong>
            <span>
              сдвиг:{' '}
              {largeShift === null
                ? '—'
                : `${largeShift >= 0 ? '+' : '−'}${formatNumber(
                    Math.abs(largeShift),
                  )}`}
            </span>
          </div>

          <MeanAxis
            distribution={distribution}
            meanValue={dispLarge}
            ghostValue={null}
            height={80}
          />
        </div>
      </div>
    </div>
  )
}

const STATEMENTS = [
  {
    id: 'small-more',
    text: 'Одно новое наблюдение сильнее влияет на маленькую выборку.',
    correct: true,
  },
  {
    id: 'large-less',
    text: 'В большой выборке среднее изменяется меньше.',
    correct: true,
  },
  {
    id: 'same-effect',
    text: 'Каждое новое наблюдение влияет одинаково независимо от размера выборки.',
    correct: false,
  },
  {
    id: 'more-stable',
    text: 'Чем больше выборка, тем устойчивее становится среднее.',
    correct: true,
  },
]

function SpreadShrink() {
  const [distribution, setDistribution] = useState('exponential')
  const [targetN, setTargetN] = useState(DEFAULT_N)
  const [speed, setSpeed] = useState('slow')
  const [generation, setGeneration] = useState(0)

  const [completed, setCompleted] = usePersistentState(
    'shrink.completed',
    false,
  )

  const [dataset, setDataset] = useState(() =>
    makeDataset(DEFAULT_N, 'exponential'),
  )
  /* Если раздел уже пройден, показываем всю выборку сразу. */
  const [revealed, setRevealed] = useState(() =>
    completed ? DEFAULT_N : 0,
  )
  const [isRunning, setIsRunning] = useState(false)

  const [answers, setAnswers] = usePersistentState('shrink.answers', () =>
    STATEMENTS.map(() => false),
  )
  const [checkResult, setCheckResult] = usePersistentState(
    'shrink.check',
    'none',
  )

  const shown = useMemo(
    () => dataset.slice(0, revealed),
    [dataset, revealed],
  )

  const currentMean = revealed > 0 ? average(shown) : null
  const previousMean =
    revealed > 1 ? average(dataset.slice(0, revealed - 1)) : null
  const lastObservation = revealed > 0 ? dataset[revealed - 1] : null
  const lastShift =
    revealed > 1 && currentMean !== null && previousMean !== null
      ? currentMean - previousMean
      : null

  const displayMean = useTween(currentMean)
  const finished = revealed >= targetN

  function revealNext() {
    if (revealed >= dataset.length) {
      return
    }

    const next = revealed + 1

    setRevealed(next)

    if (next >= dataset.length) {
      setIsRunning(false)
      setCompleted(true)
    }
  }

  useEffect(() => {
    if (!isRunning || revealed >= dataset.length) {
      return undefined
    }

    const timer = setTimeout(revealNext, SPEED_MODES[speed].interval)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, revealed, speed, dataset])

  function regenerate(size = targetN, dist = distribution) {
    setDataset(makeDataset(size, dist))
    setRevealed(0)
    setIsRunning(false)
    setCompleted(false)
    setGeneration((value) => value + 1)
    setAnswers(STATEMENTS.map(() => false))
    setCheckResult('none')
  }

  function handleStart() {
    if (finished) {
      return
    }

    setIsRunning(true)
  }

  function handlePause() {
    setIsRunning(false)
  }

  function handleNext() {
    if (finished || isRunning) {
      return
    }

    revealNext()
  }

  function handleDistributionChange(value) {
    setDistribution(value)
    regenerate(targetN, value)
  }

  function handleSizeChange(value) {
    setTargetN(value)
    regenerate(value, distribution)
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

  return (
    <div className="shrink">
      <div className="shrink-controls">
        <div className="control-group">
          <label htmlFor="shrink-distribution">
            Распределение наблюдений
          </label>

          <select
            id="shrink-distribution"
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
            <label htmlFor="shrink-size">Размер итоговой выборки</label>
            <strong>n = {targetN}</strong>
          </div>

          <input
            id="shrink-size"
            type="range"
            min={N_MIN}
            max={N_MAX}
            step="1"
            value={targetN}
            onChange={(event) =>
              handleSizeChange(Number(event.target.value))
            }
          />
        </div>

        <div
          className="shrink-speed"
          role="radiogroup"
          aria-label="Скорость"
        >
          <span className="shrink-speed__label">Скорость</span>

          <div className="shrink-speed__options">
            {Object.entries(SPEED_MODES).map(([value, mode]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="shrink-speed"
                  value={value}
                  checked={speed === value}
                  onChange={() => setSpeed(value)}
                />

                <span>{mode.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="shrink-controls__buttons">
          <button
            className="primary-button"
            type="button"
            onClick={handleStart}
            disabled={isRunning || finished}
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
            onClick={() => regenerate()}
          >
            ↺ Сгенерировать заново
          </button>
        </div>
      </div>

      <div className="shrink-stage">
        <div className="shrink-panel">
          <div className="shrink-panel__head">
            <h4>Как растёт выборка</h4>

            <span className="shrink-panel__step">
              Наблюдений: {revealed} / {targetN}
            </span>
          </div>

          {revealed > 0 ? (
            <>
              <p className="shrink-panel__new">
                Новое наблюдение:{' '}
                <strong>{formatNumber(lastObservation)}</strong>
              </p>

              <DotsAxis
                values={shown}
                distribution={distribution}
                newIndex={revealed - 1}
              />
            </>
          ) : (
            <div className="shrink-panel__placeholder">
              Нажми «Старт» или «Следующее наблюдение», чтобы добавить
              первое значение.
            </div>
          )}

          <div className="shrink-meancard">
            <span>Текущее выборочное среднее</span>
            <strong>{formatNumber(displayMean)}</strong>
          </div>

          <button
            className="secondary-button shrink-panel__next"
            type="button"
            onClick={handleNext}
            disabled={finished || isRunning}
          >
            Следующее наблюдение
          </button>
        </div>

        <div className="shrink-panel">
          <div className="shrink-panel__head">
            <h4>Движение среднего</h4>
          </div>

          <p className="shrink-panel__legend">
            Фиолетовым — текущее среднее. Серым — где оно было до
            последнего наблюдения. Вертикальная линия — истинное среднее.
          </p>

          <MeanAxis
            distribution={distribution}
            meanValue={displayMean}
            ghostValue={previousMean}
          />

          <div className="shrink-move">
            <span>Последний сдвиг среднего</span>
            <strong>
              {lastShift === null
                ? '—'
                : `${lastShift >= 0 ? '+' : '−'}${formatNumber(
                    Math.abs(lastShift),
                  )}`}
            </strong>
          </div>
        </div>
      </div>

      {finished && (
        <div className="shrink-after">
          <div className="shrink-summary">
            <h3>Что произошло?</h3>

            <p>
              Первые наблюдения сильно меняли среднее. Но чем больше
              наблюдений уже входило в выборку, тем труднее одному новому
              значению заметно изменить результат.
            </p>
          </div>

          <Comparison
            key={`${distribution}-${generation}`}
            distribution={distribution}
          />

          <div className="shrink-quiz">
            <h3>Что удалось заметить?</h3>

            <form className="shrink-checklist">
              {STATEMENTS.map((statement, index) => (
                <label className="shrink-checkbox" key={statement.id}>
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
              <div className="shrink-feedback shrink-feedback--hint">
                <p>
                  Попробуй ещё раз посмотреть, насколько далеко
                  сдвинулось среднее в маленькой и большой выборке.
                </p>
              </div>
            )}

            {checkResult === 'correct' && (
              <>
                <div className="shrink-keyidea">
                  <h4>Главная идея</h4>

                  <p>
                    Каждое новое наблюдение продолжает влиять на среднее.
                    Но теперь ему приходится «договариваться» со всё
                    большим количеством других наблюдений. Поэтому
                    среднее становится более устойчивым.
                  </p>
                </div>

                <div className="shrink-feedback shrink-feedback--success">
                  <h4>Теперь становится понятно</h4>

                  <p>
                    Если каждое отдельное среднее становится более
                    устойчивым, то и все выборочные средние начинают
                    располагаться ближе друг к другу. Поэтому
                    распределение выборочных средних постепенно
                    становится уже.
                  </p>
                </div>

                <div className="shrink-formula-card">
                  <h4>
                    Давайте запишем то, что мы только что обнаружили
                  </h4>

                  <div className="formula formula--mechanism">
                    Δx̄ ={' '}
                    <span className="formula__fraction">
                      <span className="formula__numerator">Δ</span>
                      <span className="formula__denominator">n</span>
                    </span>
                  </div>

                  <p>
                    Если одно наблюдение изменилось на величину Δ, то
                    среднее изменится только на Δ / n. Поэтому при большом
                    n одно новое наблюдение почти не может сильно сдвинуть
                    среднее.
                  </p>
                </div>

                <p className="section-transition">
                  Мы увидели, что среднее становится всё устойчивее.
                  Теперь осталось записать все обнаруженные закономерности
                  в виде математической теоремы.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SpreadShrink
