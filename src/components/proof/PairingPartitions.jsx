import { useState, useMemo } from 'react'
import TeX from './TeX'

/*
 * Иллюстрация к доказательству ЦПТ через моменты.
 * Показывает, почему «выживают» именно разбиения на пары:
 * у 4 точек ровно 3 совершенных паросочетания, у 6 точек — 15,
 * и (2m−1)!! — это в точности 2m-й момент нормального распределения.
 */

// Все совершенные паросочетания массива индексов.
// Берём первый элемент, соединяем его с каждым из оставшихся, рекурсия по остатку.
function perfectMatchings(items) {
  if (items.length === 0) return [[]]
  const [first, ...rest] = items
  const result = []
  for (let i = 0; i < rest.length; i++) {
    const pair = [first, rest[i]]
    const remaining = rest.filter((_, j) => j !== i)
    for (const sub of perfectMatchings(remaining)) result.push([pair, ...sub])
  }
  return result
}

// Детерминированные координаты кружков: равномерно по горизонтали.
function dotPositions(count) {
  const margin = 44
  const width = 360
  const y = 168
  const step = count > 1 ? (width - 2 * margin) / (count - 1) : 0
  const pts = []
  for (let i = 0; i < count; i++) {
    pts.push({ x: margin + i * step, y })
  }
  return pts
}

function PairingPartitions() {
  const [count, setCount] = useState(4)
  const [index, setIndex] = useState(0)

  const matchings = useMemo(() => {
    const items = Array.from({ length: count }, (_, i) => i)
    return perfectMatchings(items)
  }, [count])

  // На случай рассинхронизации index удерживаем в допустимых границах.
  const safeIndex = Math.min(index, matchings.length - 1)
  const current = matchings[safeIndex]
  const dots = dotPositions(count)

  const prev = () =>
    setIndex((i) => (i - 1 + matchings.length) % matchings.length)
  const next = () => setIndex((i) => (i + 1) % matchings.length)

  return (
    <div className="pviz">
      <p className="pviz__label">Иллюстрация</p>
      <h4 className="pviz__title">Сколько способов разбить на пары?</h4>
      <p className="pviz__q">
        Соединяй позиции в пары. Сколько всего различных разбиений получается?
      </p>
      <div className="pviz__stage">
        <div className="pviz__controls">
          <div className="pviz__toggle" role="group" aria-label="Число позиций">
            <button
              className={'pviz__btn' + (count === 4 ? ' pviz__btn--active' : '')}
              aria-pressed={count === 4}
              onClick={() => {
                setCount(4)
                setIndex(0)
              }}
            >
              4 кружка
            </button>
            <button
              className={'pviz__btn' + (count === 6 ? ' pviz__btn--active' : '')}
              aria-pressed={count === 6}
              onClick={() => {
                setCount(6)
                setIndex(0)
              }}
            >
              6 кружков
            </button>
          </div>
          <div className="pviz__readout">
            <span>
              разбиение <b>{safeIndex + 1}</b> из <b>{matchings.length}</b>
            </span>
          </div>
        </div>

        <svg
          className="pviz__svg"
          viewBox="0 0 360 240"
          role="img"
          aria-label={`Разбиение ${safeIndex + 1} из ${matchings.length} для ${count} позиций`}
        >
          {/* Дуги текущего паросочетания: квадратичная кривая Безье,
              высота дуги пропорциональна расстоянию между точками,
              чтобы вложенные пары не сливались. */}
          {current.map(([a, b], k) => {
            const pa = dots[a]
            const pb = dots[b]
            const midX = (pa.x + pb.x) / 2
            const dist = Math.abs(pb.x - pa.x)
            const ctrlY = pa.y - 30 - dist * 0.55
            return (
              <path
                key={k}
                className="pviz-curve pviz-curve--accent"
                d={`M ${pa.x} ${pa.y} Q ${midX} ${ctrlY} ${pb.x} ${pb.y}`}
              />
            )
          })}

          {/* Кружки-позиции с номерами 1..count */}
          {dots.map((p, i) => (
            <g key={i}>
              <circle className="pviz-dot" cx={p.x} cy={p.y} r={9} />
              <text
                className="pviz-tick"
                x={p.x}
                y={p.y + 26}
                textAnchor="middle"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>

        <div className="pviz__toggle">
          <button className="pviz__btn" onClick={prev}>
            ← Предыдущее
          </button>
          <button className="pviz__btn" onClick={next}>
            Следующее →
          </button>
        </div>
      </div>

      <p className="pviz__result">
        Всего для {count} позиций — <b>{matchings.length}</b> способов разбить на
        пары ({count === 4 ? '3 = (4−1)!!' : '15 = (6−1)!!'}).
      </p>
      <p className="pviz__takeaway">
        <strong>Зачем это в доказательстве.</strong> Именно количество таких
        разбиений становится моментом нормального распределения:{' '}
        <TeX>{'\\mathbb{E}[Z^{2m}] = (2m-1)!!'}</TeX>. Именно этот факт
        используется в следующей строке доказательства.
      </p>
    </div>
  )
}

export default PairingPartitions
