import { usePersistentState } from '../usePersistentState'

/*
 * «Давайте соберём всё, что мы уже открыли» — итог главы.
 * Не новая теория: блоки появляются по одному, каждая формула —
 * лишь краткая запись уже увиденной закономерности.
 */

const TOTAL_STAGES = 5

/* Путь колокола для маленьких иллюстраций. */
function bellPath(centerX, width, height, baseY) {
  const points = []

  for (let index = 0; index <= 36; index += 1) {
    const t = index / 36
    const x = centerX - width / 2 + t * width
    const z = (x - centerX) / (width * 0.19)
    const y = baseY - height * Math.exp(-0.5 * z * z)

    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
  }

  return `M ${points.join(' L ')}`
}

/* Иллюстрация 1: распределения с одинаковым центром. */
function CenterIllustration() {
  const centerX = 132
  const baseY = 92

  return (
    <svg
      className="sum-ill"
      viewBox="0 0 264 108"
      role="img"
      aria-label="Распределения средних с одинаковым центром"
    >
      <line
        className="sum-ill__axis"
        x1="14"
        x2="250"
        y1={baseY}
        y2={baseY}
      />
      <line
        className="sum-ill__mu"
        x1={centerX}
        x2={centerX}
        y1="8"
        y2={baseY}
      />
      <path
        className="sum-ill__curve sum-ill__curve--ghost"
        d={bellPath(centerX, 210, 42, baseY)}
      />
      <path
        className="sum-ill__curve"
        d={bellPath(centerX, 104, 74, baseY)}
      />
      <text className="sum-ill__mu-label" x={centerX} y="6" textAnchor="middle">
        μ
      </text>
    </svg>
  )
}

/* Иллюстрация 2: большой и маленький разброс. */
function SpreadIllustration() {
  const centerX = 132

  const wide = [-70, -48, -30, -14, 0, 12, 26, 44, 66]
  const narrow = [-16, -9, -4, 0, 3, 7, 12, -6, 5]

  return (
    <svg
      className="sum-ill"
      viewBox="0 0 264 108"
      role="img"
      aria-label="Большой и маленький разброс выборочных средних"
    >
      <line className="sum-ill__mu" x1={centerX} x2={centerX} y1="8" y2="100" />

      <line className="sum-ill__axis" x1="20" x2="244" y1="38" y2="38" />
      {wide.map((offset, index) => (
        <circle
          className="sum-ill__dot"
          key={`w-${index}`}
          cx={centerX + offset}
          cy="38"
          r="4"
        />
      ))}

      <line className="sum-ill__axis" x1="20" x2="244" y1="82" y2="82" />
      {narrow.map((offset, index) => (
        <circle
          className="sum-ill__dot"
          key={`n-${index}`}
          cx={centerX + offset}
          cy="82"
          r="4"
        />
      ))}

      <text className="sum-ill__row" x="20" y="26">
        n = 5
      </text>
      <text className="sum-ill__row" x="20" y="70">
        n = 50
      </text>
    </svg>
  )
}

/* Иллюстрация 3: скошенное превращается в колокол. */
function ShapeIllustration() {
  const skewed = [58, 40, 27, 18, 11, 7, 4, 2]
  const bell = [4, 12, 26, 40, 40, 26, 12, 4]
  const baseY = 88

  const bars = (values, offsetX) =>
    values.map((value, index) => (
      <rect
        className="sum-ill__bar"
        key={`${offsetX}-${index}`}
        x={offsetX + index * 11}
        y={baseY - value}
        width="8"
        height={value}
        rx="1"
      />
    ))

  return (
    <svg
      className="sum-ill"
      viewBox="0 0 264 108"
      role="img"
      aria-label="Скошенное распределение постепенно становится колоколом"
    >
      {bars(skewed, 20)}
      <text className="sum-ill__arrow" x="130" y="56" textAnchor="middle">
        →
      </text>
      {bars(bell, 150)}
    </svg>
  )
}

const APPLICATIONS = [
  {
    id: 'ci',
    title: 'Доверительный интервал',
    text: 'Мы знаем разброс возможных выборочных средних. Поэтому можем оценить, где находится истинное среднее генеральной совокупности.',
  },
  {
    id: 'test',
    title: 'Проверка гипотез',
    text: 'Мы знаем, какие выборочные средние возникают просто из-за случайности. Поэтому можем проверить, действительно ли наблюдаемое отличие выглядит необычным.',
  },
  {
    id: 'all',
    title: 'Практически вся классическая статистика',
    text: 'Регрессия, ANOVA, t-тесты и многие другие методы используют свойства распределения выборочных средних. Именно поэтому центральная предельная теорема считается одной из важнейших теорем статистики.',
  },
]

