import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import {
  generateFrequencyDistribution,
  mean,
  standardDeviation,
  formatDecimal,
} from '../../utils/random'
import ChoiceQuestion from './ChoiceQuestion'

/*
 * §11.3–11.4. «Сравни серии».
 * Много независимых серий при фиксированной вероятности модели p = 0,6.
 * Для каждой серии считается относительная частота; строится распределение
 * этих частот на общей шкале [0, 1] с пунктирной линией вероятности модели.
 */

const MODEL_P = 0.6
const SIZE_OPTIONS = [10, 50, 200]
const COUNT_OPTIONS = [10, 100, 500]

// Общая шкала [0, 1] и фиксированное разбиение — одинаковое при сравнении.
const BIN_COUNT = 20
const PLOT_LEFT = 30
const PLOT_RIGHT = 410
const PLOT_TOP = 14
const AXIS_Y = 104
const AXIS_TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1]

function mapX(value) {
  return PLOT_LEFT + value * (PLOT_RIGHT - PLOT_LEFT)
}

function binCounts(values) {
  const counts = new Array(BIN_COUNT).fill(0)
  values.forEach((value) => {
    let index = Math.floor(value * BIN_COUNT)
    if (index >= BIN_COUNT) index = BIN_COUNT - 1
    if (index < 0) index = 0
    counts[index] += 1
  })
  return counts
}

const PREDICTION_OPTIONS = [
  { text: 'Они будут сильнее различаться между сериями', correct: false },
  { text: 'Они будут чаще находиться около 0,6', correct: true },
  { text: 'Все они станут ровно равны 0,6', correct: false },
  { text: 'Средняя частота обязательно станет больше', correct: false },
]

function FrequencyDistributionExperiment() {
  const [sampleSize, setSampleSize] = usePersistentState('pl.dist.size', 50)
  const [seriesCount, setSeriesCount] = usePersistentState(
    'pl.dist.count',
    100,
  )
  const [result, setResult] = useState(null)

  function run() {
    const frequencies = generateFrequencyDistribution(
      MODEL_P,
      sampleSize,
      seriesCount,
    )
    setResult({ frequencies, sampleSize, seriesCount })
  }

  const hasResult = result !== null
  const counts = hasResult ? binCounts(result.frequencies) : []
  const maxCount = hasResult ? Math.max(...counts, 1) : 1
  const barWidth = (PLOT_RIGHT - PLOT_LEFT) / BIN_COUNT

  return (
    <div className="pd-exp">
      <p className="pd-exp__hint">
        Истинная вероятность в модели: p = {formatDecimal(MODEL_P, 1)}
      </p>

      <div className="pviz__group">
        <span className="pviz__label">Размер серии</span>
        {SIZE_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={
              'pviz__btn' +
              (sampleSize === value ? ' pviz__btn--active' : '')
            }
            aria-pressed={sampleSize === value}
            onClick={() => setSampleSize(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="pviz__group">
        <span className="pviz__label">Число независимых серий</span>
        {COUNT_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={
              'pviz__btn' +
              (seriesCount === value ? ' pviz__btn--active' : '')
            }
            aria-pressed={seriesCount === value}
            onClick={() => setSeriesCount(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="pd-btn-row">
        <button type="button" className="pviz__btn" onClick={run}>
          Провести серии
        </button>
      </div>

      <ChoiceQuestion
        storageKey="pl.dist.prediction"
        question="Что произойдёт с относительными частотами при увеличении длины каждой серии?"
        options={PREDICTION_OPTIONS}
        correctFeedback="Увеличение числа повторений уменьшает типичные отклонения относительной частоты от вероятности."
        neutralFeedback="Сравни распределения при разных размерах серии: с ростом n частоты собираются ближе к 0,6."
      />

      {hasResult && (
        <>
          <div className="pd-exp__plot">
            <div className="pd-exp__label">
              Относительные частоты {result.seriesCount} серий по{' '}
              {result.sampleSize} испытаний
            </div>
            <svg
              className="pd-plot"
              viewBox="0 0 440 128"
              role="img"
              aria-label={`Распределение относительных частот при размере серии ${result.sampleSize}`}
            >
              {counts.map((count, i) => {
                const height =
                  maxCount > 0 ? (count / maxCount) * (AXIS_Y - PLOT_TOP) : 0
                return (
                  <rect
                    key={i}
                    x={mapX(i / BIN_COUNT)}
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

              {AXIS_TICKS.map((tick) => (
                <text
                  key={tick}
                  x={mapX(tick)}
                  y={AXIS_Y + 15}
                  textAnchor="middle"
                  style={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                >
                  {formatDecimal(tick, 1)}
                </text>
              ))}

              <line
                x1={mapX(MODEL_P)}
                y1={PLOT_TOP}
                x2={mapX(MODEL_P)}
                y2={AXIS_Y}
                style={{
                  stroke: 'var(--accent)',
                  strokeWidth: 1.5,
                  strokeDasharray: '5 4',
                }}
              />
              <text
                x={mapX(MODEL_P)}
                y={PLOT_TOP - 3}
                textAnchor="middle"
                style={{ fill: 'var(--accent)', fontSize: 9 }}
              >
                Вероятность в модели
              </text>
            </svg>
          </div>

          <div className="pd-exp__stats">
            <div>
              Среднее частот:{' '}
              <b className="pd-exp__stat-main">
                {formatDecimal(mean(result.frequencies), 3)}
              </b>
            </div>
            <div>
              Разброс частот (ст. отклонение):{' '}
              <span className="pd-exp__stat-muted">
                {formatDecimal(standardDeviation(result.frequencies), 3)}
              </span>
            </div>
            <div className="pd-exp__stat-muted">
              Мин: {formatDecimal(Math.min(...result.frequencies), 2)} · Макс:{' '}
              {formatDecimal(Math.max(...result.frequencies), 2)}
            </div>
          </div>

          <p className="pd-feedback">
            При маленьком размере серии частоты сильно разбросаны. При большом
            размере они сосредоточены ближе к 0,6. Увеличение числа повторений
            уменьшает типичные отклонения, но конечная частота не обязана
            совпадать с вероятностью точно.
          </p>
        </>
      )}
    </div>
  )
}

export default FrequencyDistributionExperiment
