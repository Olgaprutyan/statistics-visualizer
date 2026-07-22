import { useState } from 'react'
import TeX from './TeX'

/*
 * Иллюстрация к доказательству ЦПТ (Линдеберг — Феллер).
 * Показывает, как контролируется остаток разложения
 * R(x) = e^{ix} − 1 − ix + x²/2 в двух зонах, разделённых порогом δ:
 * при малых |x| — тонкая локальная оценка η·x² (η мало),
 * при больших |x| — грубая глобальная оценка x². Именно вклад
 * больших |x| и гасится условием Линдеберга.
 */
function RemainderControl() {
  const [delta, setDelta] = useState(1.5) // порог, 0.4..4, шаг 0.1
  const eta = 0.15 // фиксированная малая локальная константа

  // --- Параметры графика (координаты viewBox) ---
  const W = 360
  const H = 220
  const padL = 30
  const padR = 12
  const padT = 12
  const padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const L = 4 // домен x ∈ [−L, L]
  const YMAX = 8 // потолок отображаемого диапазона по оси Y
  const N = 120

  // --- Три кривые ---
  // 1) истинный модуль остатка через разложение Эйлера:
  //    Re R = cos x − 1 + x²/2, Im R = sin x − x
  const absR = (x) => Math.hypot(Math.cos(x) - 1 + (x * x) / 2, Math.sin(x) - x)
  // 2) глобальная (грубая) оценка
  const globalB = (x) => x * x
  // 3) локальная (тонкая) оценка
  const localB = (x) => eta * x * x

  // --- Координатные преобразования ---
  const xOf = (x) => padL + ((x + L) / (2 * L)) * plotW
  const clampY = (v) => (v > YMAX ? YMAX : v < 0 ? 0 : v)
  const yOf = (v) => padT + ((YMAX - clampY(v)) / YMAX) * plotH

  const pathOf = (fn) => {
    let d = ''
    for (let i = 0; i <= N; i++) {
      const x = -L + (2 * L * i) / N
      d += (i === 0 ? 'M' : 'L') + xOf(x).toFixed(2) + ' ' + yOf(fn(x)).toFixed(2)
    }
    return d
  }

  const pathR = pathOf(absR)
  const pathGlobal = pathOf(globalB)
  const pathLocal = pathOf(localB)

  // --- Геометрия порога и полосы «малых значений» ---
  const xLeft = xOf(-delta)
  const xRight = xOf(delta)
  const yTop = padT
  const yAxisBottom = padT + plotH
  const xZero = xOf(0)

  // --- Форматирование чисел с запятой-разделителем ---
  const fmt = (x, digits) => x.toFixed(digits).replace('.', ',')
  const deltaTxt = fmt(delta, 1)

  const result =
    delta <= 1.2
      ? 'Внутри узкого порога остаток крошечный — им можно пренебречь.'
      : delta >= 2.6
        ? 'При широком пороге в «малую» зону попадают и заметные значения x.'
        : 'В пределах порога остаток остаётся малым — порядка η·x².'

  return (
    <div className="pviz">
      <p className="pviz__label">Иллюстрация</p>
      <h4 className="pviz__title">Как контролируется остаток разложения</h4>
      <p className="pviz__q">
        Остаток <TeX>{'R(x)=e^{ix}-1-ix+\\tfrac{x^2}{2}'}</TeX> оценивают по-разному для малых и больших
        значений. Двигай порог <TeX>{'\\delta'}</TeX>.
      </p>
      <div className="pviz__stage">
        <div className="pviz__controls">
          <div className="pviz__control">
            <label className="pviz__control-label" htmlFor="rc-delta">
              Порог δ = {deltaTxt}
            </label>
            <input
              id="rc-delta"
              className="pviz__slider"
              type="range"
              min="0.4"
              max="4"
              step="0.1"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              aria-valuemin={0.4}
              aria-valuemax={4}
              aria-valuenow={delta}
              aria-valuetext={`порог ${delta}`}
            />
          </div>
          <div className="pviz__readout">
            <span>
              малые |x| ≤ δ: остаток ≤ <b>η·x²</b>
            </span>
            <span>
              большие |x| &gt; δ: ≤ <b>x²</b>
            </span>
          </div>
        </div>
        <svg
          className="pviz__svg"
          viewBox="0 0 360 220"
          role="img"
          aria-label="График модуля остатка |R(x)| и двух оценок: локальной η·x² внутри порога δ и глобальной x² снаружи"
        >
          {/* Полоса «малых значений» |x| ≤ δ */}
          <rect
            className="pviz-band"
            x={xLeft}
            y={yTop}
            width={xRight - xLeft}
            height={plotH}
          />

          {/* Ось X (внизу) */}
          <line className="pviz-axis" x1={padL} y1={yAxisBottom} x2={W - padR} y2={yAxisBottom} />
          {/* Вертикаль в нуле */}
          <line className="pviz-grid" x1={xZero} y1={yTop} x2={xZero} y2={yAxisBottom} />

          {/* Пороговые маркеры при x = ±δ */}
          <line className="pviz-marker" x1={xLeft} y1={yTop} x2={xLeft} y2={yAxisBottom} />
          <line className="pviz-marker" x1={xRight} y1={yTop} x2={xRight} y2={yAxisBottom} />

          {/* Кривые: глобальная (приглушённая), локальная (акцент-пунктир), истинный остаток (нейтральный) */}
          <path className="pviz-curve pviz-curve--muted" d={pathGlobal} />
          <path className="pviz-curve--approx" fill="none" d={pathLocal} />
          <path className="pviz-curve" d={pathR} />

          {/* Подписи по оси X: −4, 0, 4 */}
          <text className="pviz-tick" x={padL} y={H - 8} textAnchor="start">
            −4
          </text>
          <text className="pviz-tick" x={xZero} y={H - 8} textAnchor="middle">
            0
          </text>
          <text className="pviz-tick" x={W - padR} y={H - 8} textAnchor="end">
            4
          </text>

          {/* Подписи по оси Y: 0 и потолок */}
          <text className="pviz-tick" x={padL - 4} y={padT + 4} textAnchor="end">
            {YMAX}
          </text>
          <text className="pviz-tick" x={padL - 4} y={yAxisBottom} textAnchor="end">
            0
          </text>

          {/* Метки зон */}
          <text className="pviz-tick" x={xZero} y={yTop + 12} textAnchor="middle">
            малые
          </text>
          <text className="pviz-tick" x={W - padR - 2} y={yTop + 12} textAnchor="end">
            большие
          </text>

          {/* Легенда */}
          <text className="pviz-legend" x={padL + 4} y={padT + 26}>
            |R(x)|
          </text>
          <text className="pviz-legend" x={padL + 4} y={padT + 40}>
            x²
          </text>
          <text className="pviz-legend" x={padL + 4} y={padT + 54}>
            η·x²
          </text>
        </svg>
      </div>
      <p className="pviz__result">{result}</p>
      <p className="pviz__takeaway">
        <strong>Зачем это в доказательстве.</strong> На малых значениях остаток крошечный (порядка η·x²), а
        весь вклад больших значений гасится условием Линдеберга. Именно этот факт используется в следующей
        строке доказательства.
      </p>
    </div>
  )
}

export default RemainderControl
