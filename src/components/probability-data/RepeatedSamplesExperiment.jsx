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
 * Одна и та же процедура отбора может давать разные реализации:
 * меняются конкретные наблюдения и, следовательно, выборочное среднее.
 */

const SIZE_OPTIONS = [10, 30, 100]
const REPEAT_OPTIONS = [5, 20, 100]

const CHECK_OPTIONS = [
  { id: 'population', text: 'Изучаемая совокупность', correct: true },
  { id: 'rule', text: 'Правило отбора', correct: true },
  { id: 'size', text: 'Размер выборки', correct: true },
  { id: 'observations', text: 'Конкретные наблюдения', correct: false },
  { id: 'mean', text: 'Выборочное среднее', correct: false },
]

// Окно оси в часах, где концентрируются выборочные средние.
const AXIS_MIN = 6
const AXIS_MAX = 8
const PLOT_LEFT = 20
const PLOT_RIGHT = 400
const AXIS_Y = 95
const TICKS = [6, 6.5, 7, 7.5, 8]

function mapX(value) {
  const clamped = Math.min(AXIS_MAX, Math.max(AXIS_MIN, value))
  const ratio = (clamped - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)
  return PLOT_LEFT + ratio * (PLOT_RIGHT - PLOT_LEFT)
}

function toggleId(ids, id) {
  return ids.includes(id)
    ? ids.filter((currentId) => currentId !== id)
    : [...ids, id]
}

