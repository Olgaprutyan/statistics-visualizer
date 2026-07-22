import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import {
  generateBernoulliSeries,
  countSuccesses,
  formatDecimal,
} from '../../utils/random'

/*
 * §14.4. «Нужно ли компенсировать прошлое?».
 * Вероятность p = 0,5, первые десять результатов — нули. Вопрос о вероятности
 * следующего независимого испытания. После ответа можно продолжить серию и
 * увидеть, что общая частота постепенно возвращается ближе к 0,5 БЕЗ роста
 * вероятности каждого следующего события.
 */

const P = 0.5
const INITIAL_ZEROS = 10

const OPTIONS = [
  { text: 'Меньше 0,5', correct: false },
  { text: 'Ровно 0,5', correct: true },
  { text: 'Больше 0,5', correct: false },
  { text: 'Невозможно определить', correct: false },
]

const ADD_OPTIONS = [10, 100, 1000]

function GamblerFallacyExperiment() {
  const [choice, setChoice] = usePersistentState('pl.gambler.answer', null)
  // Помимо стартовых десяти нулей — дополнительно добавленные испытания.
  const [extraN, setExtraN] = useState(0)
  const [extraSuccesses, setExtraSuccesses] = useState(0)

  const answered = choice !== null
  const totalN = INITIAL_ZEROS + extraN
  const totalSuccesses = extraSuccesses // первые десять — нули
  const frequency = totalSuccesses / totalN

  function addTrials(count) {
    const series = generateBernoulliSeries(P, count)
    setExtraN((current) => current + count)
    setExtraSuccesses((current) => current + countSuccesses(series))
  }

  function reset() {
    setExtraN(0)
    setExtraSuccesses(0)
  }

  return (
    <div className="pd-exp">
      <p className="pd-exp__hint">Вероятность события: p = {formatDecimal(P, 1)}</p>
      <p className="pd-q">Первые десять результатов:</p>
      <div className="pl-sequence" aria-label="Десять нулей подряд">
        {Array.from({ length: INITIAL_ZEROS }).map((_, index) => (
          <span key={index} className="pl-bit pl-bit--zero">
            0
          </span>
        ))}
      </div>

      <p className="pd-q">
        Какова вероятность события в следующем независимом испытании?
      </p>
      <div className="pd-options">
        {OPTIONS.map((option, index) => {
          let className = 'pd-option'
          if (choice === index) className += ' pd-option--selected'
          if (answered) {
            if (option.correct) className += ' pd-option--correct'
            else if (choice === index) className += ' pd-option--wrong'
          }
          return (
            <button
              key={option.text}
              type="button"
              className={className}
              aria-pressed={choice === index}
              onClick={() => setChoice(index)}
            >
              {option.text}
            </button>
          )
        })}
      </div>

      {answered && (
        <>
          <p className="pd-feedback">
            Для независимых повторений прошлые результаты не меняют вероятность
            следующего исхода. Она остаётся ровно 0,5.
          </p>

          <p className="pd-q">
            Продолжим последовательность и посмотрим на общую частоту:
          </p>
          <div className="pviz__group pl-run__actions">
            {ADD_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                className="pviz__btn"
                onClick={() => addTrials(value)}
              >
                Добавить {value}
              </button>
            ))}
            <button
              type="button"
              className="pviz__btn"
              disabled={extraN === 0}
              onClick={reset}
            >
              Сбросить
            </button>
          </div>

          <div className="pd-exp__stats">
            <div>
              Всего испытаний: <b className="pd-exp__stat-main">{totalN}</b>
            </div>
            <div>
              Событие произошло:{' '}
              <span className="pd-exp__stat-muted">{totalSuccesses} раз</span>
            </div>
            <div>
              Общая относительная частота:{' '}
              <span className="pd-exp__stat-muted">
                {formatDecimal(frequency, 3)}
              </span>
            </div>
          </div>

          {extraN > 0 && (
            <p className="pd-feedback">
              Общая частота постепенно приближается к 0,5. Но это происходит не
              потому, что вероятность каждого следующего события выросла: она
              по-прежнему 0,5. Старый дисбаланс просто составляет всё меньшую
              долю от общего числа наблюдений.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default GamblerFallacyExperiment
