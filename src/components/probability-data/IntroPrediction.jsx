import { usePersistentState } from '../../usePersistentState'

const OPTIONS = [
  'Ровно 72',
  'Скорее всего, близко к 72, но не обязательно равно',
  'Любое значение одинаково вероятно',
  'Невозможно сказать вообще ничего',
]

const CORRECT = 1

function IntroPrediction() {
  const [choice, setChoice] = usePersistentState('pd.intro.choice', null)

  const answered = choice !== null

  return (
    <div className="pd-exp">
      <p className="pd-q">Как ты думаешь?</p>
      <p className="pd-exp__hint">
        Исследователь случайно выбрал 30 студентов и получил средний результат
        теста 72 балла. Затем он независимо выбрал ещё 30 студентов из той же
        совокупности. Каким окажется новое среднее?
      </p>

      <div className="pd-options">
        {OPTIONS.map((label, index) => {
          let className = 'pd-option'

          if (choice === index) {
            className += ' pd-option--selected'
          }

          if (answered) {
            if (index === CORRECT) {
              className += ' pd-option--correct'
            } else if (choice === index) {
              className += ' pd-option--wrong'
            }
          }

          return (
            <button
              key={label}
              type="button"
              className={className}
              aria-pressed={choice === index}
              onClick={() => setChoice(index)}
            >
              {label}
            </button>
          )
        })}
      </div>

      {answered && (
        <p className="pd-feedback">
          {choice === CORRECT
            ? 'Обе выборки взяты из одной совокупности, поэтому их средние связаны с одной и той же характеристикой совокупности. Но состав выборок различается, поэтому результаты не обязаны совпадать.'
            : 'Проверим это с помощью повторного отбора выборок.'}
        </p>
      )}
    </div>
  )
}

export default IntroPrediction
