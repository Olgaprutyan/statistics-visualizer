import { usePersistentState } from '../usePersistentState'
import MomentsProof from './MomentsProof'
import CharFuncProof from './CharFuncProof'
import LindebergProof from './LindebergProof'
import MomentsIntuition from './MomentsIntuition'
import CharFuncIntuition from './CharFuncIntuition'
import LindebergIntuition from './LindebergIntuition'
import IdeaProof from './proof/IdeaProof'

/*
 * Для путей с полным строгим доказательством (моменты, характеристические
 * функции, Линдеберг) показываем две вкладки: сначала интуиция, затем
 * строгая математика.
 */
const PROOF_VIEWS = {
  moments: {
    heading: 'Через моменты',
    Intuition: MomentsIntuition,
    Rigorous: MomentsProof,
  },
  char: {
    heading: 'Через характеристические функции',
    Intuition: CharFuncIntuition,
    Rigorous: CharFuncProof,
  },
  lindeberg: {
    heading: 'Теорема Линдеберга–Феллера',
    Intuition: LindebergIntuition,
    Rigorous: LindebergProof,
  },
}

/*
 * «Почему это действительно работает?» — факультативное углубление.
 * Не учит доказывать ЦПТ, а показывает логику строгого доказательства
 * и объясняет, зачем оно нужно. Раздел необязателен: открывается по
 * желанию и не входит в основной курс.
 */

const STEP_LABELS = [
  'Зачем доказывать',
  'Что доказать',
  'Что уже знаем',
  'Идея доказательства',
  'Виды доказательств',
  'Почему их много',
  'Итог',
]

const REMINDERS = [
  { id: 'exp', label: 'Экспоненциальное', heights: [30, 22, 15, 10, 6, 4, 2] },
  { id: 'uni', label: 'Равномерное', heights: [16, 16, 16, 16, 16, 16, 16] },
  { id: 'logn', label: 'Логнормальное', heights: [8, 26, 20, 13, 8, 5, 3] },
  { id: 'disc', label: 'Дискретное', heights: [26, 0, 20, 0, 30, 0, 12] },
]

const PROVE_OPTIONS = [
  {
    id: 'mean',
    text: 'Среднее выборочных средних равно среднему генеральной совокупности.',
    correct: false,
  },
  {
    id: 'var',
    text: 'Дисперсия уменьшается как 1/n.',
    correct: false,
  },
  {
    id: 'clt',
    text: 'Стандартизированное выборочное среднее стремится к нормальному распределению.',
    correct: true,
  },
  {
    id: 'source',
    text: 'Исходное распределение становится нормальным.',
    correct: false,
  },
]

const IDEA_STEPS = [
  {
    title: 'Независимые наблюдения',
    text: 'Мы берём наблюдения, которые не влияют друг на друга.',
  },
  {
    title: 'Сумма наблюдений',
    text: 'Складываем их — именно сумма, а значит и среднее, нас интересует.',
  },
  {
    title: 'Вычитаем среднее',
    text: 'Чтобы сравнивать разные распределения, удобно сначала сдвинуть их так, чтобы центр оказался в нуле.',
  },
  {
    title: 'Нормируем разброс',
    text: 'При увеличении размера выборки разброс уменьшается. Чтобы сравнение оставалось корректным, нужно привести распределения к одному масштабу.',
  },
  {
    title: 'Изучаем поведение при n → ∞',
    text: 'Смотрим, что происходит с распределением суммы, когда наблюдений становится очень много.',
  },
  {
    title: 'Получаем нормальное распределение',
    text: 'В пределе форма всегда одна и та же — нормальная, независимо от исходного распределения.',
  },
]

const PROOFS = [
  {
    id: 'idea',
    badge: '🟢',
    level: 'Простой',
    title: 'Только идея',
    text: 'Для тех, кто хочет понять общую логику. Без технических деталей.',
    tool: 'наглядные рассуждения без строгих выкладок',
  },
  {
    id: 'moments',
    badge: '🟡',
    level: 'Средний',
    title: 'Через моменты',
    text: 'Используется в некоторых специальных случаях. Подходит после первого курса теории вероятностей.',
    tool: 'метод моментов',
  },
  {
    id: 'char',
    badge: '🔴',
    level: 'Сложный',
    title: 'Через характеристические функции',
    text: 'Классическое строгое доказательство. Требует знания анализа и теории вероятностей.',
    tool: 'характеристические функции',
  },
  {
    id: 'lindeberg',
    badge: '🔴',
    level: 'Сложный',
    title: 'Через условие Линдеберга',
    text: 'Более общий вариант центральной предельной теоремы. Используется в современных курсах вероятности.',
    tool: 'условие Линдеберга',
  },
]

