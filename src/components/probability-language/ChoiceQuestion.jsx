import { usePersistentState } from '../../usePersistentState'

/*
 * Переиспользуемый блок вопроса с единственным выбором.
 * Ответ сохраняется в localStorage по ключу storageKey.
 *
 * options: массив { text, correct }.
 * correctFeedback — пояснение после верного ответа.
 * neutralFeedback — нейтральный переход после неверного ответа
 *   (по §7 ТЗ мы не пишем, что студент «ошибся»). Если не задан,
 *   используется correctFeedback для любого ответа.
 * label — необязательная подпись («Задание 1» и т. п.).
 */
function ChoiceQuestion({
  storageKey,
  label,
  question,
  options,
  correctFeedback,
  neutralFeedback,
}) {
  const [choice, setChoice] = usePersistentState(storageKey, null)

  const answered = choice !== null
  const isCorrect = answered && options[choice]?.correct

  return (
    <div className="pl-question">
      {label && <p className="pd-q pl-question__label">{label}</p>}

      <p className="pd-q">{question}</p>

      <div className="pd-options">
        {options.map((option, index) => {
          let className = 'pd-option'

          if (choice === index) {
            className += ' pd-option--selected'
          }

          if (answered) {
            if (option.correct) {
              className += ' pd-option--correct'
            } else if (choice === index) {
              className += ' pd-option--wrong'
            }
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

      {answered && (correctFeedback || neutralFeedback) && (
        <p className="pd-feedback">
          {isCorrect || !neutralFeedback ? correctFeedback : neutralFeedback}
        </p>
      )}
    </div>
  )
}

export default ChoiceQuestion
