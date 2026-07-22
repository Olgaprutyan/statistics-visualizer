import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import { formatDecimal } from '../../utils/random'
import ChoiceQuestion from './ChoiceQuestion'

/*
 * §12.2. «Накопленная относительная частота».
 * Учебная цель: относительная частота обновляется после каждого нового
 * наблюдения и обычно стабилизируется около p.
 *
 * Точные величины (число событий, n, текущая частота) считаются по ВСЕМ
 * наблюдениям. Для графика траектория прореживается только при отображении
 * (§12.3, §23): до 500 точек показываем каждую, дальше — равномерную выборку,
 * последнюю точку показываем всегда.
 */

const P_OPTIONS = [0.2, 0.5, 0.7]
const MAX_OPTIONS = [100, 1000, 10000]
const MAX_DISPLAY_POINTS = 400

// Геометрия SVG-области построения.
const PLOT_LEFT = 34
const PLOT_RIGHT = 412
const PLOT_TOP = 12
const AXIS_Y = 150

function mapX(n, xMax) {
  const ratio = xMax > 0 ? n / xMax : 0
  return PLOT_LEFT + ratio * (PLOT_RIGHT - PLOT_LEFT)
}

function mapY(freq) {
  return AXIS_Y - freq * (AXIS_Y - PLOT_TOP)
}

// Равномерное прореживание траектории для отображения, последняя точка всегда.
function thinPath(path) {
  if (path.length <= MAX_DISPLAY_POINTS) return path
  const step = path.length / MAX_DISPLAY_POINTS
  const out = []
  for (let i = 0; i < MAX_DISPLAY_POINTS; i += 1) {
    out.push(path[Math.floor(i * step)])
  }
  out.push(path[path.length - 1])
  return out
}

const OBSERVATION_OPTIONS = [
  { text: 'Да', correct: false },
  { text: 'Нет, но они обычно становятся меньше', correct: true },
]

