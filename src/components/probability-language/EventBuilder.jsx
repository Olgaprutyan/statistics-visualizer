import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import TeX from '../proof/TeX'
import ChoiceQuestion from './ChoiceQuestion'

/*
 * §9.3. «Собери событие».
 * Учебная цель: показать, что событие состоит из одного или нескольких
 * исходов. Один переиспользуемый блок, два режима:
 *   1) условие → исходы (выбрать все подходящие исходы);
 *   2) исходы → опиши событие (выбрать верное описание набора).
 */

const OUTCOMES = [1, 2, 3, 4, 5, 6]

const BUILD_TASKS = [
  { condition: 'Результат не меньше 4', correct: [4, 5, 6] },
  { condition: 'Результат является нечётным', correct: [1, 3, 5] },
  { condition: 'Результат меньше 3', correct: [1, 2] },
]

const DESCRIBE_SET = [2, 4, 6]
const DESCRIBE_OPTIONS = [
  { text: 'Чётный результат', correct: true },
  { text: 'Результат больше 2', correct: false },
  { text: 'Нечётный результат', correct: false },
  { text: 'Результат не меньше 2', correct: false },
]

function sameSet(a, b) {
  if (a.length !== b.length) return false
  const sorted = [...b].sort((x, y) => x - y)
  return [...a].sort((x, y) => x - y).every((value, i) => value === sorted[i])
}

function formatSet(values) {
  return '\\{' + [...values].sort((x, y) => x - y).join(',') + '\\}'
}

function EventBuilder() {
  const [mode, setMode] = usePersistentState('pl.event.mode', 'build')
  const [taskIndex, setTaskIndex] = usePersistentState('pl.event.task', 0)
  const [selected, setSelected] = useState([])
  const [checked, setChecked] = useState(false)

  const task = BUILD_TASKS[taskIndex] ?? BUILD_TASKS[0]
  const isCorrect = sameSet(selected, task.correct)

  function toggle(value) {
    setChecked(false)
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )
  }

  function switchTask(index) {
    setTaskIndex(index)
    setSelected([])
    setChecked(false)
  }

  return (
    <div className="pd-exp">
      <div className="pviz__group" role="group" aria-label="Режим">
        <button
          type="button"
          className={
            'pviz__btn' + (mode === 'build' ? ' pviz__btn--active' : '')
          }
          aria-pressed={mode === 'build'}
          onClick={() => setMode('build')}
        >
          Условие → исходы
        </button>
        <button
          type="button"
          className={
            'pviz__btn' + (mode === 'describe' ? ' pviz__btn--active' : '')
          }
          aria-pressed={mode === 'describe'}
          onClick={() => setMode('describe')}
        >
          Исходы → опиши событие
        </button>
      </div>

      {mode === 'build' && (
        <>
          <div
            className="pviz__group pl-event__tasks"
            role="group"
            aria-label="Условие"
          >
            {BUILD_TASKS.map((item, index) => (
              <button
                key={item.condition}
                type="button"
                className={
                  'pviz__btn' +
                  (index === taskIndex ? ' pviz__btn--active' : '')
                }
                aria-pressed={index === taskIndex}
                onClick={() => switchTask(index)}
              >
                {item.condition}
              </button>
            ))}
          </div>

          <p className="pd-q">
            Выбери все исходы события: «{task.condition}»
          </p>

          <div
            className="pl-outcome-grid"
            role="group"
            aria-label="Исходы"
          >
            {OUTCOMES.map((value) => (
              <button
                key={value}
                type="button"
                className={
                  'pl-outcome-btn' +
                  (selected.includes(value) ? ' pl-outcome-btn--on' : '')
                }
                aria-pressed={selected.includes(value)}
                onClick={() => toggle(value)}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="pd-btn-row">
            <button
              type="button"
              className="pviz__btn"
              disabled={selected.length === 0}
              onClick={() => setChecked(true)}
            >
              Проверить
            </button>
          </div>

          {checked && (
            <>
              <p
                className={
                  'pd-verdict ' +
                  (isCorrect ? 'pd-verdict--ok' : 'pd-verdict--partial')
                }
              >
                {isCorrect
                  ? 'Верно! Событие собрано из нужных исходов.'
                  : 'Не совсем. Сравни выбранные исходы с условием.'}
              </p>
              {isCorrect && (
                <p className="pd-feedback">
                  Событию «{task.condition}» соответствует набор исходов{' '}
                  <TeX>{'A=' + formatSet(task.correct)}</TeX>. Событие — это
                  набор исходов, объединённых интересующим нас условием.
                </p>
              )}
            </>
          )}
        </>
      )}

      {mode === 'describe' && (
        <>
          <p className="pd-q">Выбран набор исходов:</p>
          <div className="pl-outcome-grid pl-outcome-grid--static">
            {OUTCOMES.map((value) => (
              <span
                key={value}
                className={
                  'pl-outcome-btn' +
                  (DESCRIBE_SET.includes(value)
                    ? ' pl-outcome-btn--fixed'
                    : ' pl-outcome-btn--muted')
                }
                aria-hidden={!DESCRIBE_SET.includes(value)}
              >
                {value}
              </span>
            ))}
          </div>
          <p className="pd-exp__hint">
            <TeX>{'A=' + formatSet(DESCRIBE_SET)}</TeX>
          </p>

          <ChoiceQuestion
            storageKey="pl.event.describe"
            question="Какое условие описывает это событие?"
            options={DESCRIBE_OPTIONS}
            correctFeedback="Все три исхода — чётные числа, и других чётных исходов в наборе нет. Поэтому событие описывается как «чётный результат»."
            neutralFeedback="Проверим, каким исходам соответствует каждое условие: событию должны точно соответствовать 2, 4 и 6."
          />
        </>
      )}
    </div>
  )
}

export default EventBuilder
