import { usePersistentState } from '../usePersistentState'

const OPTIONS = [
  'Распределение почти не изменится.',
  'Оно станет более широким.',
  'Оно станет более узким и будет всё больше похоже на колокол.',
  'Пока не знаю.',
]

function PredictionCard() {
  const [choice, setChoice] = usePersistentState('prediction.choice', null)

  return (
    <div className="prediction-card">
      <p className="prediction-card__label">
        Перед тем как нажать «Запустить»…
      </p>

      <p>
        Попробуй сделать небольшое предположение. Как ты думаешь, что
        произойдёт, если постепенно увеличивать размер выборки?
      </p>

      <form className="prediction-card__options">
        {OPTIONS.map((option, index) => (
          <label key={option}>
            <input
              type="radio"
              name="clt-prediction"
              checked={choice === index}
              onChange={() => setChoice(index)}
            />
            <span>{option}</span>
          </label>
        ))}
      </form>

      <p className="prediction-card__note">
        Пока ответ можно никак не проверять. Этот вопрос нужен, чтобы
        потом сравнить ожидание с тем, что получится в эксперименте.
      </p>
    </div>
  )
}

export default PredictionCard
