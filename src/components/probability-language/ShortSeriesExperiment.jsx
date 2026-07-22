import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import {
  generateBernoulliSeries,
  countSuccesses,
  calculateRelativeFrequency,
  formatDecimal,
} from '../../utils/random'

/*
 * §10.3. «Одна вероятность — разные короткие серии».
 * Учебная цель: одна и та же вероятность порождает разные последовательности
 * результатов. Событие произошло — 1, не произошло — 0.
 * В localStorage сохраняются только параметры (§26): сами последовательности
 * не сохраняем.
 */

const P_OPTIONS = [0.2, 0.5, 0.8]
const LENGTH_OPTIONS = [5, 10, 20]
const HISTORY_LIMIT = 5

function ShortSeriesExperiment() {
  const [probability, setProbability] = usePersistentState('pl.short.p', 0.5)
  const [length, setLength] = usePersistentState('pl.short.len', 10)
  const [series, setSeries] = useState(null)
  const [history, setHistory] = useState([])

  function generate() {
    const values = generateBernoulliSeries(probability, length)
    const successes = countSuccesses(values)
    const frequency = calculateRelativeFrequency(values)
    setSeries({ values, successes, frequency, probability, length })
    setHistory((current) =>
      [frequency, ...current].slice(0, HISTORY_LIMIT),
    )
  }

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
            onClick={() => setProbability(value)}
          >
            {formatDecimal(value, 1)}
          </button>
        ))}
      </div>

      <div className="pviz__group">
        <span className="pviz__label">Длина серии</span>
        {LENGTH_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={
              'pviz__btn' + (length === value ? ' pviz__btn--active' : '')
            }
            aria-pressed={length === value}
            onClick={() => setLength(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="pd-btn-row">
        <button type="button" className="pviz__btn" onClick={generate}>
          Сгенерировать серию
        </button>
      </div>

      {series && (
        <>
          <div
            className="pl-sequence"
            role="img"
            aria-label={`Серия из ${series.length} результатов: ${series.values.join(
              ' ',
            )}`}
          >
            {series.values.map((value, index) => (
              <span
                key={index}
                className={
                  'pl-bit' + (value === 1 ? ' pl-bit--one' : ' pl-bit--zero')
                }
              >
                {value}
              </span>
            ))}
          </div>

          <div className="pd-exp__stats">
            <div>
              Заданная вероятность:{' '}
              <b className="pd-exp__stat-main">
                {formatDecimal(series.probability, 1)}
              </b>
            </div>
            <div>
              Событие произошло:{' '}
              <span className="pd-exp__stat-muted">
                {series.successes} из {series.length}
              </span>
            </div>
            <div>
              Наблюдаемая частота:{' '}
              <span className="pd-exp__stat-muted">
                {formatDecimal(series.frequency, 2)}
              </span>
            </div>
          </div>

          {history.length > 1 && (
            <div className="pl-history">
              <p className="pl-history__title">Последние серии</p>
              <ol className="pl-history__list">
                {history.map((frequency, index) => (
                  <li key={index}>
                    Серия {history.length - index}: относительная частота{' '}
                    {formatDecimal(frequency, 2)}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <p className="pd-feedback">
            Вероятность процедуры не менялась, но наблюдаемая доля событий в
            коротких сериях различалась. В этой серии относительная частота
            события составила {formatDecimal(series.frequency, 2)}.
          </p>
        </>
      )}
    </div>
  )
}

export default ShortSeriesExperiment