const FURTHER = [
  { id: 'char', icon: '📘', text: 'Доказательство через характеристические функции.' },
  { id: 'lind', icon: '📗', text: 'Доказательство Линдеберга.' },
  { id: 'lyap', icon: '📙', text: 'Доказательство Ляпунова.' },
  { id: 'lit', icon: '🎓', text: 'Дополнительная литература.' },
]

function MiniBars({ heights }) {
  const width = 96
  const height = 40
  const slot = width / heights.length
  const barWidth = Math.max(slot - 2, 1)
  const max = Math.max(...heights, 1)

  return (
    <svg
      className="wiw-mini"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {heights.map((value, index) => {
        const barHeight = (value / max) * (height - 4)

        return (
          <rect
            key={index}
            x={index * slot + 1}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx="1"
          />
        )
      })}
    </svg>
  )
}

function WhyItWorks() {
  const [opened, setOpened] = usePersistentState('wiw.opened', false)
  const [step, setStep] = usePersistentState('wiw.step', 0)

  const [enoughAnswer, setEnoughAnswer] = usePersistentState(
    'wiw.enough',
    null,
  )
  const [proveChoice, setProveChoice] = usePersistentState(
    'wiw.proveChoice',
    null,
  )
  const [proveChecked, setProveChecked] = usePersistentState(
    'wiw.proveChecked',
    false,
  )
  const [selectedProof, setSelectedProof] = usePersistentState(
    'wiw.proof',
    null,
  )
  const [proofOpen, setProofOpen] = usePersistentState('wiw.proofOpen', {
    intuition: true,
    rigorous: false,
  })
  const toggleProofBlock = (key) =>
    setProofOpen((previous) => ({ ...previous, [key]: !previous[key] }))
  const [openMap, setOpenMap] = usePersistentState('wiw.open', {})

  const isOpen = (id) => Boolean(openMap[id])
  const handleToggle = (id, open) =>
    setOpenMap((previous) => ({ ...previous, [id]: open }))

  if (!opened) {
    return (
      <div className="wiw-intro">
        <p>
          Это необязательный раздел для тех, кому интересна
          математическая сторона центральной предельной теоремы. Изучение
          ЦПТ можно считать завершённым и без него.
        </p>

        <button
          className="primary-button"
          type="button"
          onClick={() => setOpened(true)}
        >
          Открыть углубление →
        </button>
      </div>
    )
  }

  const totalSteps = STEP_LABELS.length
  const chosenProof = PROOFS.find((proof) => proof.id === selectedProof)

  return (
    <div className="wiw">
      <div className="wiw-progress">
        <ol className="wiw-progress__list">
          {STEP_LABELS.map((label, index) => (
            <li
              className={
                index === step
                  ? 'wiw-progress__item wiw-progress__item--active'
                  : index < step
                    ? 'wiw-progress__item wiw-progress__item--done'
                    : 'wiw-progress__item'
              }
              key={label}
            >
              <button
                type="button"
                className="wiw-progress__step"
                aria-current={index === step ? 'step' : undefined}
                onClick={() => setStep(index)}
              >
                <span className="wiw-progress__dot">
                  {index < step ? '✓' : index + 1}
                </span>
                <span className="wiw-progress__label">{label}</span>
              </button>
            </li>
          ))}
        </ol>

        <button
          className="wiw-collapse"
          type="button"
          onClick={() => setOpened(false)}
        >
          Свернуть
        </button>
      </div>

      <div className="wiw-screen">
        {step === 0 && (
          <div className="wiw-block">
            <h3>Разве экспериментов недостаточно?</h3>

            <p className="wiw-lead">Мы уже проверили:</p>

            <div className="wiw-reminders">
              {REMINDERS.map((item) => (
                <div className="wiw-reminder" key={item.id}>
                  <MiniBars heights={item.heights} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <p className="wiw-question">
              Значит ли это, что центральная предельная теорема доказана?
            </p>

            <div className="wiw-choice">
              <label>
                <input
                  type="radio"
                  name="wiw-enough"
                  checked={enoughAnswer === 'yes'}
                  onChange={() => setEnoughAnswer('yes')}
                />
                <span>Да</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="wiw-enough"
                  checked={enoughAnswer === 'no'}
                  onChange={() => setEnoughAnswer('no')}
                />
                <span>Нет</span>
              </label>
            </div>

            {enoughAnswer && (
              <div className="wiw-note">
                <p>
                  Эксперимент может проверить только конечное число
                  примеров. Но существует бесконечно много распределений.
                </p>
                <p>
                  Доказательство должно показать, что результат
                  выполняется для любого распределения, удовлетворяющего
                  условиям теоремы.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="wiw-block">
            <h3>Что именно нужно доказать?</h3>

            <p className="wiw-lead">
              Выбери, какое из утверждений является содержанием
              центральной предельной теоремы.
            </p>

            <div className="wiw-choice wiw-choice--column">
              {PROVE_OPTIONS.map((option, index) => (
                <label
                  className={
                    proveChecked && option.correct
                      ? 'wiw-option wiw-option--correct'
                      : proveChecked &&
                          proveChoice === index &&
                          !option.correct
                        ? 'wiw-option wiw-option--wrong'
                        : 'wiw-option'
                  }
                  key={option.id}
                >
                  <input
                    type="radio"
                    name="wiw-prove"
                    checked={proveChoice === index}
                    onChange={() => {
                      setProveChoice(index)
                      setProveChecked(false)
                    }}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={() => setProveChecked(true)}
              disabled={proveChoice === null}
            >
              Проверить
            </button>

            {proveChecked && (
              <div className="wiw-note">
                <p>
                  Первые два свойства можно доказать сравнительно просто.
                  А центральная предельная теорема посвящена именно
                  последнему: стандартизированное выборочное среднее
                  стремится к нормальному распределению.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="wiw-block">
            <h3>Что мы уже знаем?</h3>

            <div className="wiw-flow">
              <div className="wiw-flow__item wiw-flow__item--done">
                <span className="wiw-flow__mark">✓</span>
                Центр сохраняется
              </div>
              <span className="wiw-flow__arrow">→</span>
              <div className="wiw-flow__item wiw-flow__item--done">
                <span className="wiw-flow__mark">✓</span>
                Разброс уменьшается
              </div>
              <span className="wiw-flow__arrow">→</span>
              <div className="wiw-flow__item wiw-flow__item--open">
                <span className="wiw-flow__mark">?</span>
                Почему появляется нормальное распределение?
              </div>
            </div>

            <p className="wiw-note-inline">
              Именно этот последний шаг и требует настоящего
              математического доказательства.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="wiw-block">
            <h3>Общая идея доказательства</h3>

            <p className="wiw-lead">
              Раскрывай шаги по одному — за каждым короткое объяснение
              человеческим языком.
            </p>

            <div className="wiw-steps">
              {IDEA_STEPS.map((ideaStep, index) => (
                <details
                  className="wiw-expand"
                  key={ideaStep.title}
                  open={isOpen(`idea-${index}`)}
                  onToggle={(event) =>
                    handleToggle(`idea-${index}`, event.target.open)
                  }
                >
                  <summary>
                    <span className="wiw-expand__index">{index + 1}</span>
                    {ideaStep.title}
                  </summary>
                  <p>{ideaStep.text}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="wiw-block">
            <h3>Как выглядит настоящее доказательство?</h3>

            <p className="wiw-lead">
              Выбери путь — откроется только он.
            </p>

            <div className="wiw-proofs">
              {PROOFS.map((proof) => (
                <button
                  className={
                    selectedProof === proof.id
                      ? 'wiw-proof wiw-proof--active'
                      : 'wiw-proof'
                  }
                  type="button"
                  key={proof.id}
                  onClick={() => setSelectedProof(proof.id)}
                >
                  <span
                    className="wiw-proof__badge"
                    aria-label={`Уровень сложности: ${proof.level}`}
                  >
                    <span className="wiw-proof__dot" aria-hidden="true">
                      {proof.badge}
                    </span>
                    {proof.level}
                  </span>
                  <strong>{proof.title}</strong>
                  <span className="wiw-proof__text">{proof.text}</span>
                </button>
              ))}
            </div>

            {chosenProof && PROOF_VIEWS[chosenProof.id] && (
              <div className="wiw-route">
                <button
                  type="button"
                  className="wiw-backpath"
                  onClick={() => setSelectedProof(null)}
                >
                  ← К выбору пути
                </button>

                <h4>{PROOF_VIEWS[chosenProof.id].heading}</h4>

                <div className="wiw-accordion">
                  <div
                    className={
                      'wiw-acc' +
                      (proofOpen.intuition ? ' wiw-acc--open' : '')
                    }
                  >
                    <button
                      type="button"
                      className="wiw-acc__head"
                      aria-expanded={proofOpen.intuition}
                      onClick={() => toggleProofBlock('intuition')}
                    >
                      <span className="wiw-acc__title">
                        <span className="wiw-acc__badge">Интуиция</span>
                        Как это работает «на пальцах»
                      </span>
                      <span className="wiw-acc__chevron" aria-hidden="true">
                        {proofOpen.intuition ? '▾' : '▸'}
                      </span>
                    </button>

                    {proofOpen.intuition &&
                      (() => {
                        const Intuition =
                          PROOF_VIEWS[chosenProof.id].Intuition
                        return (
                          <div className="wiw-acc__body">
                            <Intuition />
                          </div>
                        )
                      })()}
                  </div>

                  <div
                    className={
                      'wiw-acc' +
                      (proofOpen.rigorous ? ' wiw-acc--open' : '')
                    }
                  >
                    <button
                      type="button"
                      className="wiw-acc__head"
                      aria-expanded={proofOpen.rigorous}
                      onClick={() => toggleProofBlock('rigorous')}
                    >
                      <span className="wiw-acc__title">
                        <span className="wiw-acc__badge wiw-acc__badge--rigorous">
                          Строгая математика
                        </span>
                        Полное доказательство с выкладками
                      </span>
                      <span className="wiw-acc__chevron" aria-hidden="true">
                        {proofOpen.rigorous ? '▾' : '▸'}
                      </span>
                    </button>

                    {proofOpen.rigorous &&
                      (() => {
                        const Rigorous =
                          PROOF_VIEWS[chosenProof.id].Rigorous
                        return (
                          <div className="wiw-acc__body">
                            <Rigorous />
                          </div>
                        )
                      })()}
                  </div>
                </div>
              </div>
            )}

            {chosenProof && chosenProof.id === 'idea' && (
              <div className="wiw-route">
                <button
                  type="button"
                  className="wiw-backpath"
                  onClick={() => setSelectedProof(null)}
                >
                  ← К выбору пути
                </button>

                <IdeaProof onSelectProof={(id) => setSelectedProof(id)} />
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="wiw-block">
            <h3>Почему существуют разные доказательства?</h3>

            <p className="wiw-lead">
              У центральной предельной теоремы десятки различных
              доказательств. Они используют разные математические
              инструменты и подходят для разных условий.
            </p>

            <p className="wiw-note-inline">
              Это не значит, что существует несколько разных теорем. Одну
              и ту же идею можно обосновать разными способами.
            </p>

            <div className="wiw-tree">
              <div className="wiw-tree__root">
                Центральная предельная теорема
              </div>

              <ul className="wiw-tree__branches">
                <li>Характеристические функции</li>
                <li>Моменты</li>
                <li>Условие Линдеберга</li>
                <li>Условие Ляпунова</li>
                <li>Другие методы</li>
              </ul>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="wiw-block">
            <div className="wiw-takeaway">
              <h3>Что важно запомнить?</h3>

              <p>
                Мы использовали эксперименты, чтобы понять центральную
                предельную теорему. Математическое доказательство нужно не
                для того, чтобы заменить эту интуицию.
              </p>

              <p>
                Оно показывает, что увиденные нами закономерности
                действительно выполняются не только в нескольких
                симуляциях, а для огромного класса случайных величин.
              </p>
            </div>

            <div className="wiw-further">
              <h4>
                Если тебе интересно изучить доказательство полностью
              </h4>

              <ul>
                {FURTHER.map((item) => (
                  <li key={item.id}>
                    <span aria-hidden="true">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>

              <p className="wiw-further__note">
                Эти материалы открываются отдельно и не являются частью
                основного курса.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="wiw-nav">
        <button
          className="secondary-button"
          type="button"
          onClick={() => setStep((value) => Math.max(value - 1, 0))}
          disabled={step === 0}
        >
          ← Назад
        </button>

        <span className="wiw-nav__counter">
          {step + 1} / {totalSteps}
        </span>

        {step < totalSteps - 1 ? (
          <button
            className="primary-button"
            type="button"
            onClick={() =>
              setStep((value) => Math.min(value + 1, totalSteps - 1))
            }
          >
            Далее →
          </button>
        ) : (
          <button
            className="secondary-button"
            type="button"
            onClick={() => setOpened(false)}
          >
            Завершить углубление
          </button>
        )}
      </div>
    </div>
  )
}

export default WhyItWorks
