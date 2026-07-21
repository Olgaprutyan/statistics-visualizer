import { useEffect, useMemo, useState } from 'react'
import { usePersistentState } from '../usePersistentState'

/*
 * «Почему центр самый высокий?» — самостоятельный комбинаторный этап.
 * Каждое наблюдение равно 0 или 2. Перебираем все 2^n комбинаций
 * по одной; высота столбца среднего — число способов его получить.
 * Центральные средние получаются множеством способов → они выше.
 */

const SMALL = 0
const LARGE = 2
const N_MIN = 2
const N_MAX = 8
const DEFAULT_N = 5
const AUTO_INTERVAL = 320

function comboAt(index, sampleSize) {
  const combo = []

  for (let position = 0; position < sampleSize; position += 1) {
    combo.push(((index >> position) & 1) === 1 ? LARGE : SMALL)
  }

  return combo
}

function countLarge(combo) {
  return combo.filter((value) => value === LARGE).length
}

function binomial(n, k) {
  if (k < 0 || k > n) {
    return 0
  }

  let result = 1

  for (let index = 0; index < k; index += 1) {
    result = (result * (n - index)) / (index + 1)
  }

  return Math.round(result)
}

function formatMean(value) {
  return value.toFixed(2).replace('.', ',')
}

function zeros(length) {
  return new Array(length).fill(0)
}

/* Полностью перебранная гистограмма — биномиальные коэффициенты. */
function fullBinomial(sampleSize) {
  return Array.from({ length: sampleSize + 1 }, (_unused, k) =>
    binomial(sampleSize, k),
  )
}

