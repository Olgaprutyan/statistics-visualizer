import { useState } from 'react'
import { formatHours } from '../../utils/random'

/*
 * Контролируемое сравнение: одно и то же значение заменяет одно наблюдение
 * в маленькой и большой выборке. Автозапуска нет, пользователь сам включает
 * замену и сравнивает сдвиг среднего.
 */

const SMALL_SAMPLE = [6.5, 7.1, 6.8, 7.3, 6.9]
const LARGE_N = 100
const LARGE_MEAN = 7.0
const REPLACED_VALUE = 6.5
const NEW_VALUE = 3.2

const H_MIN = 3
const H_MAX = 10
const PLOT_W = 360
const PLOT_H = 98
const PAD_L = 18
const PAD_R = 18
const AXIS_Y = 66

const LARGE_DOTS = Array.from({ length: 30 }, (_, i) => {
  const spread = ((i % 7) - 3) * 0.28
  return LARGE_MEAN + spread
})
const TICKS = [3, 4, 5, 6, 7, 8, 9, 10]

function xForHours(h) {
  const t = (h - H_MIN) / (H_MAX - H_MIN)
  return PAD_L + t * (PLOT_W - PAD_L - PAD_R)
}

function average(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function NumberLine({ dots, meanValue, replacementShown }) {
  const meanX = xForHours(meanValue)

  return (
    <svg
      className="pd-plot"
      viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
      role="img"
      aria-label="Ось значений и линия среднего"
    >
      <line
        x1={PAD_L}
        y1={AXIS_Y}
        x2={PLOT_W - PAD_R}
        y2={AXIS_Y}
        style={{ stroke: 'var(--axis-color)', strokeWidth: 1 }}
      />

      {TICKS.map((h) => (
        <g key={h}>
          <line
            x1={xForHours(h)}
            y1={AXIS_Y}
            x2={xForHours(h)}
            y2={AXIS_Y + 5}
            style={{ stroke: 'var(--axis-color)', strokeWidth: 1 }}
          />
          <text
            x={xForHours(h)}
            y={AXIS_Y + 18}
            textAnchor="middle"
            style={{ fill: 'var(--text-secondary)', fontSize: 9 }}
          >
            {h}
          </text>
        </g>
      ))}

      {dots.map((h, i) => (
        <circle
          key={`${h}-${i}`}
          cx={xForHours(h)}
          cy={AXIS_Y - (i % 3) * 7}
          r={4}
          style={{ fill: 'var(--accent)', fillOpacity: 0.5 }}
        />
      ))}

      {replacementShown && (
        <>
          <circle
            cx={xForHours(REPLACED_VALUE)}
            cy={AXIS_Y - 24}
            r={5}
            style={{
              fill: 'var(--surface)',
              stroke: 'var(--text-secondary)',
              strokeWidth: 2,
            }}
          />
          <circle
            cx={xForHours(NEW_VALUE)}
            cy={AXIS_Y - 24}
            r={5}
            style={{
              fill: 'var(--accent)',
              stroke: 'var(--accent-hover)',
              strokeWidth: 2,
            }}
          />
        </>
      )}

      <line
        x1={meanX}
        y1={14}
        x2={meanX}
        y2={AXIS_Y}
        style={{
          stroke: 'var(--text-primary)',
          strokeWidth: 2,
          strokeDasharray: '5 4',
        }}
      />
      <text
        x={meanX}
        y={10}
        textAnchor="middle"
        style={{
          fill: 'var(--text-primary)',
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {formatHours(meanValue)}
      </text>
    </svg>
  )
}

function MeanReadout({ before, after }) {
  const change = Math.abs(after - before)

  return (
    <dl className="pd-mean-readout">
      <div>
        <dt>Прежнее среднее</dt>
        <dd>{formatHours(before)}</dd>
      </div>
      <div>
        <dt>Новое среднее</dt>
        <dd>{formatHours(after)}</dd>
      </div>
      <div>
        <dt>Изменение</dt>
        <dd>{formatHours(change)}</dd>
      </div>
    </dl>
  )
}

function SamplingVariabilityExplanation() {
  const [replacementShown, setReplacementShown] = useState(false)

  const smallBefore = average(SMALL_SAMPLE)
  const smallAfter =
    (smallBefore * SMALL_SAMPLE.length - REPLACED_VALUE + NEW_VALUE) /
    SMALL_SAMPLE.length
  const smallMean = replacementShown ? smallAfter : smallBefore

  const largeBefore = LARGE_MEAN
  const largeAfter = (LARGE_N * LARGE_MEAN - REPLACED_VALUE + NEW_VALUE) / LARGE_N
  const largeMean = replacementShown ? largeAfter : largeBefore

  const smallDots = replacementShown
    ? SMALL_SAMPLE.map((value, index) => (index === 0 ? NEW_VALUE : value))
    : SMALL_SAMPLE
  const largeDots = replacementShown
    ? LARGE_DOTS.map((value, index) => (index === 0 ? NEW_VALUE : value))
    : LARGE_DOTS

  return (
    <div className="pd-exp">
      <h3 className="pd-exp__title">Заменим одно наблюдение</h3>
      <p className="pd-exp__hint">
        В обеих выборках одно наблюдение со значением {formatHours(REPLACED_VALUE)}
        заменяется на {formatHours(NEW_VALUE)} часа. Меняется только одно
        значение, но вклад этого значения в среднее зависит от размера выборки.
      </p>

      <div className="pd-btn-row">
        <button
          type="button"
          className={`pviz__btn${!replacementShown ? ' pviz__btn--active' : ''}`}
          aria-pressed={!replacementShown}
          onClick={() => setReplacementShown(false)}
        >
          Исходная выборка
        </button>
        <button
          type="button"
          className={`pviz__btn${replacementShown ? ' pviz__btn--active' : ''}`}
          aria-pressed={replacementShown}
          onClick={() => setReplacementShown(true)}
        >
          Заменить одно наблюдение
        </button>
      </div>

      <div className="pd-exp__row">
        <div>
          <div className="pd-exp__title">n = 5</div>
          <NumberLine
            dots={smallDots}
            meanValue={smallMean}
            replacementShown={replacementShown}
          />
          <MeanReadout before={smallBefore} after={smallAfter} />
        </div>

        <div>
          <div className="pd-exp__title">n = 100</div>
          <NumberLine
            dots={largeDots}
            meanValue={largeMean}
            replacementShown={replacementShown}
          />
          <MeanReadout before={largeBefore} after={largeAfter} />
        </div>
      </div>
    </div>
  )
}

export default SamplingVariabilityExplanation
