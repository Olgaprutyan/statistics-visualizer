import TeX from './TeX'

/*
 * Путь «Только идея» — короткое интуитивное объяснение механизма ЦПТ
 * без характеристических функций, моментов и технических деталей.
 * Это не строгое доказательство, а интуиция; строгие пути открываются
 * кнопками внизу через onSelectProof.
 */

/* Маленькая иллюстративная гистограмма (схема, не точный график). */
function MiniDist({ heights, label, ariaLabel }) {
  const width = 120
  const height = 64
  const slot = width / heights.length
  const barWidth = Math.max(slot - 3, 2)
  const max = Math.max(...heights, 1)

  return (
    <div className="idea-seq__item">
      <svg
        className="idea-mini"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
      >
        <line
          x1="0"
          y1={height - 1}
          x2={width}
          y2={height - 1}
          className="idea-mini__axis"
        />
        {heights.map((value, index) => {
          const barHeight = (value / max) * (height - 6)
          return (
            <rect
              key={index}
              x={index * slot + 1.5}
              y={height - 1 - barHeight}
              width={barWidth}
              height={barHeight}
              rx="1"
              className="idea-mini__bar"
            />
          )
        })}
      </svg>
      <span className="idea-seq__label">{label}</span>
    </div>
  )
}

/* Колоколообразная кривая как SVG-путь (иллюстрация нормальной формы). */
function MiniBell() {
  const width = 120
  const height = 64
  const points = []
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * width
    const t = (i / 40) * 6 - 3
    const y = height - 4 - Math.exp(-(t * t) / 2) * (height - 10)
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  }

  return (
    <div className="idea-seq__item">
      <svg
        className="idea-mini"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Колоколообразная кривая, близкая к нормальной"
      >
        <line
          x1="0"
          y1={height - 1}
          x2={width}
          y2={height - 1}
          className="idea-mini__axis"
        />
        <path d={points.join(' ')} className="idea-mini__curve" />
      </svg>
      <span className="idea-seq__label">30 слагаемых</span>
    </div>
  )
}

/* Схема вкладов: обычные малые столбцы, опционально один доминирующий. */
function ContribBars({ heights, dominantIndex }) {
  const width = 160
  const height = 52
  const slot = width / heights.length
  const barWidth = Math.max(slot - 4, 3)
  const max = Math.max(...heights, 1)

  return (
    <svg
      className="idea-contrib"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        dominantIndex === undefined
          ? 'Много одинаково малых вкладов'
          : 'Малые вклады и одно доминирующее слагаемое'
      }
    >
      <line
        x1="0"
        y1={height - 1}
        x2={width}
        y2={height - 1}
        className="idea-mini__axis"
      />
      {heights.map((value, index) => {
        const barHeight = (value / max) * (height - 6)
        const isDominant = index === dominantIndex
        return (
          <rect
            key={index}
            x={index * slot + 2}
            y={height - 1 - barHeight}
            width={barWidth}
            height={barHeight}
            rx="1"
            className={
              isDominant ? 'idea-contrib__bar idea-contrib__bar--dom' : 'idea-contrib__bar'
            }
          />
        )
      })}
    </svg>
  )
}

const OTHER_PATHS = [
  {
    id: 'char',
    title: 'Через характеристические функции',
    text: 'Показывает, почему после нормировки сохраняется только квадратичная часть.',
  },
  {
    id: 'moments',
    title: 'Через моменты',
    text: 'Показывает, почему в пределе выживают только попарные совпадения.',
  },
  {
    id: 'lindeberg',
    title: 'Через условие Линдеберга',
    text: 'Проверяет, что крупные отдельные скачки не определяют сумму.',
  },
]