function RepeatedSamplesExperiment() {
  const [size, setSize] = usePersistentState('pd.repeat.size', 30)
  const [repeat, setRepeat] = usePersistentState('pd.repeat.count', 20)
  const [means, setMeans] = useState([])
  const [checkAnswers, setCheckAnswers] = usePersistentState(
    'pd.repeat.check',
    [],
  )
  const [checkRevealed, setCheckRevealed] = useState(false)
  const [answer, setAnswer] = usePersistentState('pd.repeat.answer', '')
  const [answerRevealed, setAnswerRevealed] = useState(false)

  const hasMeans = means.length > 0
  const meanX = mapX(POPULATION_MEAN)
  const allCheckCorrect = CHECK_OPTIONS.every(
    (option) => option.correct === checkAnswers.includes(option.id),
  )

  return (
    <div className="pd-exp">
      <div className="pviz__controls">
        <div className="pviz__group">
          <span className="pviz__label">Размер выборки</span>
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={
                'pviz__btn' + (size === option ? ' pviz__btn--active' : '')
              }
              aria-pressed={size === option}
              onClick={() => setSize(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="pviz__group">
          <span className="pviz__label">Число повторений</span>
          {REPEAT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={
                'pviz__btn' + (repeat === option ? ' pviz__btn--active' : '')
              }
              aria-pressed={repeat === option}
              onClick={() => setRepeat(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="pviz__btn"
          onClick={() => {
            setMeans(manySampleMeans(size, repeat))
            setCheckRevealed(false)
          }}
        >
          Повторить процедуру отбора
        </button>
      </div>

      {hasMeans && (
        <>
          <svg
            className="pd-plot"
            viewBox="0 0 420 130"
            role="img"
            aria-label="Выборочные средние повторных выборок"
          >
            <line
              x1={PLOT_LEFT}
              y1={AXIS_Y}
              x2={PLOT_RIGHT}
              y2={AXIS_Y}
              style={{ stroke: 'var(--axis-color)', strokeWidth: 1 }}
            />

            {TICKS.map((tick) => (
              <g key={tick}>
                <line
                  x1={mapX(tick)}
                  y1={AXIS_Y}
                  x2={mapX(tick)}
                  y2={AXIS_Y + 5}
                  style={{ stroke: 'var(--axis-color)', strokeWidth: 1 }}
                />
                <text
                  x={mapX(tick)}
                  y={AXIS_Y + 18}
                  textAnchor="middle"
                  style={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                >
                  {formatHours(tick)}
                </text>
              </g>
            ))}

            {means.map((value, index) => (
              <circle
                key={index}
                cx={mapX(value)}
                cy={AXIS_Y - 15 - (index % 7) * 6}
                r="4"
                style={{ fill: 'var(--accent)', fillOpacity: 0.55 }}
              />
            ))}

            <line
              x1={meanX}
              y1={15}
              x2={meanX}
              y2={AXIS_Y}
              style={{
                stroke: 'var(--text-primary)',
                strokeWidth: 1.5,
                strokeDasharray: '5 4',
              }}
            />
            <text
              x={meanX}
              y={11}
              textAnchor="middle"
              style={{ fontSize: 10, fill: 'var(--text-secondary)' }}
            >
              Среднее в совокупности
            </text>
          </svg>

          {repeat === 5 && (
            <table className="pd-exp__table">
              <thead>
                <tr>
                  <th>Повторение</th>
                  <th>Выборочное среднее</th>
                </tr>
              </thead>
              <tbody>
                {means.map((value, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatHours(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pd-exp__stats">
            <div>
              Среднее выборочных средних:{' '}
              <b className="pd-exp__stat-main">{formatHours(mean(means))}</b>
            </div>
            <div>
              Стандартное отклонение:{' '}
              <span className="pd-exp__stat-muted">
                {formatHours(standardDeviation(means))}
              </span>
            </div>
            <div className="pd-exp__stat-muted">
              Мин: {formatHours(Math.min(...means))} · Макс:{' '}
              {formatHours(Math.max(...means))}
            </div>
          </div>

          <p className="pd-q">
            Что оставалось неизменным при каждом повторении?
          </p>
          <div className="pd-checkbox-list">
            {CHECK_OPTIONS.map((option) => {
              const checked = checkAnswers.includes(option.id)

              let status = null
              if (checkRevealed) {
                if (option.correct && checked) status = 'ok'
                else if (!option.correct && checked) status = 'wrong'
                else if (option.correct && !checked) status = 'missed'
              }

              let className = 'pd-checkbox'
              if (!checkRevealed && checked) {
                className += ' pd-checkbox--selected'
              }
              if (status === 'ok') className += ' pd-checkbox--correct'
              if (status === 'wrong') className += ' pd-checkbox--wrong'
              if (status === 'missed') className += ' pd-checkbox--missed'

              return (
                <label className={className} key={option.id}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setCheckAnswers((ids) => toggleId(ids, option.id))
                      setCheckRevealed(false)
                    }}
                  />
                  <span>{option.text}</span>
                  {status === 'ok' && (
                    <span className="pd-checkbox__tag pd-checkbox__tag--ok">
                      ✓ верно
                    </span>
                  )}
                  {status === 'wrong' && (
                    <span className="pd-checkbox__tag pd-checkbox__tag--wrong">
                      ✗ лишнее
                    </span>
                  )}
                  {status === 'missed' && (
                    <span className="pd-checkbox__tag pd-checkbox__tag--missed">
                      нужно было отметить
                    </span>
                  )}
                </label>
              )
            })}
          </div>

          <div className="pd-btn-row">
            <button
              type="button"
              className="pviz__btn"
              onClick={() => setCheckRevealed(true)}
            >
              Проверить
            </button>
          </div>

          {checkRevealed && (
            <>
              <p
                className={
                  'pd-verdict ' +
                  (allCheckCorrect
                    ? 'pd-verdict--ok'
                    : 'pd-verdict--partial')
                }
              >
                {allCheckCorrect
                  ? 'Верно! Отмечено ровно то, что не менялось от повторения к повторению.'
                  : 'Не совсем. Зелёным помечено верно, красным — лишнее, «нужно было отметить» — пропущенное.'}
              </p>
              <p className="pd-feedback">
                Неизменными оставались изучаемая совокупность, правило
                отбора и размер выборки. Менялись только конкретные
                наблюдения в выборке — а значит, и рассчитанное по ним
                выборочное среднее.
              </p>
            </>
          )}

          <p className="pd-q">
            Почему одна и та же процедура отбора не обязана каждый раз давать
            одинаковое среднее?
          </p>
          <textarea
            className="pd-textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Напиши короткое объяснение"
          />
          <div className="pd-btn-row">
            <button
              type="button"
              className="pviz__btn"
              onClick={() => setAnswerRevealed(true)}
            >
              Сравнить с объяснением
            </button>
          </div>
          {answerRevealed && (
            <p className="pd-feedback">
              При каждом повторении в выборку попадает другой набор
              наблюдений. Поскольку среднее рассчитывается по этим
              наблюдениям, оно тоже может изменяться.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default RepeatedSamplesExperiment