function SummaryGather() {
  const [revealed, setRevealed] = usePersistentState('summary.revealed', 1)

  function revealNext() {
    setRevealed((previous) => Math.min(previous + 1, TOTAL_STAGES))
  }

  const nextLabel =
    revealed === 3
      ? 'Почему это так важно?'
      : revealed === 4
        ? 'Главная мысль главы'
        : 'Показать следующее наблюдение'

  return (
    <div className="summary">
      <div className="summary-note">
        <span className="summary-note__icon" aria-hidden="true">
          ★
        </span>
        Мы не вводим ничего нового — просто записываем то, что уже
        увидели сами.
      </div>

      {/* Блок 1 */}
      <article className="summary-block">
        <div className="summary-noticed">
          <span className="summary-noticed__badge">1 · Мы заметили</span>
          <p>
            Центр распределения выборочных средних остаётся примерно на
            одном месте.
          </p>
        </div>

        <div className="summary-formula">
          <div className="formula formula--mechanism">E(X̄) = μ</div>
          <p>
            В среднем выборочные средние совпадают со средним генеральной
            совокупности.
          </p>
        </div>

        <div className="summary-illustration">
          <CenterIllustration />
        </div>
      </article>

      {/* Блок 2 */}
      {revealed >= 2 && (
        <article className="summary-block">
          <div className="summary-noticed">
            <span className="summary-noticed__badge">
              2 · Мы заметили
            </span>
            <p>
              При увеличении размера выборки выборочные средние становятся
              менее разбросанными.
            </p>
          </div>

          <div className="summary-formula">
            <div className="formula formula--mechanism">
              Var(X̄) ={' '}
              <span className="formula__fraction">
                <span className="formula__numerator">
                  σ<sup>2</sup>
                </span>
                <span className="formula__denominator">n</span>
              </span>
            </div>

            <div className="formula formula--mechanism formula--small">
              SE(X̄) ={' '}
              <span className="formula__fraction">
                <span className="formula__numerator">σ</span>
                <span className="formula__denominator">√n</span>
              </span>
            </div>

            <p>
              Именно поэтому большие выборки дают более устойчивые оценки
              среднего.
            </p>
          </div>

          <div className="summary-illustration">
            <SpreadIllustration />
          </div>
        </article>
      )}

      {/* Блок 3 */}
      {revealed >= 3 && (
        <article className="summary-block summary-block--wide">
          <div className="summary-noticed">
            <span className="summary-noticed__badge">
              3 · Мы заметили
            </span>
            <p>
              Распределение выборочных средних постепенно становится
              похожим на колокол.
            </p>
          </div>

          <div className="summary-formula">
            <p className="summary-human">
              Если выборка достаточно большая, распределение выборочных
              средних становится близким к нормальному независимо от формы
              исходного распределения.
            </p>

            <div className="summary-textbook">
              <span className="summary-textbook__label">
                Так это обычно записывают в учебниках
              </span>

              <div className="formula formula--mechanism formula--small">
                <span className="formula__fraction">
                  <span className="formula__numerator">X̄ − μ</span>
                  <span className="formula__denominator">σ / √n</span>
                </span>
                {'  ⇒  '}
                N(0, 1)
              </div>
            </div>
          </div>

          <div className="summary-illustration">
            <ShapeIllustration />
          </div>
        </article>
      )}

      {/* Почему это важно + применения */}
      {revealed >= 4 && (
        <div className="summary-importance">
          <div className="summary-why">
            <h3>Почему это так важно?</h3>

            <p>
              Всё началось с простого вопроса: можно ли доверять одному
              выборочному среднему? Теперь мы знаем ответ. Мы понимаем,
              как могут меняться выборочные средние при повторении
              исследования. Именно поэтому можно оценивать точность наших
              выводов.
            </p>
          </div>

          <div className="summary-apps">
            {APPLICATIONS.map((app) => (
              <article className="summary-app" key={app.id}>
                <h4>{app.title}</h4>
                <p>{app.text}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Главная мысль главы */}
      {revealed >= 5 && (
        <>
          <div className="summary-final">
            <h3>Главная мысль главы</h3>

            <p>
              Мы не учили центральную предельную теорему «наизусть». Мы
              постепенно открыли её сами с помощью экспериментов.
            </p>

            <p>
              Формулы, которые мы только что записали, — это не новая
              информация. Это краткая запись закономерностей, которые мы
              уже увидели своими глазами.
            </p>
          </div>

          <p className="section-transition">
            Мы собрали все ключевые идеи. Теперь можно сформулировать их
            строго и доказать.
          </p>
        </>
      )}

      {revealed < TOTAL_STAGES && (
        <div className="summary-actions">
          <button
            className="primary-button"
            type="button"
            onClick={revealNext}
          >
            {nextLabel} →
          </button>
        </div>
      )}
    </div>
  )
}

export default SummaryGather
