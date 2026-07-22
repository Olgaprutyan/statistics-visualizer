import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import {
  manySampleMeans,
  mean,
  standardDeviation,
  formatHours,
  POPULATION_MEAN,
} from '../../utils/random'

/*
 * Сравнение изменчивости выборочного среднего для малого и большого размера
 * выборки. Две гистограммы строятся на одной горизонтальной шкале [6, 8]
 * часов и с одинаковыми границами столбцов.
 */

const REPS_OPTIONS = [100, 500, 2000]

// Общая для обеих гистограмм ось часов и разбиение на столбцы.
const DOMAIN_MIN = 6
const DOMAIN_MAX = 8
const BIN_COUNT = 24
const BIN_WIDTH = (DOMAIN_MAX - DOMAIN_MIN) / BIN_COUNT

// Геометрия SVG-области построения.
const PLOT_LEFT = 20
const PLOT_RIGHT = 420
const PLOT_TOP = 12
const AXIS_Y = 96

function mapX(value) {
  const t = (value - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)
  return PLOT_LEFT + t * (PLOT_RIGHT - PLOT_LEFT)
}

function binCounts(values) {
  const counts = new Array(BIN_COUNT).fill(0)

  values.forEach((value) => {
    if (value < DOMAIN_MIN || value > DOMAIN_MAX) return

    let index = Math.floor((value - DOMAIN_MIN) / BIN_WIDTH)
    if (index >= BIN_COUNT) index = BIN_COUNT - 1
    if (index < 0) index = 0
    counts[index] += 1
  })

  return counts
}

function Histogram({ counts, maxCount, label }) {
  const axisTicks = [6, 7, 8]

  return (
    <div className="pd-exp__plot">
      <div className="pd-exp__label">{label}</div>
      <svg
        className="pd-plot"
        viewBox="0 0 440 120"
        role="img"
        aria-label={label}
      >
        {counts.map((count, i) => {
          const height =
            maxCount > 0 ? (count / maxCount) * (AXIS_Y - PLOT_TOP) : 0
          const x = mapX(DOMAIN_MIN + i * BIN_WIDTH)
          const barWidth = (PLOT_RIGHT - PLOT_LEFT) / BIN_COUNT

          return (
            <rect
              key={i}
              x={x}
              y={AXIS_Y - height}
              width={Math.max(0, barWidth - 1)}
              height={height}
              style={{ fill: 'var(--chart-bar)' }}
            />
          )
        })}

        <line
          x1={PLOT_LEFT}
          y1={AXIS_Y}
          x2={PLOT_RIGHT}
          y2={AXIS_Y}
          style={{ stroke: 'var(--axis-color)', strokeWidth: 1 }}
        />

        {axisTicks.map((h) => (
          <text
            key={h}
            x={mapX(h)}
            y={AXIS_Y + 14}
            textAnchor="middle"
            style={{ fill: 'var(--text-secondary)', fontSize: 10 }}
          >
            {h}
          </text>
        ))}

        <line
          x1={mapX(POPULATION_MEAN)}
          y1={PLOT_TOP}
          x2={mapX(POPULATION_MEAN)}
          y2={AXIS_Y}
          style={{
            stroke: 'var(--accent)',
            strokeWidth: 1.5,
            strokeDasharray: '5 4',
          }}
        />
        <text
          x={mapX(POPULATION_MEAN)}
          y={PLOT_TOP - 2}
          textAnchor="middle"
          style={{ fill: 'var(--accent)', fontSize: 9 }}
        >
          Среднее в совокупности
        </text>
      </svg>
    </div>
  )
}

