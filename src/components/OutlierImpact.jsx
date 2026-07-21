import { useState } from 'react'

const INITIAL_OUTLIER = 6
const OUTLIER_MIN = 5
const OUTLIER_MAX = 30
const OUTLIER_STEP = 1

/*
 * Базовые массивы вынесены за пределы компонента,
 * поэтому не создаются заново при каждом рендере
 * и остаются воспроизводимыми.
 */
const SMALL_BASE = [4, 5, 6]
const LARGE_UNIT = [4, 5, 6, 5, 4, 6, 5, 5, 4, 6]
const LARGE_BASE = [...LARGE_UNIT, ...LARGE_UNIT, ...LARGE_UNIT]

/*
 * Небольшая вспомогательная функция для среднего.
 */
const mean = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length

/*
 * Заменяет последнее (изменяемое) наблюдение выборки.
 */
const withOutlier = (base, value) => [
  ...base.slice(0, -1),
  value,
]

const formatMean = (value) => value.toFixed(2).replace('.', ',')

const formatShift = (value) => {
  const rounded = Math.round(value * 100) / 100
  const magnitude = Math.abs(rounded).toFixed(2).replace('.', ',')

  if (rounded > 0) {
    return `+${magnitude}`
  }

  if (rounded < 0) {
    return `−${magnitude}`
  }

  return magnitude
}

/* Параметры единой шкалы графика (одинаковой для обеих выборок). */
const VIEW_WIDTH = 340
const VIEW_HEIGHT = 100
const AXIS_MIN = 0
const AXIS_MAX = 32
const PAD_LEFT = 18
const PAD_RIGHT = 18
const AXIS_Y = 70
const PLOT_WIDTH = VIEW_WIDTH - PAD_LEFT - PAD_RIGHT
const AXIS_TICKS = [0, 8, 16, 24, 32]

