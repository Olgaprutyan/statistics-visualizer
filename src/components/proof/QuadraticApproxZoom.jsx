import { useState } from 'react'
import TeX from './TeX'

/*
 * Иллюстрация к доказательству ЦПТ (характеристические функции).
 * Отвечает на один вопрос: около нуля разные распределения с одинаковой
 * дисперсией выглядят почти одинаково — все они сливаются с квадратичным
 * приближением 1 − u²/2. При увеличении окрестности нуля три кривые
 * визуально сходятся.
 */
function QuadraticApproxZoom() {
  const [zoom, setZoom] = useState(1) // 1..20
  const L = 4 / zoom // домен u ∈ [−L, L]

  // --- Параметры графика (координаты viewBox) ---
  const W = 360
  const H = 220
  const padL = 34
  const padR = 12
  const padT = 12
  const padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const SQRT3 = Math.sqrt(3)
  const N = 120

  // Характеристические функции и общее приближение
  const phiRademacher = (u) => Math.cos(u)
  const phiUniform = (u) => {
    const x = SQRT3 * u
    if (Math.abs(x) < 1e-9) return 1
    return Math.sin(x) / x
  }
  const quad = (u) => 1 - (u * u) / 2

  // --- Выборка точек по домену ---
  const us = []
  const f1 = []
  const f2 = []
  const fq = []
  for (let i = 0; i <= N; i++) {
    const u = -L + (2 * L * i) / N
    us.push(u)
    f1.push(phiRademacher(u))
    f2.push(phiUniform(u))
    fq.push(quad(u))
  }

  // --- Авто-масштаб оси Y по текущему домену ---
  let minValue = Infinity
  for (let i = 0; i <= N; i++) {
    if (f1[i] < minValue) minValue = f1[i]
    if (f2[i] < minValue) minValue = f2[i]
    if (fq[i] < minValue) minValue = fq[i]
  }
  const yMax = 1.02
  const yMin = Math.min(minValue, yMax - 1e-3) // защита от вырожденного диапазона

  // --- Максимальное отклонение истинных функций от квадратики ---
  let maxDevRaw = 0
  for (let i = 0; i <= N; i++) {
    const d1 = Math.abs(f1[i] - fq[i])
    const d2 = Math.abs(f2[i] - fq[i])
    if (d1 > maxDevRaw) maxDevRaw = d1
    if (d2 > maxDevRaw) maxDevRaw = d2
  }

  // --- Координатные преобразования ---
  const xOf = (u) => padL + ((u + L) / (2 * L)) * plotW
  const yOf = (v) => padT + ((yMax - v) / (yMax - yMin)) * plotH

  const pathOf = (arr) => {
    let d = ''
    for (let i = 0; i <= N; i++) {
      d += (i === 0 ? 'M' : 'L') + xOf(us[i]).toFixed(2) + ' ' + yOf(arr[i]).toFixed(2)
    }
    return d
  }

  const pathRademacher = pathOf(f1)
  const pathUniform = pathOf(f2)
  const pathQuad = pathOf(fq)

  // --- Форматирование чисел с запятой-разделителем ---
  const fmt = (x, digits) => x.toFixed(digits).replace('.', ',')
  const maxDev = fmt(maxDevRaw, 3)
  const tickLeft = fmt(-L, 2)
  const tickRight = fmt(L, 2)

  const xZero = xOf(0)
  const yAxisBottom = padT + plotH

  const result =
    maxDevRaw < 0.02
      ? 'На этом масштабе кривые практически неразличимы.'
      : 'Пока видно, чем распределения отличаются вдали от нуля.'

  return (
    <div className="pviz">
      <p className="pviz__label">Иллюстрация</p>
      <h4 className="pviz__title">Около нуля все они выглядят одинаково</h4>
      <p className="pviz__q">
        Увеличивай окрестность нуля и смотри, как характеристические функции и их квадратичное приближение{' '}
        <TeX>{'1 - u^2/2'}</TeX> сливаются.
      </p>
      <div className="pviz__stage">
        <div className="pviz__controls">
          <div className="pviz__control">
            <label className="pviz__control-label" htmlFor="qaz-zoom">
              Увеличение около нуля ×{zoom}
            </label>
            <input
              id="qaz-zoom"
              className="pviz__slider"
              type="range"
              min="1"
              max="20"
              step="1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-valuemin={1}
              aria-valuemax={20}
              aria-valuenow={zoom}
              aria-valuetext={`увеличение ${zoom}`}
            />
          </div>
          <div className="pviz__readout">
            <span>
              окно |u| ≤ <b>{fmt(L, 2)}</b>
            </span>
            <span>
              макс. отклонение <b>{maxDev}</b>
            </span>
          </div>
        </div>
        <svg
          className="pviz__svg"
          viewBox="0 0 360 220"
          role="img"
          aria-label="График трёх кривых около нуля: cos u, sinc для равномерного распределения и квадратичное приближение 1 − u²/2"
        >
          {/* Ось X (внизу) */}
          <line className="pviz-axis" x1={padL} y1={yAxisBottom} x2={W - padR} y2={yAxisBottom} />
          {/* Вертикаль в нуле */}
          <line className="pviz-grid" x1={xZero} y1={padT} x2={xZero} y2={yAxisBottom} />

          {/* Кривые */}
          <path className="pviz-curve" d={pathRademacher} />
          <path className="pviz-curve pviz-curve--muted" d={pathUniform} />
          <path className="pviz-curve--approx" fill="none" d={pathQuad} />

          {/* Подписи по оси X: −L, 0, +L */}
          <text className="pviz-tick" x={padL} y={H - 8} textAnchor="start">
            {tickLeft}
          </text>
          <text className="pviz-tick" x={xZero} y={H - 8} textAnchor="middle">
            0
          </text>
          <text className="pviz-tick" x={W - padR} y={H - 8} textAnchor="end">
            {tickRight}
          </text>

          {/* Подписи по оси Y: диапазон авто-масштаба */}
          <text className="pviz-tick" x={padL - 4} y={padT + 4} textAnchor="end">
            {fmt(yMax, 2)}
          </text>
          <text className="pviz-tick" x={padL - 4} y={yAxisBottom} textAnchor="end">
            {fmt(yMin, 2)}
          </text>

          {/* Легенда */}
          <text className="pviz-legend" x={padL + 4} y={padT + 12}>
            cos u
          </text>
          <text className="pviz-legend" x={padL + 4} y={padT + 26}>
            sinc (равномерное)
          </text>
          <text className="pviz-legend" x={padL + 4} y={padT + 40}>
            1 − u²/2
          </text>
        </svg>
      </div>
      <p className="pviz__result">{result}</p>
      <p className="pviz__takeaway">
        <strong>Зачем это в доказательстве.</strong> Около нуля любые распределения с одинаковой дисперсией
        выглядят почти одинаково — их отличает лишь остаток o(u²). Именно этот факт используется в следующей
        строке доказательства.
      </p>
    </div>
  )
}

export default QuadraticApproxZoom
