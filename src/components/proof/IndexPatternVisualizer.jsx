import { useState } from 'react'
import TeX from './TeX'

/*
 * Визуализация комбинаторной идеи доказательства: какие структуры
 * индексов дают вклад в предел момента. Локальная демонстрация,
 * состояние не сохраняется в localStorage.
 */

const INDEX_COLORS = [
  '#7c3aed',
  '#2f74c0',
  '#15803d',
  '#d97b2b',
  '#0f766e',
  '#be185d',
]

const SUBSCRIPTS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆']

const STATUS_LABEL = {
  zero: 'Равно нулю',
  vanishes: 'Исчезает после нормировки',
  survives: 'Выживает',
}

const MOMENT_PATTERNS = {
  3: [
    {
      label: 'Все индексы разные',
      indices: [1, 2, 3],
      q: 3,
      status: 'zero',
      explanation:
        'Каждый индекс встречается один раз, поэтому в произведении появляется множитель E[Yᵢ] = 0.',
    },
    {
      label: 'Один индекс встречается трижды',
      indices: [1, 1, 1],
      q: 1,
      status: 'vanishes',
      explanation:
        'Таких слагаемых порядка n, а нормировка имеет порядок n^{3/2}. Общий вклад имеет порядок n^{-1/2}.',
    },
  ],
  4: [
    {
      label: 'Все индексы разные',
      indices: [1, 2, 3, 4],
      q: 4,
      status: 'zero',
      explanation:
        'Есть одиночные индексы, поэтому появляется множитель E[Yᵢ] = 0.',
    },
    {
      label: 'Одна пара и два одиночных индекса',
      indices: [1, 1, 2, 3],
      q: 3,
      status: 'zero',
      explanation:
        'Индексы 2 и 3 встречаются по одному разу — снова множитель E[Yᵢ] = 0.',
    },
    {
      label: 'Один индекс четыре раза',
      indices: [1, 1, 1, 1],
      q: 1,
      status: 'vanishes',
      explanation:
        'Таких слагаемых порядка n, а делим мы на n². Вклад стремится к нулю.',
    },
    {
      label: 'Две пары',
      indices: [1, 1, 2, 2],
      q: 2,
      status: 'survives',
      explanation:
        'Таких слагаемых порядка n². После деления на n² остаётся ненулевой предел.',
    },
  ],
  5: [
    {
      label: 'Все индексы разные',
      indices: [1, 2, 3, 4, 5],
      q: 5,
      status: 'zero',
      explanation: 'Одиночные индексы дают множитель E[Yᵢ] = 0.',
    },
    {
      label: 'Две пары и одиночный индекс',
      indices: [1, 1, 2, 2, 3],
      q: 3,
      status: 'zero',
      explanation:
        'Индекс 3 встречается один раз — снова множитель E[Yᵢ] = 0.',
    },
    {
      label: 'Тройка и пара',
      indices: [1, 1, 1, 2, 2],
      q: 2,
      status: 'vanishes',
      explanation:
        'Ожидание может быть ненулевым, но использованы только два различных индекса. Таких слагаемых порядка n², а нормировка n^{5/2}. Вклад стремится к нулю.',
    },
  ],
  6: [
    {
      label: 'Один индекс шесть раз',
      indices: [1, 1, 1, 1, 1, 1],
      q: 1,
      status: 'vanishes',
      explanation: 'Таких слагаемых порядка n, а делим на n³.',
    },
    {
      label: 'Четвёрка и пара',
      indices: [1, 1, 1, 1, 2, 2],
      q: 2,
      status: 'vanishes',
      explanation:
        'Использованы два различных индекса. Порядок n², а нормировка n³.',
    },
    {
      label: 'Две тройки',
      indices: [1, 1, 1, 2, 2, 2],
      q: 2,
      status: 'vanishes',
      explanation:
        'Снова только два различных индекса, поэтому вклад стремится к нулю.',
    },
    {
      label: 'Три пары',
      indices: [1, 1, 2, 2, 3, 3],
      q: 3,
      status: 'survives',
      explanation:
        'Использует три различных индекса, то есть q = r/2 = 3. Число таких слагаемых имеет тот же порядок n³, что и нормировка.',
    },
  ],
}

const MOMENT_SUMMARY = {
  3: 'Ни одна структура не выживает. Поэтому третий момент стремится к нулю.',
  4: 'В четвёртом моменте сохраняются только две пары. Их число приводит к пределу 3.',
  5: 'Нечётное число позиций нельзя полностью разбить на пары. Поэтому нечётный момент стремится к нулю.',
  6: 'Выживает только структура 2 + 2 + 2 — три пары с q = r/2 = 3.',
}