const scaleX = (value) =>
  PAD_LEFT +
  ((value - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * PLOT_WIDTH

function SampleDotPlot({ values, meanValue, ariaLabel }) {
  const meanX = scaleX(meanValue)
  const outlierIndex = values.length - 1

  return (
    <svg
      className="outlier-plot"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
    >
      <line
        className="outlier-plot__axis"
        x1={PAD_LEFT}
        x2={VIEW_WIDTH - PAD_RIGHT}
        y1={AXIS_Y}
        y2={AXIS_Y}
      />

      {AXIS_TICKS.map((tick) => (
        <g key={tick}>
          <line
            className="outlier-plot__tick"
            x1={scaleX(tick)}
            x2={scaleX(tick)}
            y1={AXIS_Y}
            y2={AXIS_Y + 5}
          />

          <text
            className="outlier-plot__tick-label"
            x={scaleX(tick)}
            y={AXIS_Y + 18}
            textAnchor="middle"
          >
            {tick}
          </text>
        </g>
      ))}

      <line
        className="outlier-plot__mean-line"
        x1={meanX}
        x2={meanX}
        y1={10}
        y2={AXIS_Y}
      />

      <path
        className="outlier-plot__mean-marker"
        d={`M ${meanX} 6 L ${meanX + 6} 13 L ${meanX} 20 L ${meanX - 6} 13 Z`}
      />

      {values.map((value, index) => {
        const isOutlier = index === outlierIndex
        const row = index % 6
        const cy = AXIS_Y - 12 - row * 8

        return (
          <circle
            className={
              isOutlier
                ? 'outlier-plot__point outlier-plot__point--outlier'
                : 'outlier-plot__point'
            }
            key={index}
            cx={scaleX(value)}
            cy={cy}
            r={isOutlier ? 5 : 3.2}
          />
        )
      })}
    </svg>
  )
}

function OutlierImpact() {
  /* В состоянии храним только значение изменяемого наблюдения. */
  const [outlierValue, setOutlierValue] = useState(INITIAL_OUTLIER)

  const smallCurrent = withOutlier(SMALL_BASE, outlierValue)
  const largeCurrent = withOutlier(LARGE_BASE, outlierValue)

  const smallOriginalMean = mean(
    withOutlier(SMALL_BASE, INITIAL_OUTLIER),
  )
  const largeOriginalMean = mean(
    withOutlier(LARGE_BASE, INITIAL_OUTLIER),
  )

  const smallCurrentMean = mean(smallCurrent)
  const largeCurrentMean = mean(largeCurrent)

  const smallShift = smallCurrentMean - smallOriginalMean
  const largeShift = largeCurrentMean - largeOriginalMean

  const isBaseline = outlierValue === INITIAL_OUTLIER

  return (
    <div className="outlier-impact">
      <div className="outlier-impact-controls">
        <div className="outlier-impact-controls__row">
          <label htmlFor="outlier-value">
            Значение необычного наблюдения
          </label>

          <strong aria-live="polite">{outlierValue}</strong>
        </div>

        <input
          id="outlier-value"
          type="range"
          min={OUTLIER_MIN}
          max={OUTLIER_MAX}
          step={OUTLIER_STEP}
          value={outlierValue}
          onChange={(event) =>
            setOutlierValue(Number(event.target.value))
          }
        />

        <div className="outlier-impact-controls__footer">
          <div className="range-limits">
            <span>{OUTLIER_MIN}</span>
            <span>{OUTLIER_MAX}</span>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setOutlierValue(INITIAL_OUTLIER)}
          >
            Вернуть исходное значение
          </button>
        </div>
      </div>

      <div className="outlier-impact-comparison">
        <article className="outlier-impact-card">
          <h4>Маленькая выборка: n = 3</h4>

          <SampleDotPlot
            values={smallCurrent}
            meanValue={smallCurrentMean}
            ariaLabel={`Маленькая выборка из 3 наблюдений, среднее ${formatMean(
              smallCurrentMean,
            )}`}
          />

          <dl className="outlier-impact-stats">
            <div>
              <dt>Исходное среднее</dt>
              <dd>{formatMean(smallOriginalMean)}</dd>
            </div>

            <div>
              <dt>Текущее среднее</dt>
              <dd>{formatMean(smallCurrentMean)}</dd>
            </div>

            <div>
              <dt>Сдвиг среднего</dt>
              <dd className="outlier-impact-stats__shift">
                {formatShift(smallShift)}
              </dd>
            </div>
          </dl>
        </article>

        <article className="outlier-impact-card">
          <h4>Большая выборка: n = 30</h4>

          <SampleDotPlot
            values={largeCurrent}
            meanValue={largeCurrentMean}
            ariaLabel={`Большая выборка из 30 наблюдений, среднее ${formatMean(
              largeCurrentMean,
            )}`}
          />

          <dl className="outlier-impact-stats">
            <div>
              <dt>Исходное среднее</dt>
              <dd>{formatMean(largeOriginalMean)}</dd>
            </div>

            <div>
              <dt>Текущее среднее</dt>
              <dd>{formatMean(largeCurrentMean)}</dd>
            </div>

            <div>
              <dt>Сдвиг среднего</dt>
              <dd className="outlier-impact-stats__shift">
                {formatShift(largeShift)}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="outlier-impact-legend">
        <span className="outlier-impact-legend__item">
          <span className="outlier-impact-legend__dot" />
          точка — отдельное наблюдение
        </span>

        <span className="outlier-impact-legend__item">
          <span className="outlier-impact-legend__dot outlier-impact-legend__dot--outlier" />
          выделенная точка — наблюдение, которое мы изменяем
        </span>

        <span className="outlier-impact-legend__item">
          <span className="outlier-impact-legend__mean" />
          маркер среднего — среднее всей выборки
        </span>
      </div>

      <p className="outlier-impact-summary">
        {isBaseline
          ? 'Передвинь ползунок вправо и посмотри, как одна и та же точка влияет на две выборки.'
          : 'Одна и та же необычная точка сильнее сдвигает среднее маленькой выборки. В большой выборке её влияние делится между большим числом наблюдений.'}
      </p>

      {!isBaseline && (
        <ul className="outlier-impact-shifts">
          <li>
            В маленькой выборке сдвиг среднего: {formatShift(smallShift)}
          </li>

          <li>
            В большой выборке сдвиг среднего: {formatShift(largeShift)}
          </li>
        </ul>
      )}
    </div>
  )
}

export default OutlierImpact
