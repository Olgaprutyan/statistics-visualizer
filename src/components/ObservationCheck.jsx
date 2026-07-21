import { useState } from 'react'
import { usePersistentState } from '../usePersistentState'

/*
 * Три вопроса по наблюдениям за экспериментом.
 * Для каждого неправильно выбранного ответа
 * показывается короткое объяснение.
 */
const QUESTIONS = [
  {
    id: 'shape',
    title:
      'Что происходит с формой распределения выборочных средних при увеличении n?',
    options: [
      'Оно становится более симметричным и начинает напоминать колокол.',
      'Оно становится ещё более скошенным.',
      'Его форма почти не меняется.',
    ],
    correctIndex: 0,
    explanation:
      'Исходное распределение не меняется. Но среднее объединяет несколько наблюдений, поэтому распределение средних постепенно становится более симметричным.',
  },
  {
    id: 'spread',
    title: 'Что происходит с разбросом выборочных средних?',
    options: [
      'Средние располагаются плотнее друг к другу.',
      'Средние располагаются всё шире.',
      'Размер выборки не влияет на разброс средних.',
    ],
    correctIndex: 0,
    explanation:
      'Чем больше наблюдений входит в каждое среднее, тем слабее оно зависит от одного случайно большого или маленького значения. Поэтому средние различаются меньше.',
  },
  {
    id: 'center',
    title: 'Где находится центр распределения выборочных средних?',
    options: [
      'Примерно там же, где среднее исходного распределения.',
      'Он постоянно смещается вправо при увеличении n.',
      'Он определяется количеством повторений.',
    ],
    correctIndex: 0,
    explanation:
      'Размер выборки влияет на форму и разброс, но не должен систематически сдвигать среднее. Выборочные средние группируются вокруг среднего исходного распределения.',
  },
]

function ObservationCheck() {
  /*
   * answers[questionId] — индекс выбранного варианта
   * (может быть 0, поэтому проверяем на undefined, а не на «ложность»).
   */
  const [answers, setAnswers] = usePersistentState('observation.answers', {})
  const [isChecked, setIsChecked] = usePersistentState(
    'observation.checked',
    false,
  )
  const [showIncompleteHint, setShowIncompleteHint] = useState(false)

  const allAnswered = QUESTIONS.every(
    (question) => answers[question.id] !== undefined,
  )

  function handleSelect(questionId, optionIndex) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }))
  }

  function handleCheck() {
    if (!allAnswered) {
      setShowIncompleteHint(true)
      return
    }

    setShowIncompleteHint(false)
    setIsChecked(true)
  }

  return (
    <div className="observation-check">
      {QUESTIONS.map((question) => {
        const selectedIndex = answers[question.id]
        const isAnswered = selectedIndex !== undefined
        const isWrong =
          isChecked && isAnswered && selectedIndex !== question.correctIndex

        return (
          <fieldset className="quiz-question" key={question.id}>
            <legend>{question.title}</legend>

            <div className="quiz-options">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedIndex === optionIndex

                let optionClassName = 'quiz-option'

                if (isChecked && optionIndex === question.correctIndex) {
                  optionClassName += ' quiz-option--correct'
                } else if (isChecked && isSelected) {
                  optionClassName += ' quiz-option--wrong'
                } else if (isSelected) {
                  optionClassName += ' quiz-option--selected'
                }

                return (
                  <label className={optionClassName} key={option}>
                    <input
                      type="radio"
                      name={question.id}
                      checked={isSelected}
                      onChange={() =>
                        handleSelect(question.id, optionIndex)
                      }
                    />

                    <span>{option}</span>
                  </label>
                )
              })}
            </div>

            {isWrong && (
              <p className="quiz-explanation">{question.explanation}</p>
            )}
          </fieldset>
        )
      })}

      <div className="observation-check__actions">
        <button
          className="primary-button"
          type="button"
          onClick={handleCheck}
        >
          Проверить наблюдения
        </button>

        {showIncompleteHint && !allAnswered && (
          <p className="observation-check__hint" role="status">
            Ответь на все три вопроса, а затем проверь себя.
          </p>
        )}
      </div>

      {isChecked && (
        <div className="feedback-card">
          <h3>Две вещи происходят одновременно</h3>

          <p>
            При увеличении размера выборки распределение выборочных
            средних становится более похожим на нормальное.
          </p>

          <p>
            Одновременно оно становится уже: средние всё плотнее
            располагаются вокруг среднего исходного распределения.
          </p>

          <p>
            Это два разных результата. Форма распределения становится
            более нормальной, а разброс выборочных средних уменьшается.
          </p>

          <p className="key-point">
            Большая выборка не делает исходные данные нормальными.
            Нормальным становится распределение средних, вычисленных по
            множеству таких выборок.
          </p>
        </div>
      )}
    </div>
  )
}

export default ObservationCheck