function IdeaProof({ onSelectProof }) {
  return (
    <div className="idea">
      <div className="idea__head">
        <span className="idea__label">Интуитивный путь</span>
        <h4 className="idea__title">Почему сумма становится нормальной?</h4>
        <p className="idea__subtitle">
          Посмотрим на основную идею центральной предельной теоремы без
          технических деталей.
        </p>
      </div>

      <div className="idea__note">
        Интуитивное объяснение, а не формальное доказательство.
      </div>

      <div className="idea-step">
        <h5>1. Итог складывается из множества причин</h5>
        <p>
          Представим величину, которая складывается из большого числа
          независимых случайных вкладов. Каждое слагаемое может иметь
          собственное распределение: быть скошенным, дискретным или
          принимать всего несколько значений. Но ни одно отдельное
          слагаемое не должно определять итог самостоятельно.
        </p>
        <TeX block>{'X_1 + X_2 + \\cdots + X_n.'}</TeX>
        <div className="idea-example">
          Например, ошибка измерения может складываться из неточности
          прибора, округления, движения человека, изменения температуры и
          других небольших факторов.
        </div>
      </div>

      <div className="idea-step">
        <h5>2. Сначала переносим центр в ноль</h5>
        <p>
          Если каждое слагаемое имеет среднее <TeX>{'\\mu'}</TeX>, то
          среднее всей суммы равно <TeX>{'n\\mu'}</TeX>. При росте{' '}
          <TeX>{'n'}</TeX> распределение будет всё дальше сдвигаться вправо
          или влево. Чтобы исследовать форму распределения, а не движение
          его центра, мы вычитаем среднее суммы.
        </p>
        <TeX block>{'X_1 + \\cdots + X_n - n\\mu.'}</TeX>
        <p className="idea-hint">
          После этого среднее нормированной суммы будет равно нулю.
        </p>
        <div className="idea-flow" aria-hidden="true">
          <span className="idea-flow__item">распределение со сдвигом</span>
          <span className="idea-flow__arrow">→</span>
          <span className="idea-flow__item">
            вычитаем <TeX>{'n\\mu'}</TeX>
          </span>
          <span className="idea-flow__arrow">→</span>
          <span className="idea-flow__item">центр в нуле</span>
        </div>
      </div>

      <div className="idea-step">
        <h5>3. Затем стабилизируем разброс</h5>
        <p>
          Дисперсия суммы независимых величин растёт пропорционально{' '}
          <TeX>{'n'}</TeX>, а стандартное отклонение — пропорционально{' '}
          <TeX>{'\\sqrt{n}'}</TeX>. Поэтому сумму делят на{' '}
          <TeX>{'\\sigma\\sqrt{n}'}</TeX>. Такая нормировка не даёт
          распределению бесконечно растягиваться при увеличении числа
          слагаемых.
        </p>
        <TeX block>
          {'\\operatorname{Var}(X_1 + \\cdots + X_n) = n\\sigma^2,'}
        </TeX>
        <TeX block>
          {'\\operatorname{SD}(X_1 + \\cdots + X_n) = \\sigma\\sqrt{n}.'}
        </TeX>
        <TeX block>
          {'S_n = \\frac{X_1 + \\cdots + X_n - n\\mu}{\\sigma\\sqrt{n}}.'}
        </TeX>
        <p className="idea-hint">
          Теперь у <TeX>{'S_n'}</TeX> среднее равно 0, а дисперсия равна 1.
        </p>
        <div className="idea-stats">
          <div className="idea-stat">
            <span className="idea-stat__label">Центр</span>
            <span className="idea-stat__value">
              <TeX>{'\\mathbb{E}[S_n] = 0'}</TeX>
            </span>
          </div>
          <div className="idea-stat">
            <span className="idea-stat__label">Разброс</span>
            <span className="idea-stat__value">
              <TeX>{'\\operatorname{Var}(S_n) = 1'}</TeX>
            </span>
          </div>
        </div>
      </div>

      <div className="idea-step">
        <h5>4. Особенности отдельных распределений сглаживаются</h5>
        <p>
          Когда слагаемых много, итог формируется их совместным действием.
          Асимметрия, отдельные пики и дискретность каждого слагаемого
          становятся всё менее заметными. Распределение суммы начинает
          зависеть главным образом от общего центра и общего разброса, а не
          от точной формы одного отдельного слагаемого.
        </p>

        <div className="idea-seq">
          <MiniDist
            heights={[30, 22, 15, 10, 6, 4, 2]}
            label="1 слагаемое"
            ariaLabel="Явно ненормальное скошенное распределение"
          />
          <span className="idea-seq__arrow" aria-hidden="true">→</span>
          <MiniDist
            heights={[6, 14, 22, 24, 18, 10, 5]}
            label="5 слагаемых"
            ariaLabel="Более сглаженное распределение"
          />
          <span className="idea-seq__arrow" aria-hidden="true">→</span>
          <MiniBell />
        </div>
        <p className="idea-caption">
          Схема показывает общую тенденцию. При конечном <TeX>{'n'}</TeX>{' '}
          распределение не обязано быть идеально нормальным.
        </p>

        <div className="idea-warn">
          <strong>Большого числа слагаемых недостаточно само по себе.</strong>
          <p>
            Нормальная форма возникает, когда итог складывается из
            множества независимых небольших воздействий. Если одно
            слагаемое сохраняет огромный вес или иногда создаёт
            доминирующий скачок, оно может заметно определять форму всей
            суммы.
          </p>

          <div className="idea-scenarios">
            <div className="idea-scenario">
              <span className="idea-scenario__title">
                Много небольших вкладов
              </span>
              <ContribBars heights={[10, 11, 9, 10, 12, 9, 10, 11, 10]} />
              <span className="idea-scenario__caption">
                Ни один вклад не доминирует.
              </span>
            </div>
            <div className="idea-scenario">
              <span className="idea-scenario__title">
                Один доминирующий вклад
              </span>
              <ContribBars
                heights={[10, 9, 11, 42, 10, 9, 11]}
                dominantIndex={3}
              />
              <span className="idea-scenario__caption">
                Форма суммы всё ещё сильно зависит от одного слагаемого.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="idea-step">
        <h5>5. Возникает универсальная форма</h5>
        <p>
          После центрирования и нормировки влияние формы каждого
          отдельного слагаемого ослабевает. Если слагаемых много и ни одно
          из них не доминирует, распределение суммы приближается к
          стандартному нормальному.
        </p>
        <TeX block>
          {'\\frac{X_1 + \\cdots + X_n - n\\mu}{\\sigma\\sqrt{n}} \\;\\overset{d}{\\longrightarrow}\\; N(0,1).'}
        </TeX>
        <div className="idea-key">
          Нормальное распределение появляется тогда, когда результат
          создаётся большим числом независимых малых воздействий, а не
          несколькими крупными случайными событиями.
        </div>
      </div>

      <div className="idea__note idea__note--soft">
        В классической ЦПТ предполагается, что{' '}
        <TeX>{'X_1, \\ldots, X_n'}</TeX> независимы, одинаково распределены
        и имеют конечную ненулевую дисперсию.
      </div>

      <div className="idea-boundary">
        <strong>А если дисперсия бесконечна?</strong>
        <p>
          Конечная дисперсия здесь обязательна. Если у слагаемых
          «тяжёлые хвосты» и дисперсия бесконечна (классический пример —{' '}
          распределение Коши), нормировка на{' '}
          <TeX>{'\\sigma\\sqrt{n}'}</TeX> уже не подходит, и сумма не
          стремится к нормальному распределению. Само по себе большое{' '}
          число слагаемых нормальность не гарантирует.
        </p>
      </div>

      <div className="idea-summary">
        <h5 className="idea-summary__title">Что мы сделали</h5>
        <div className="idea-summary__cards">
          <div className="idea-summary__card">
            <TeX block>{'-\\,n\\mu'}</TeX>
            <span className="idea-summary__caption">
              Перенесли среднее суммы в ноль.
            </span>
          </div>
          <div className="idea-summary__card">
            <TeX block>{'\\div\\, \\sigma\\sqrt{n}'}</TeX>
            <span className="idea-summary__caption">
              Сделали дисперсию равной единице.
            </span>
          </div>
          <div className="idea-summary__card">
            <TeX block>{'n \\to \\infty'}</TeX>
            <span className="idea-summary__caption">
              Особенности отдельных распределений сгладились.
            </span>
          </div>
        </div>
      </div>

      <div className="idea-more">
        <h5 className="idea-more__title">
          Хочешь увидеть, почему это работает строго?
        </h5>
        <p className="idea-more__text">
          Разные строгие доказательства формализуют одну и ту же идею
          по-разному.
        </p>
        <div className="idea-more__links">
          {OTHER_PATHS.map((path) => (
            <button
              key={path.id}
              type="button"
              className="idea-link"
              onClick={() => onSelectProof(path.id)}
            >
              <strong>{path.title}</strong>
              <span>{path.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IdeaProof