const ORDERS = [3, 4, 5, 6]

function IndexCells({ indices }) {
  return (
    <div className="ipv-cells" aria-label="Структура индексов произведения">
      {indices.map((index, position) => (
        <span
          className="ipv-cell"
          key={position}
          style={{ background: INDEX_COLORS[(index - 1) % INDEX_COLORS.length] }}
        >
          Y{SUBSCRIPTS[index] ?? index}
        </span>
      ))}
    </div>
  )
}

function ContributionBars({ q, r }) {
  const half = r / 2
  const scale = Math.max(q, half, 1)
  const equal = q === half

  return (
    <div className="ipv-order">
      <TeX>{`\\dfrac{n^{${q}}}{n^{${r}/2}} = n^{${q} - ${r}/2}`}</TeX>

      <div className="ipv-bars">
        <div className="ipv-bar">
          <span className="ipv-bar__label">
            Число слагаемых: n<sup>{q}</sup>
          </span>
          <span className="ipv-bar__track">
            <span
              className="ipv-bar__fill"
              style={{ width: `${(q / scale) * 100}%` }}
            />
          </span>
        </div>

        <div className="ipv-bar">
          <span className="ipv-bar__label">
            Нормировка: n<sup>{r}/2</sup>
          </span>
          <span className="ipv-bar__track">
            <span
              className="ipv-bar__fill ipv-bar__fill--norm"
              style={{ width: `${(half / scale) * 100}%` }}
            />
          </span>
        </div>
      </div>

      <p className="ipv-order__verdict">
        {equal ? 'вклад может сохраниться' : 'вклад исчезает'}
      </p>
    </div>
  )
}

function IndexPatternVisualizer() {
  const [selectedMoment, setSelectedMoment] = useState(4)

  const patterns = MOMENT_PATTERNS[selectedMoment]

  return (
    <figure className="ipv">
      <figcaption className="ipv__head">
        <h4>Какие слагаемые остаются после нормировки?</h4>
        <p>
          Выберите порядок момента и посмотрите, какие структуры индексов
          дают вклад в предел.
        </p>
      </figcaption>

      <div className="ipv-orders" role="group" aria-label="Порядок момента">
        {ORDERS.map((order) => (
          <button
            className={
              order === selectedMoment
                ? 'ipv-order-btn ipv-order-btn--active'
                : 'ipv-order-btn'
            }
            type="button"
            key={order}
            aria-pressed={order === selectedMoment}
            onClick={() => setSelectedMoment(order)}
          >
            r = {order}
          </button>
        ))}
      </div>

      <div className="ipv-grid">
        {patterns.map((pattern) => (
          <article
            className={`ipv-card ipv-card--${pattern.status}`}
            key={pattern.label}
          >
            <p className="ipv-card__label">{pattern.label}</p>

            <IndexCells indices={pattern.indices} />

            <p className="ipv-card__q">
              Различных индексов: q = {pattern.q}
            </p>

            <p className={`ipv-status ipv-status--${pattern.status}`}>
              {STATUS_LABEL[pattern.status]}
            </p>

            <p className="ipv-card__explain">{pattern.explanation}</p>

            {pattern.status !== 'zero' && (
              <ContributionBars q={pattern.q} r={selectedMoment} />
            )}
          </article>
        ))}
      </div>

      <p className="ipv-summary-line">{MOMENT_SUMMARY[selectedMoment]}</p>

      <div className="ipv-scheme">
        <div className="ipv-scheme__row">
          <span className="ipv-scheme__cond">Есть одиночный индекс</span>
          <span className="ipv-scheme__arrow">→</span>
          <span className="ipv-scheme__res">Ожидание равно нулю</span>
        </div>

        <div className="ipv-scheme__row">
          <span className="ipv-scheme__cond">
            Все индексы встречаются хотя бы дважды, но q &lt; r/2
          </span>
          <span className="ipv-scheme__arrow">→</span>
          <span className="ipv-scheme__res">
            После нормировки вклад исчезает
          </span>
        </div>

        <div className="ipv-scheme__row ipv-scheme__row--survive">
          <span className="ipv-scheme__cond">
            q = r/2: каждый индекс встречается ровно дважды
          </span>
          <span className="ipv-scheme__arrow">→</span>
          <span className="ipv-scheme__res">Остаются только пары</span>
        </div>
      </div>
    </figure>
  )
}

export default IndexPatternVisualizer