/* Гистограмма: сколько способов получить каждое среднее. */
function WaysChart({ counts, means, maxCount, highlightBar }) {
  const width = 600
  const height = 320
  const margin = { top: 26, right: 18, bottom: 44, left: 20 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom

  const barSlot = plotWidth / counts.length
  const barWidth = Math.min(barSlot - 12, 56)

  return (
    <svg
      className="combos-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Гистограмма числа способов получить каждое среднее"
    >
      <line
        className="combos-chart__axis"
        x1={margin.left}
        x2={width - margin.right}
        y1={margin.top + plotHeight}
        y2={margin.top + plotHeight}
      />

      {counts.map((count, index) => {
        const barHeight = (count / maxCount) * plotHeight
        const centerX = margin.left + (index + 0.5) * barSlot
        const y = margin.top + plotHeight - barHeight

        return (
          <g key={index}>
            {count > 0 && (
              <text
                className="combos-chart__count"
                x={centerX}
                y={y - 7}
                textAnchor="middle"
              >
                {count}
              </text>
            )}

            <rect
              className={
                index === highlightBar
                  ? 'combos-chart__bar combos-chart__bar--active'
                  : 'combos-chart__bar'
              }
              x={centerX - barWidth / 2}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="3"
            />

            <text
              className="combos-chart__tick"
              x={centerX}
              y={height - 24}
              textAnchor="middle"
            >
              {formatMean(means[index])}
            </text>
          </g>
        )
      })}

      <text
        className="combos-chart__axis-label"
        x={margin.left + plotWidth / 2}
        y={height - 6}
        textAnchor="middle"
      >
        Среднее выборки
      </text>
    </svg>
  )
}

const STATEMENTS = [
  {
    id: 'center-often',
    text: 'Средние около центра встречаются чаще.',
    correct: true,
  },
  {
    id: 'large-often',
    text: 'Самые большие средние встречаются чаще всего.',
    correct: false,
  },
  {
    id: 'extremes-rare',
    text: 'Очень маленькие и очень большие средние появляются редко.',
    correct: true,
  },
  {
    id: 'all-equal',
    text: 'Все средние встречаются одинаково часто.',
    correct: false,
  },
]

function CombinationsLab() {
  const [sampleSize, setSampleSize] = usePersistentState(
    'combos.n',
    DEFAULT_N,
  )
  const [completed, setCompleted] = usePersistentState(
    'combos.completed',
    false,
  )
  const [answers, setAnswers] = usePersistentState('combos.answers', () =>
    STATEMENTS.map(() => false),
  )
  const [checkResult, setCheckResult] = usePersistentState(
    'combos.check',
    'none',
  )

  /*
   * viewed и counts восстанавливаются из «завершено»: перебор
   * детерминирован, поэтому финальную гистограмму можно построить точно.
   */
  const [viewed, setViewed] = useState(() =>
    completed ? 2 ** sampleSize : 0,
  )
  const [counts, setCounts] = useState(() =>
    completed ? fullBinomial(sampleSize) : zeros(sampleSize + 1),
  )
  const [currentCombo, setCurrentCombo] = useState(null)
  const [highlightBar, setHighlightBar] = useState(null)
  const [isAuto, setIsAuto] = useState(false)

  const total = 2 ** sampleSize
  const finished = viewed >= total

  const means = useMemo(
    () =>
      Array.from(
        { length: sampleSize + 1 },
        (_unused, k) => (LARGE * k) / sampleSize,
      ),
    [sampleSize],
  )

  const maxCount = useMemo(
    () => binomial(sampleSize, Math.floor(sampleSize / 2)),
    [sampleSize],
  )

  const currentLarge = currentCombo ? countLarge(currentCombo) : null
  const currentSum = currentLarge === null ? null : LARGE * currentLarge
  const currentMean =
    currentLarge === null ? null : currentSum / sampleSize

  function stepOnce() {
    if (viewed >= total) {
      return
    }

    const combo = comboAt(viewed, sampleSize)
    const large = countLarge(combo)
    const nextViewed = viewed + 1

    setCurrentCombo(combo)
    setHighlightBar(large)
    setCounts((previousCounts) => {
      const next = previousCounts.slice()
      next[large] += 1

      return next
    })
    setViewed(nextViewed)

    if (nextViewed >= total) {
      setIsAuto(false)
      setCompleted(true)
    }
  }

  /* Автоматический перебор. */
  useEffect(() => {
    if (!isAuto || viewed >= total) {
      return undefined
    }

    const timer = setTimeout(stepOnce, AUTO_INTERVAL)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuto, viewed, total])

  function resetSimulation(nextSampleSize = sampleSize) {
    setViewed(0)
    setCounts(zeros(nextSampleSize + 1))
    setCurrentCombo(null)
    setHighlightBar(null)
    setIsAuto(false)
    setCompleted(false)
    setAnswers(STATEMENTS.map(() => false))
    setCheckResult('none')
  }

  function handleSampleSizeChange(value) {
    resetSimulation(value)
    setSampleSize(value)
  }

  function handleNext() {
    if (finished || isAuto) {
      return
    }

    stepOnce()
  }

  function handleAuto() {
    if (finished) {
      return
    }

    setIsAuto((previous) => !previous)
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
    <div className="combos">
      <div className="combos-controls">
        <div className="control-group control-group--range">
          <div className="control-group__heading">
            <label htmlFor="combos-sample-size">Размер выборки (n)</label>
            <strong>n = {sampleSize}</strong>
          </div>

          <input
            id="combos-sample-size"
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

        <div className="combos-values">
          <span className="combos-values__label">Значения наблюдений</span>

          <div className="combos-values__chips">
            <span className="combos-chip combos-chip--small">
              <span className="combos-chip__dot" />0 — маленькое
            </span>

            <span className="combos-chip combos-chip--large">
              <span className="combos-chip__dot" />2 — большое
            </span>
          </div>
        </div>

        <div className="combos-controls__buttons">
          <button
            className="primary-button"
            type="button"
            onClick={handleNext}
            disabled={finished || isAuto}
          >
            ▶ Следующая комбинация
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={handleAuto}
            disabled={finished}
          >
            {isAuto ? '⏸ Пауза' : '▶▶ Автоматически'}
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={() => resetSimulation()}
          >
            ↺ Сброс
          </button>
        </div>
      </div>

      <div className="combos-stage">
        <div className="combos-current">
          <h4>Текущая комбинация</h4>

          {currentCombo ? (
            <div className="combos-current__circles" key={viewed}>
              {currentCombo.map((value, index) => (
                <span
                  className={
                    value === LARGE
                      ? 'combos-dot combos-dot--large'
                      : 'combos-dot combos-dot--small'
                  }
                  key={index}
                >
                  {value}
                </span>
              ))}
            </div>
          ) : (
            <div className="combos-current__placeholder">
              Нажми «Следующая комбинация», чтобы появилась первая.
            </div>
          )}

          <dl className="combos-current__stats">
            <div>
              <dt>Сумма</dt>
              <dd>{currentSum === null ? '—' : currentSum}</dd>
            </div>

            <div>
              <dt>Среднее</dt>
              <dd>
                {currentMean === null ? '—' : formatMean(currentMean)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="combos-hist">
          <div className="combos-hist__head">
            <div>
              <h4>Сколько способов получить каждое среднее?</h4>
              <p>
                Каждая новая комбинация увеличивает высоту одного
                столбца.
              </p>
            </div>

            <span className="combos-hist__count" aria-live="polite">
              Просмотрено комбинаций: {viewed} / {total}
            </span>
          </div>

          <WaysChart
            counts={counts}
            means={means}
            maxCount={maxCount}
            highlightBar={highlightBar}
          />
        </div>
      </div>

      {finished && (
        <div className="combos-after">
          <div className="combos-quiz">
            <h3>Что ты заметил?</h3>

            <p>
              Посмотри на построенную гистограмму и попробуй
              самостоятельно сделать вывод.
            </p>

            <form className="combos-checklist">
              {STATEMENTS.map((statement, index) => (
                <label className="combos-checkbox" key={statement.id}>
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
              <div className="combos-feedback combos-feedback--hint">
                <p>
                  Попробуй ещё раз посмотреть на гистограмму. Обрати
                  внимание, какие столбцы росли быстрее всего во время
                  перебора комбинаций.
                </p>
              </div>
            )}

            {checkResult === 'correct' && (
              <>
                <div className="combos-feedback combos-feedback--success">
                  <h4>Почему так получилось?</h4>

                  <p>
                    Чтобы получить очень большое среднее, почти все
                    наблюдения должны одновременно оказаться большими.
                    Чтобы получить очень маленькое среднее, почти все
                    наблюдения должны одновременно оказаться маленькими.
                    Такие комбинации встречаются редко.
                  </p>

                  <p>
                    Средние около центра можно получить множеством
                    разных комбинаций. Именно поэтому центральные
                    столбцы оказываются выше остальных.
                  </p>
                </div>

                <div className="combos-keyidea">
                  <h4>Главная идея</h4>

                  <p>
                    Центр оказывается самым высоким не потому, что
                    значения «тянутся» к нему. Просто существует гораздо
                    больше различных комбинаций, которые дают средние
                    около центра.
                  </p>
                </div>

                <div className="combos-next">
                  <h4>А что происходит, когда наблюдений становится много?</h4>

                  <p>
                    Мы рассмотрели очень простой случай, где каждое
                    наблюдение могло принимать только два значения. В
                    реальных данных значения могут быть любыми, но
                    действует похожий принцип: существует огромное
                    количество способов получить среднее, близкое к
                    центру, и гораздо меньше способов получить очень
                    большие или очень маленькие средние.
                  </p>
                </div>

                <p className="section-transition">
                  Теперь осталось понять ещё одну закономерность. Почему
                  при увеличении размера выборки распределение становится
                  не только похожим на колокол, но и более узким?
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CombinationsLab
