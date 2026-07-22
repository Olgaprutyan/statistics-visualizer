import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import TeX from '../proof/TeX'

/*
 * Проверочные задания к разделу «Вероятность и данные».
 * Ответы сохраняются в localStorage, поэтому прогресс не сбрасывается
 * при перезагрузке страницы.
 */

const EX1_OPTIONS = [
  { id: 'a', text: 'Да, обязательно' },
  {
    id: 'b',
    text: 'Нет, но обычно они связаны с одной характеристикой совокупности',
  },
  { id: 'c', text: 'Нет, и между ними нет никакой связи' },
]

const EX2_OPTIONS = [
  {
    id: 'size',
    text: 'Размер выборки, если исследователь уже его задал',
    correct: false,
  },
  {
    id: 'observations',
    text: 'Наблюдения, которые попадут в выборку',
    correct: true,
  },
  {
    id: 'mean',
    text: 'Значение выборочного среднего',
    correct: true,
  },
  { id: 'formula', text: 'Формула среднего', correct: false },
]

const EX3_OPTIONS = [
  { id: 'yes', text: 'Да' },
  { id: 'no', text: 'Нет, теперь это наблюдаемые значения' },
]

const EX4_OPTIONS = [
  { id: 'population-mean', text: 'Среднее генеральной совокупности' },
  { id: 'variability', text: 'Выборочная изменчивость среднего' },
  { id: 'values', text: 'Значение каждого наблюдения' },
  { id: 'possible-values', text: 'Число возможных значений признака' },
]

const EX5_OPTIONS = [
  { id: 'true', text: 'Верно' },
  { id: 'false', text: 'Неверно' },
]

function optionClassName(selected, answered, isCorrect) {
  return (
    'pd-option' +
    (selected ? ' pd-option--selected' : '') +
    (answered && isCorrect ? ' pd-option--correct' : '') +
    (answered && selected && !isCorrect ? ' pd-option--wrong' : '')
  )
}

function checkboxStatus(selected, answered, isCorrect) {
  if (!answered) return null
  if (isCorrect && selected) return 'ok'
  if (!isCorrect && selected) return 'wrong'
  if (isCorrect && !selected) return 'missed'
  return null
}

function checkboxClassName(selected, answered, isCorrect) {
  const status = checkboxStatus(selected, answered, isCorrect)
  return (
    'pd-checkbox' +
    (!answered && selected ? ' pd-checkbox--selected' : '') +
    (status === 'ok' ? ' pd-checkbox--correct' : '') +
    (status === 'wrong' ? ' pd-checkbox--wrong' : '') +
    (status === 'missed' ? ' pd-checkbox--missed' : '')
  )
}

function CheckboxTag({ status }) {
  if (status === 'ok') {
    return (
      <span className="pd-checkbox__tag pd-checkbox__tag--ok">✓ верно</span>
    )
  }
  if (status === 'wrong') {
    return (
      <span className="pd-checkbox__tag pd-checkbox__tag--wrong">
        ✗ лишнее
      </span>
    )
  }
  if (status === 'missed') {
    return (
      <span className="pd-checkbox__tag pd-checkbox__tag--missed">
        нужно было отметить
      </span>
    )
  }
  return null
}

function toggleId(ids, id) {
  return ids.includes(id)
    ? ids.filter((currentId) => currentId !== id)
    : [...ids, id]
}

