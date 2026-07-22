import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import { sampleSleepHours, mean, formatHours } from '../../utils/random'

/*
 * Демонстрация связи отдельных наблюдений и выборочного среднего.
 * Пользователь может пересобрать выборку тем же способом и увидеть,
 * как меняются наблюдаемые значения и рассчитанное по ним среднее.
 */

const SIZES = [10, 30, 100]

// Границы оси (часы сна) и геометрия точечного графика.
const HOUR_MIN = 3
const HOUR_MAX = 10
const PLOT_LEFT = 16
const PLOT_RIGHT = 404
const AXIS_Y = 128
const MID_Y = 78

function mapHour(value) {
  const t = (value - HOUR_MIN) / (HOUR_MAX - HOUR_MIN)
  return PLOT_LEFT + t * (PLOT_RIGHT - PLOT_LEFT)
}

function SingleSampleExperiment() {
  const [size, setSize] = usePersistentState('pd.single.size', 30)
  const [sample, setSample] = useState(() => sampleSleepHours(size))
  const [history, setHistory] = useState(() => [mean(sample)])
  const [generation, setGeneration] = useState(0)

  const sampleMeanValue = mean(sample)
  const ticks = [3, 4, 5, 6, 7, 8, 9, 10]

  function collectSample() {
    const nextSample = sampleSleepHours(size)
    const nextMean = mean(nextSample)

    setSample(nextSample)
    setHistory((means) => [...means, nextMean])
    setGeneration((value) => value + 1)
  }

  return (
    <div className="pd-exp">
      <div className="pd-exp__row">
        <div className="pd-exp__controls">
          <label className="pd-exp__label">Размер выборки</label>
          <div className="pd-exp__sizes">
            {SIZES.map((n) => (
              <button
                key={n}
                type="button"
                className={
                  'pviz__btn' + (size === n ? ' pviz__btn--active' : '')
                }
                aria-pressed={size === n}
                onClick={() => setSize(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <button type="button" className="pviz__btn" onClick={collectSample}>
            Собрать выборку
          </button>
        </div>

        <div className="pd-exp__plot">
          <svg
            className="pd-plot"
            viewBox="0 0 420 150"
            role="img"
            aria-label="Точечный график часов сна в выборке"
          >
            <line
              x1={PLOT_LEFT}
              y1={AXIS_Y}
              x2={PLOT_RIGHT}
              y2={AXIS_Y}
              style={{ stroke: 'var(--axis-color)', strokeWidth: 1 }}
            />

            {ticks.map((h) => (
              <text
                key={h}
                x={mapHour(h)}
                y={AXIS_Y + 14}
                textAnchor="middle"
                style={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              >
                {h}
              </text>
            ))}

            {sample.map((value, i) => (
              <circle
                key={`${generation}-${i}`}
                cx={mapHour(value)}
                cy={MID_Y + ((i % 5) - 2) * 7}
                r="4"
                style={{ fill: 'var(--accent)', fillOpacity: 0.6 }}
              />
            ))}

            <line
              x1={mapHour(sampleMeanValue)}
              y1={30}
              x2={mapHour(sampleMeanValue)}
              y2={AXIS_Y}
              style={{
                stroke: 'var(--text-primary)',
                strokeWidth: 2,
                strokeDasharray: '5 4',
              }}
            />
            <text
              x={mapHour(sampleMeanValue)}
              y={22}
              textAnchor="middle"
              style={{
                fill: 'var(--text-primary)',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Среднее выборки: {formatHours(sampleMeanValue)} часа
            </text>
          </svg>

          <div className="pd-exp__stats">
            <span>Наблюдений: {sample.length}</span>
            <span>
              Среднее:{' '}
              <b className="pd-exp__stat-main">
                {formatHours(sampleMeanValue)} часа
              </b>
            </span>
            <span className="pd-exp__stat-muted">
              Минимум: {formatHours(Math.min(...sample))} часа · Максимум:{' '}
              {formatHours(Math.max(...sample))} часа
            </span>
          </div>
        </div>
      </div>

      {history.length >= 2 && (
        <p className="pd-feedback">
          Процедура отбора и изучаемая совокупность не изменились. Изменились
          конкретные наблюдения, попавшие в выборку. Поэтому изменилось и
          среднее.
        </p>
      )}
    </div>
  )
}

export default SingleSampleExperiment