function SampleSizeComparison() {
  const [smallN, setSmallN] = usePersistentState('pd.cmp.small', 10)
  const [largeN, setLargeN] = usePersistentState('pd.cmp.large', 100)
  const [reps, setReps] = usePersistentState('pd.cmp.reps', 500)
  const [result, setResult] = useState(null)
  const [prediction, setPrediction] = usePersistentState(
    'pd.cmp.prediction',
    null,
  )

  const predictionOptions = [
    `n = ${smallN}`,
    `n = ${largeN}`,
    'Разброс будет одинаковым',
  ]
  const hasResult = result !== null

  function generate() {
    setResult({
      smallN,
      largeN,
      reps,
      small: manySampleMeans(smallN, reps),
      large: manySampleMeans(largeN, reps),
    })
  }

  let smallCounts = []
  let largeCounts = []
  let maxCount = 0

  if (hasResult) {
    smallCounts = binCounts(result.small)
    largeCounts = binCounts(result.large)
    maxCount = Math.max(...smallCounts, ...largeCounts, 1)
  }

  return (
    <div className="pd-exp">
      <div className="pviz__control">
        <label className="pviz__control-label">
          Малая выборка: n = {smallN}
        </label>
        <input
          className="pviz__slider"
          type="range"
          min="5"
          max="30"
          value={smallN}
          onChange={(e) => setSmallN(Number(e.target.value))}
        />
      </div>

      <div className="pviz__control">
        <label className="pviz__control-label">
          Большая выборка: n = {largeN}
        </label>
        <input
          className="pviz__slider"
          type="range"
          min="40"
          max="200"
          value={largeN}
          onChange={(e) => setLargeN(Number(e.target.value))}
        />
      </div>

      <div className="pviz__control">
        <label className="pviz__control-label">Число повторений</label>
        <div className="pviz__controls">
          {REPS_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              className={
                'pviz__btn' + (reps === value ? ' pviz__btn--active' : '')
              }
              aria-pressed={reps === value}
              onClick={() => setReps(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="pviz__btn" onClick={generate}>
        Сгенерировать результаты
      </button>

      {!hasResult && (
        <>
          <p className="pd-q">
            Для какого размера выборки средние будут сильнее различаться между
            повторениями?
          </p>
          <div className="pd-options">
            {predictionOptions.map((label, index) => (
              <button
                key={label}
                type="button"
                className={
                  'pd-option' +
                  (prediction === index ? ' pd-option--selected' : '')
                }
                aria-pressed={prediction === index}
                onClick={() => setPrediction(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {hasResult && (
        <>
          <div className="pd-hist-grid">
            <Histogram
              counts={smallCounts}
              maxCount={maxCount}
              label={`Малые выборки: n = ${result.smallN}`}
            />
            <Histogram
              counts={largeCounts}
              maxCount={maxCount}
              label={`Большие выборки: n = ${result.largeN}`}
            />
          </div>

          <p className="pd-feedback">
            Средние малых выборок обычно разбросаны сильнее. В малой выборке
            каждое отдельное наблюдение оказывает большее влияние на итоговое
            среднее.
          </p>

          <table className="pd-exp__table pd-exp__table--wide">
            <thead>
              <tr>
                <th></th>
                <th>n = {result.smallN}</th>
                <th>n = {result.largeN}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Среднее выборочных средних</td>
                <td>{formatHours(mean(result.small))}</td>
                <td>{formatHours(mean(result.large))}</td>
              </tr>
              <tr>
                <td>Стандартное отклонение</td>
                <td>{formatHours(standardDeviation(result.small))}</td>
                <td>{formatHours(standardDeviation(result.large))}</td>
              </tr>
              <tr>
                <td>Минимальное среднее</td>
                <td>{formatHours(Math.min(...result.small))}</td>
                <td>{formatHours(Math.min(...result.large))}</td>
              </tr>
              <tr>
                <td>Максимальное среднее</td>
                <td>{formatHours(Math.max(...result.small))}</td>
                <td>{formatHours(Math.max(...result.large))}</td>
              </tr>
            </tbody>
          </table>

          <p className="pd-exp__hint">
            Стандартное отклонение здесь показывает, насколько сильно
            выборочные средние различаются между повторениями.
          </p>

          <p className="pd-exp__hint">
            Позже мы назовём стандартное отклонение выборочной статистики её
            стандартной ошибкой.
          </p>
        </>
      )}
    </div>
  )
}

export default SampleSizeComparison