function ProbabilityDataExercises() {
  const [ex1, setEx1] = usePersistentState('pd.ex1', null)
  const [ex2, setEx2] = usePersistentState('pd.ex2', [])
  const [ex2Checked, setEx2Checked] = useState(false)
  const [ex3, setEx3] = usePersistentState('pd.ex3', null)
  const [ex4, setEx4] = usePersistentState('pd.ex4', null)
  const [ex5, setEx5] = usePersistentState('pd.ex5', null)
  const [ex6, setEx6] = usePersistentState('pd.ex6', '')
  const [ex6Revealed, setEx6Revealed] = useState(false)

  const ex2AllCorrect = EX2_OPTIONS.every(
    (opt) => opt.correct === ex2.includes(opt.id),
  )

  return (
    <div className="pd-exercises">
      <div className="pd-exp">
        <p className="pd-q">Задание 1</p>
        <p className="pd-q">
          Две независимые выборки по 50 наблюдений взяты из одной совокупности.
          Должны ли их средние совпасть?
        </p>
        <div className="pd-options">
          {EX1_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={optionClassName(
                ex1 === opt.id,
                ex1 !== null,
                opt.id === 'b',
              )}
              onClick={() => setEx1(opt.id)}
            >
              {opt.text}
            </button>
          ))}
        </div>
        {ex1 !== null && (
          <p className="pd-feedback">
            Нет, но обычно они связаны с одной характеристикой совокупности.
          </p>
        )}
      </div>

      <div className="pd-exp">
        <p className="pd-q">Задание 2</p>
        <p className="pd-q">
          Что из перечисленного является случайным до сбора выборки?
        </p>
        <div className="pd-checkbox-list">
          {EX2_OPTIONS.map((opt) => {
            const selected = ex2.includes(opt.id)

            return (
              <label
                className={checkboxClassName(selected, ex2Checked, opt.correct)}
                key={opt.id}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    setEx2((ids) => toggleId(ids, opt.id))
                    setEx2Checked(false)
                  }}
                />
                <span>{opt.text}</span>
                <CheckboxTag
                  status={checkboxStatus(selected, ex2Checked, opt.correct)}
                />
              </label>
            )
          })}
        </div>
        <div className="pd-btn-row">
          <button
            type="button"
            className="pviz__btn"
            onClick={() => setEx2Checked(true)}
          >
            Проверить
          </button>
        </div>
        {ex2Checked && (
          <>
            <p
              className={
                'pd-verdict ' +
                (ex2AllCorrect ? 'pd-verdict--ok' : 'pd-verdict--partial')
              }
            >
              {ex2AllCorrect
                ? 'Верно!'
                : 'Не совсем. Зелёным помечено верно, красным — лишнее, «нужно было отметить» — пропущенное.'}
            </p>
            <p className="pd-feedback">
              До сбора выборки неизвестны наблюдения, которые попадут в
              выборку, и значение выборочного среднего. Заданный размер
              выборки и формула среднего уже известны.
            </p>
          </>
        )}
      </div>

      <div className="pd-exp">
        <p className="pd-q">Задание 3</p>
        <p className="pd-q">
          После сбора данных исследователь получил значения{' '}
          <TeX>{'x_1, \\ldots, x_n'}</TeX>. Являются ли они всё ещё
          неизвестным случайным результатом?
        </p>
        <div className="pd-options">
          {EX3_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={optionClassName(
                ex3 === opt.id,
                ex3 !== null,
                opt.id === 'no',
              )}
              onClick={() => setEx3(opt.id)}
            >
              {opt.text}
            </button>
          ))}
        </div>
        {ex3 !== null && (
          <p className="pd-feedback">
            При повторении процедуры могли бы возникнуть другие значения, но
            уже полученная выборка зафиксирована.
          </p>
        )}
      </div>

      <div className="pd-exp">
        <p className="pd-q">Задание 4</p>
        <p className="pd-q">
          Исследователь увеличил выборку с 20 до 200 наблюдений. Что при прочих
          равных обычно уменьшается?
        </p>
        <div className="pd-options">
          {EX4_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={optionClassName(
                ex4 === opt.id,
                ex4 !== null,
                opt.id === 'variability',
              )}
              onClick={() => setEx4(opt.id)}
            >
              {opt.text}
            </button>
          ))}
        </div>
        {ex4 !== null && (
          <p className="pd-feedback">
            При прочих равных обычно уменьшается выборочная изменчивость
            среднего.
          </p>
        )}
      </div>

      <div className="pd-exp">
        <p className="pd-q">Задание 5</p>
        <p className="pd-q">
          Верно или неверно: если результаты двух выборок различаются, одна из
          них обязательно собрана неправильно.
        </p>
        <div className="pd-options">
          {EX5_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={optionClassName(
                ex5 === opt.id,
                ex5 !== null,
                opt.id === 'false',
              )}
              onClick={() => setEx5(opt.id)}
            >
              {opt.text}
            </button>
          ))}
        </div>
        {ex5 !== null && (
          <p className="pd-feedback">
            Даже при одной и той же корректной процедуре разные выборки обычно
            содержат разные наблюдения.
          </p>
        )}
      </div>

      <div className="pd-exp">
        <p className="pd-q">Задание 6</p>
        <p className="pd-q">
          Объясни различие между <TeX>{'\\bar X'}</TeX> и{' '}
          <TeX>{'\\bar x'}</TeX>.
        </p>
        <textarea
          className="pd-textarea"
          value={ex6}
          onChange={(e) => setEx6(e.target.value)}
          rows={4}
          placeholder="Напиши короткое объяснение"
        />
        <div className="pd-btn-row">
          <button
            type="button"
            className="pviz__btn"
            onClick={() => setEx6Revealed(true)}
          >
            Сравнить с объяснением
          </button>
        </div>
        {ex6Revealed && (
          <p className="pd-feedback">
            <TeX>{'\\bar X'}</TeX> — случайное выборочное среднее до сбора
            данных. <TeX>{'\\bar x'}</TeX> — конкретное значение среднего,
            рассчитанное по уже полученной выборке.
          </p>
        )}
      </div>
    </div>
  )
}

export default ProbabilityDataExercises
