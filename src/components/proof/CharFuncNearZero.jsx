import { useState } from 'react'
import TeX from './TeX'

/*
 * Мини-иллюстрация внутри доказательства ЦПТ (характеристические функции).
 * Отвечает на один вопрос: почему характеристическую функцию рассматривают
 * около нуля. При росте n аргумент t/√n стягивается к нулю.
 *
 * В качестве конкретного примера берём радемахеровскую величину (±1 с
 * вероятностью ½, дисперсия 1): её характеристическая функция равна cos u.
 */

const FIXED_T = 3

// Область по оси u и параметры отрисовки SVG (viewBox 0 0 360 220).
const U_MIN = -8
const U_MAX = 8
const MARGIN = { left: 8, right: 8, top: 16, bottom: 24 }
const VB_W = 360
const VB_H = 220
const PLOT_W = VB_W - MARGIN.left - MARGIN.right // 344
const PLOT_H = VB_H - MARGIN.top - MARGIN.bottom // 180
const SAMPLES = 120

// u -> x (пиксели): [-8, 8] по всей ширине графика.
function xOf(u) {
  return MARGIN.left + ((u - U_MIN) / (U_MAX - U_MIN)) * PLOT_W
}

// φ -> y (пиксели): [-1, 1] по всей высоте графика (cos лежит в этом диапазоне).
function yOf(phi) {
  return MARGIN.top + ((1 - phi) / 2) * PLOT_H
}

// Кривая φ(u) = cos u, сэмплированная SAMPLES точками.
function buildCurve() {
  const pts = []
  for (let i = 0; i <= SAMPLES; i++) {
    const u = U_MIN + ((U_MAX - U_MIN) * i) / SAMPLES
    const x = xOf(u)
    const y = yOf(Math.cos(u))
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

const CURVE_PATH = buildCurve()

function CharFuncNearZero() {
  const [n, setN] = useState(10)

  const u = FIXED_T / Math.sqrt(n) // отмеченный аргумент t/√n
  const value = u.toFixed(3).replace('.', ',')
  const nearZero = u < 0.5

  const xPos = xOf(u)
  const xNeg = xOf(-u)
  const yDot = yOf(Math.cos(u))
  const yZero = yOf(0)
  const yOne = yOf(1)

  return (
    <div className="pviz">
      <p className="pviz__label">Иллюстрация</p>
      <h4 className="pviz__title">Почему характеристическую функцию рассматривают около нуля?</h4>
      <p className="pviz__q">
        При росте n аргумент <TeX>{'t/\\sqrt{n}'}</TeX> уменьшается. Двигай ползунок и следи за отмеченной точкой.
      </p>
      <div className="pviz__stage">
        <div className="pviz__controls">
          <div className="pviz__control">
            <label className="pviz__control-label" htmlFor="cfnz-n">Число слагаемых n = {n}</label>
            <input id="cfnz-n" className="pviz__slider" type="range" min="1" max="300" step="1"
              value={n} onChange={(e) => setN(Number(e.target.value))}
              aria-valuemin={1} aria-valuemax={300} aria-valuenow={n} aria-valuetext={`n равно ${n}`} />
          </div>
          <div className="pviz__readout">
            <span>t = <b>{FIXED_T}</b></span>
            <span>t/√n = <b>{value}</b></span>
          </div>
        </div>
        <svg className="pviz__svg" viewBox="0 0 360 220" role="img"
          aria-label={`График характеристической функции cos u. Отмеченный аргумент t делённое на корень из n равен ${value}.`}>
          {/* Полоса между -t/√n и +t/√n — область, влияющая на сумму */}
          <rect className="pviz-band" x={xNeg} y={MARGIN.top} width={xPos - xNeg} height={PLOT_H} />

          {/* Сетка: уровни φ = 1 и φ = 0 */}
          <line className="pviz-grid" x1={MARGIN.left} y1={yOne} x2={VB_W - MARGIN.right} y2={yOne} />
          <line className="pviz-grid" x1={MARGIN.left} y1={yZero} x2={VB_W - MARGIN.right} y2={yZero} />

          {/* Ось u (линия φ = 0 совпадает с осью, отдельно рисуем как ось) */}
          <line className="pviz-axis" x1={MARGIN.left} y1={yZero} x2={VB_W - MARGIN.right} y2={yZero} />

          {/* Кривая φ(u) = cos u */}
          <path className="pviz-curve pviz-curve--accent" d={CURVE_PATH} />

          {/* Вертикальные маркеры при u = ±t/√n */}
          <line className="pviz-marker" x1={xPos} y1={MARGIN.top} x2={xPos} y2={VB_H - MARGIN.bottom} />
          <line className="pviz-marker" x1={xNeg} y1={MARGIN.top} x2={xNeg} y2={VB_H - MARGIN.bottom} />

          {/* Точка на кривой при u = +t/√n */}
          <circle className="pviz-dot" cx={xPos} cy={yDot} r={4} />

          {/* Подписи делений оси u */}
          <text className="pviz-tick" x={xOf(-8)} y={VB_H - 8} textAnchor="middle">-8</text>
          <text className="pviz-tick" x={xOf(0)} y={VB_H - 8} textAnchor="middle">0</text>
          <text className="pviz-tick" x={xOf(8)} y={VB_H - 8} textAnchor="middle">8</text>

          {/* Легенда */}
          <text className="pviz-legend" x={VB_W - MARGIN.right} y={MARGIN.top + 4} textAnchor="end">φ(u) = cos u</text>
        </svg>
      </div>
      <p className="pviz__result">
        При n = {n} отмеченная точка t/√n = {value} — {nearZero ? 'она почти в нуле' : 'она ещё заметно отстоит от нуля'}.
      </p>
      <p className="pviz__takeaway">
        <strong>Зачем это в доказательстве.</strong> Чем больше n, тем меньше область характеристической функции, которая действительно влияет на сумму. Именно этот факт используется в следующей строке доказательства.
      </p>
    </div>
  )
}

export default CharFuncNearZero