function RunningFrequencyExperiment() {
  const [probability, setProbability] = usePersistentState('pl.run.p', 0.5)
  const [maxReps, setMaxReps] = usePersistentState('pl.run.max', 1000)
  const [n, setN] = useState(0)
  const [successes, setSuccesses] = useState(0)
  // path: массив { n, freq } — накопленная частота после каждого шага.
  const [path, setPath] = useState([])

  // Добавить count испытаний пакетно, обновив состояние одним setState (§23).
  function addTrials(count) {
    const remaining = maxReps - n
    const toAdd = Math.min(count, remaining)
    if (toAdd <= 0) return

    let currentN = n
    let currentSuccesses = successes
    const newPoints = []

    for (let i = 0; i < toAdd; i += 1) {
      currentN += 1
      if (Math.random() < probability) currentSuccesses += 1
      newPoints.push({ n: currentN, freq: currentSuccesses / currentN })
    }

    setN(currentN)
    setSuccesses(currentSuccesses)
    setPath((current) => [...current, ...newPoints])
  }

  function reset() {
    setN(0)
    setSuccesses(0)
    setPath([])
  }

  const hasData = n > 0
  const frequency = hasData ? successes / n : 0
  const xMax = Math.max(n, 1)
  const displayPath = thinPath(path)
  const polyline = displayPath
    .map((point) => `${mapX(point.n, xMax)},${mapY(point.freq)}`)
    .join(' ')
  const atMax = n >= maxReps

  return (
    <div className="pd-exp">
      <div className="pviz__group">
        <span className="pviz__label">Вероятность события p</span>
        {P_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={
              'pviz__btn' +
              (probability === value ? ' pviz__btn--active' : '')
            }
            aria-pressed={probability === value}
            disabled={hasData}
            onClick={() => setProbability(value)}
          >
            {formatDecimal(value, 1)}
          </button>
        ))}
      </div>

      <div className="pviz__group">
        <span className="pviz__label">Максимальное число повторений</span>
        {MAX_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={
              'pviz__btn' + (maxReps === value ? ' pviz__btn--active' : '')
            }
            aria-pressed={maxReps === value}
            disabled={hasData}
            onClick={() => setMaxReps(value)}
          >
            {value}
          </button>
        ))}
      </div>

      {hasData && (
        <p className="pd-exp__hint">
          Чтобы изменить p или максимум, нажмите «Начать заново».
        </p>
      )}

      <div className="pviz__group pl-run__actions">
        <button
          type="button"
          className="pviz__btn"
          disabled={atMax}
          onClick={() => addTrials(1)}
        >
          Добавить 1
        </button>
        <button
          type="button"
          className="pviz__btn"
          disabled={atMax}
          onClick={() => addTrials(10)}
        >
          Добавить 10
        </button>
        <button
          type="button"
          className="pviz__btn"
          disabled={atMax}
          onClick={() => addTrials(100)}
        >
          Добавить 100
        </button>
        <button
          type="button"
          className="pviz__btn"
          disabled={atMax}
          onClick={() => addTrials(maxReps - n)}
        >
          Провести до конца
        </button>
        <button
          type="button"
          className="pviz__btn"
          disabled={!hasData}
          onClick={reset}
        >
          Начать заново
        </button>
      </div>

      <div className="pd-exp__plot">
        <div className="pd-exp__label">
          Накопленная относительная частота по числу повторений n
        </div>
        <svg
          className="pd-plot"
          viewBox="0 0 440 176"
          role="img"
          aria-label="Накопленная относительная частота по мере роста числа повторений"
        >
          {/* Ось Y: подписи 0, p, 1 */}
          {[0, 1].map((value) => (
            <text
              key={value}
              x={PLOT_LEFT - 6}
              y={mapY(value) + 3}
              textAnchor="end"
              style={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            >
              {formatDecimal(value, 1)}
            </text>
          ))}

          <line
            x1={PLOT_LEFT}
            y1={PLOT_TOP}
            x2={PLOT_LEFT}
            y2={AXIS_Y}
            style={{ stroke: 'var(--axis-color)', strokeWidth: 1 }}
          />
          <line
            x1={PLOT_LEFT}
            y1={AXIS_Y}
            x2={PLOT_RIGHT}
            y2={AXIS_Y}
            style={{ stroke: 'var(--axis-color)', strokeWidth: 1 }}
          />

          {/* Пунктирная линия вероятности модели p */}
          <line
            x1={PLOT_LEFT}
            y1={mapY(probability)}
            x2={PLOT_RIGHT}
            y2={mapY(probability)}
            style={{
              stroke: 'var(--accent)',
              strokeWidth: 1.5,
              strokeDasharray: '5 4',
            }}
          />
          <text
            x={PLOT_RIGHT}
            y={mapY(probability) - 4}
            textAnchor="end"
            style={{ fill: 'var(--accent)', fontSize: 9 }}
          >
            p = {formatDecimal(probability, 1)}
          </text>

          {/* Траектория накопленной частоты */}
          {displayPath.length > 1 && (
            <polyline
              points={polyline}
              fill="none"
              style={{ stroke: 'var(--text-primary)', strokeWidth: 1.5 }}
            />
          )}

          {/* Текущая точка */}
          {hasData && (
            <circle
              cx={mapX(n, xMax)}
              cy={mapY(frequency)}
              r="3.5"
              style={{ fill: 'var(--accent)' }}
            />
          )}

          {/* Подписи оси X: 0 и текущее n */}
          <text
            x={PLOT_LEFT}
            y={AXIS_Y + 15}
            textAnchor="middle"
            style={{ fill: 'var(--text-secondary)', fontSize: 10 }}
          >
            0
          </text>
          {hasData && (
            <text
              x={PLOT_RIGHT}
              y={AXIS_Y + 15}
              textAnchor="end"
              style={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            >
              n = {n}
            </text>
          )}
        </svg>
      </div>

      <div className="pd-exp__stats">
        <div>
          Повторений: <b className="pd-exp__stat-main">{n}</b>
        </div>
        <div>
          Событие произошло:{' '}
          <span className="pd-exp__stat-muted">{successes} раз</span>
        </div>
        <div>
          Относительная частота:{' '}
          <span className="pd-exp__stat-muted">
            {hasData ? formatDecimal(frequency, 3) : '—'}
          </span>
        </div>
        <div>
          Вероятность в модели:{' '}
          <span className="pd-exp__stat-muted">
            {formatDecimal(probability, 3)}
          </span>
        </div>
      </div>

      {n >= 100 && (
        <ChoiceQuestion
          storageKey="pl.run.observation"
          question="Исчезли ли колебания относительной частоты полностью?"
          options={OBSERVATION_OPTIONS}
          correctFeedback="Новые результаты продолжают изменять частоту. Однако их влияние на уже накопленную долю уменьшается, потому что каждый новый результат составляет только 1/n всей серии."
          neutralFeedback="Приглядись к правому краю графика: колебания уменьшаются, но не пропадают совсем."
        />
      )}
    </div>
  )
}

export default RunningFrequencyExperiment
