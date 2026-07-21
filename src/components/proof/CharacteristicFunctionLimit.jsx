import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import TeX from './TeX'

const QUICK_N = [1, 5, 10, 50, 200, 500]
const ANIMATE_SEQUENCE = [1, 2, 5, 10, 20, 50, 100, 200, 500]
const T_MIN = -4
const T_MAX = 4
const POINTS = 201

function generateData(n) {
  const data = []
  for (let i = 0; i < POINTS; i++) {
    const t = T_MIN + (T_MAX - T_MIN) * (i / (POINTS - 1))
    const limit = Math.exp(-(t * t) / 2)
    const base = 1 - (t * t) / (2 * n)
    const approx = base >= 0 ? Math.pow(base, n) : null
    data.push({ t, limit, approx })
  }
  return data
}

function computeValues(n, t) {
  const tOverSqrtN = t / Math.sqrt(n)
  const base = 1 - (t * t) / (2 * n)
  const approxValid = base >= 0
  const approxValue = approxValid ? Math.pow(base, n) : null
  const limitValue = Math.exp(-(t * t) / 2)
  return { tOverSqrtN, base, approxValid, approxValue, limitValue }
}

function Chart({ data, n, selectedT, onTChange }) {
  const svgRef = useRef(null)

  const width = 520
  const height = 300
  const pad = { top: 20, right: 20, bottom: 40, left: 50 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  const yMin = -0.1
  const yMax = 1.05

  const xToPixel = useCallback(
    (t) => pad.left + ((t - T_MIN) / (T_MAX - T_MIN)) * plotW,
    [plotW],
  )
  const yToPixel = useCallback(
    (y) => pad.top + ((yMax - y) / (yMax - yMin)) * plotH,
    [plotH],
  )
  const pixelToX = useCallback(
    (px) => T_MIN + ((px - pad.left) / plotW) * (T_MAX - T_MIN),
    [plotW],
  )

  const limitPath = useMemo(() => {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xToPixel(d.t).toFixed(1)},${yToPixel(d.limit).toFixed(1)}`)
      .join(' ')
  }, [data, xToPixel, yToPixel])

  const approxSegments = useMemo(() => {
    const segs = []
    let current = []
    for (const d of data) {
      if (d.approx !== null) {
        current.push(d)
      } else {
        if (current.length > 1) segs.push(current)
        current = []
      }
    }
    if (current.length > 1) segs.push(current)
    return segs
  }, [data])

  const approxPaths = useMemo(() => {
    return approxSegments.map((seg) =>
      seg
        .map(
          (d, i) =>
            `${i === 0 ? 'M' : 'L'}${xToPixel(d.t).toFixed(1)},${yToPixel(d.approx).toFixed(1)}`,
        )
        .join(' '),
    )
  }, [approxSegments, xToPixel, yToPixel])

  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
  const xTicks = [-4, -3, -2, -1, 0, 1, 2, 3, 4]

  const vals = computeValues(n, selectedT)
  const markerX = xToPixel(selectedT)

  function handlePointer(e) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scaleX = width / rect.width
    const px = (e.clientX - rect.left) * scaleX
    const t = pixelToX(px)
    const clamped = Math.round(Math.max(T_MIN, Math.min(T_MAX, t)) * 10) / 10
    onTChange(clamped)
  }

  return (
    <svg
      ref={svgRef}
      className="cfl-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`График: приближение при n=${n} и предел`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        handlePointer(e)
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0) handlePointer(e)
      }}
    >
      {/* grid */}
      {yTicks.map((y) => (
        <line
          key={y}
          x1={pad.left}
          y1={yToPixel(y)}
          x2={width - pad.right}
          y2={yToPixel(y)}
          className="cfl-grid"
        />
      ))}
      {xTicks.map((x) => (
        <line
          key={x}
          x1={xToPixel(x)}
          y1={pad.top}
          x2={xToPixel(x)}
          y2={height - pad.bottom}
          className="cfl-grid"
        />
      ))}

      {/* zero line */}
      <line
        x1={pad.left}
        y1={yToPixel(0)}
        x2={width - pad.right}
        y2={yToPixel(0)}
        className="cfl-axis"
      />
      <line
        x1={xToPixel(0)}
        y1={pad.top}
        x2={xToPixel(0)}
        y2={height - pad.bottom}
        className="cfl-axis"
      />

      {/* axis labels */}
      {xTicks.map((x) => (
        <text
          key={x}
          x={xToPixel(x)}
          y={height - pad.bottom + 18}
          className="cfl-tick"
        >
          {x}
        </text>
      ))}
      {yTicks.map((y) => (
        <text
          key={y}
          x={pad.left - 8}
          y={yToPixel(y) + 4}
          className="cfl-tick cfl-tick--y"
        >
          {y.toFixed(1)}
        </text>
      ))}

      <text
        x={width - pad.right}
        y={height - pad.bottom + 32}
        className="cfl-label"
      >
        t
      </text>

      {/* limit curve */}
      <path d={limitPath} className="cfl-line cfl-line--limit" />

      {/* approximation curve */}
      {approxPaths.map((d, i) => (
        <path key={i} d={d} className="cfl-line cfl-line--approx" />
      ))}

      {/* marker line */}
      <line
        x1={markerX}
        y1={pad.top}
        x2={markerX}
        y2={height - pad.bottom}
        className="cfl-marker-line"
      />

      {/* marker dots */}
      <circle
        cx={markerX}
        cy={yToPixel(vals.limitValue)}
        r="4"
        className="cfl-dot cfl-dot--limit"
      />
      {vals.approxValid && vals.approxValue !== null && (
        <circle
          cx={markerX}
          cy={yToPixel(vals.approxValue)}
          r="4"
          className="cfl-dot cfl-dot--approx"
        />
      )}

      {/* legend */}
      <g transform={`translate(${pad.left + 8}, ${pad.top + 8})`}>
        <line x1="0" y1="6" x2="20" y2="6" className="cfl-line cfl-line--approx" strokeWidth="2" />
        <text x="24" y="10" className="cfl-legend-text">
          {`Конечное n = ${n}`}
        </text>
        <line x1="0" y1="22" x2="20" y2="22" className="cfl-line cfl-line--limit" strokeWidth="2" />
        <text x="24" y="26" className="cfl-legend-text">
          {'Предел e^{−t²/2}'}
        </text>
      </g>
    </svg>
  )
}

function MechanismCards({ n, t }) {
  const vals = computeValues(n, t)
  const factor = vals.base
  const maxBlocks = Math.min(n, 20)
  const showMultiplier = n > 20

  return (
    <div className="cfl-mechanism">
      <div className="cfl-mcard">
        <span className="cfl-mcard__title">Один множитель</span>
        <div className="cfl-mcard__formula">
          <TeX>{`1 - \\frac{t^2}{2n} = ${factor.toFixed(3)}`}</TeX>
        </div>
        <div className="cfl-mcard__bar">
          <div className="cfl-mcard__bar-track">
            <div
              className="cfl-mcard__bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, factor * 100))}%` }}
            />
          </div>
          <span className="cfl-mcard__bar-labels">
            <span>0</span>
            <span>1</span>
          </span>
        </div>
        <span className="cfl-mcard__hint">Почти равен 1</span>
      </div>

      <span className="cfl-mechanism__arrow" aria-hidden="true">→</span>

      <div className="cfl-mcard">
        <span className="cfl-mcard__title">Количество множителей</span>
        <div className="cfl-mcard__formula">
          <TeX>{`n = ${n}`}</TeX>
        </div>
        <div className="cfl-mcard__blocks">
          {Array.from({ length: maxBlocks }, (_, i) => (
            <span key={i} className="cfl-mcard__block" />
          ))}
          {showMultiplier && (
            <span className="cfl-mcard__multiplier">× {n}</span>
          )}
        </div>
        <span className="cfl-mcard__hint">Их становится всё больше</span>
      </div>

      <span className="cfl-mechanism__arrow" aria-hidden="true">→</span>

      <div className="cfl-mcard">
        <span className="cfl-mcard__title">Общий эффект</span>
        <div className="cfl-mcard__formula">
          <TeX>{`\\left(1 - \\frac{t^2}{2n}\\right)^{n} \\!= ${vals.approxValid ? vals.approxValue.toFixed(4) : '—'}`}</TeX>
        </div>
        <span className="cfl-mcard__hint">
          Стремится к <TeX>{`e^{-t^2/2} = ${vals.limitValue.toFixed(4)}`}</TeX>
        </span>
      </div>
    </div>
  )
}

function CharacteristicFunctionLimit() {
  const [n, setN] = useState(10)
  const [t, setT] = useState(1)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef(null)

  const data = useMemo(() => generateData(n), [n])
  const vals = computeValues(n, t)

  const handleAnimate = useCallback(() => {
    if (animating) {
      clearTimeout(animRef.current)
      setAnimating(false)
      return
    }
    setAnimating(true)
    let idx = 0
    function step() {
      if (idx >= ANIMATE_SEQUENCE.length) {
        setAnimating(false)
        return
      }
      setN(ANIMATE_SEQUENCE[idx])
      idx++
      animRef.current = setTimeout(step, 600)
    }
    step()
  }, [animating])

  useEffect(() => {
    return () => clearTimeout(animRef.current)
  }, [])

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="cfl">
      <h4 className="cfl__title">
        Как произведение превращается в нормальную характеристическую функцию
      </h4>
      <p className="cfl__subtitle">
        Каждый множитель всё ближе к единице, но число множителей растёт.
        Их общий эффект стремится к{' '}
        <TeX>{'e^{-t^2/2}'}</TeX>.
      </p>

      <div className="cfl__layout">
        <div className="cfl__chart-area">
          <Chart data={data} n={n} selectedT={t} onTChange={setT} />
        </div>

        <div className="cfl__controls">
          <div className="cfl__control-group">
            <label htmlFor="cfl-n-slider" className="cfl__label">
              Размер суммы <TeX>{'n'}</TeX>
            </label>
            <input
              id="cfl-n-slider"
              type="range"
              min="1"
              max="500"
              value={n}
              onChange={(e) => {
                setN(Number(e.target.value))
                setAnimating(false)
                clearTimeout(animRef.current)
              }}
              aria-valuemin={1}
              aria-valuemax={500}
              aria-valuenow={n}
              aria-valuetext={`n равно ${n}`}
              className="cfl__slider"
            />
            <div className="cfl__quick-buttons">
              {QUICK_N.map((val) => (
                <button
                  key={val}
                  type="button"
                  className={
                    'cfl__quick' + (n === val ? ' cfl__quick--active' : '')
                  }
                  aria-pressed={n === val}
                  onClick={() => {
                    setN(val)
                    setAnimating(false)
                    clearTimeout(animRef.current)
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="cfl__control-group">
            <label htmlFor="cfl-t-slider" className="cfl__label">
              Точка <TeX>{'t'}</TeX> = {t.toFixed(1)}
            </label>
            <input
              id="cfl-t-slider"
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              aria-valuemin={-4}
              aria-valuemax={4}
              aria-valuenow={t}
              aria-valuetext={`t равно ${t.toFixed(1)}`}
              className="cfl__slider"
            />
          </div>

          {!reducedMotion && (
            <button
              type="button"
              className="cfl__animate-btn"
              onClick={handleAnimate}
            >
              {animating ? 'Остановить' : 'Показать приближение'}
            </button>
          )}

          <div className="cfl__values">
            <div className="cfl__val-row">
              <TeX>{`\\frac{t}{\\sqrt{n}} = \\frac{${t.toFixed(1)}}{\\sqrt{${n}}} \\approx ${vals.tOverSqrtN.toFixed(3)}`}</TeX>
            </div>
            <div className="cfl__val-row">
              <TeX>{`1 - \\frac{t^2}{2n} = ${vals.base.toFixed(3)}`}</TeX>
            </div>
            <div className="cfl__val-row">
              {vals.approxValid ? (
                <TeX>{`\\left(1 - \\frac{t^2}{2n}\\right)^{n} \\approx ${vals.approxValue.toFixed(4)}`}</TeX>
              ) : (
                <span className="cfl__out-of-range">
                  Вне локальной области приближения
                </span>
              )}
            </div>
            <div className="cfl__val-row">
              <TeX>{`e^{-t^2/2} \\approx ${vals.limitValue.toFixed(4)}`}</TeX>
            </div>
            {vals.approxValid && (
              <div className="cfl__val-row cfl__val-row--diff">
                Разница: {Math.abs(vals.approxValue - vals.limitValue).toFixed(4)}
              </div>
            )}
          </div>

          <p className="cfl__insight">
            При увеличении <TeX>{'n'}</TeX> разница уменьшается.
          </p>
        </div>
      </div>

      <MechanismCards n={n} t={t} />

      <div className="cfl__note">
        Квадратичное приближение используется около нуля. При малом{' '}
        <TeX>{'n'}</TeX> оно не предназначено для больших значений{' '}
        <TeX>{'|t|'}</TeX>.
      </div>
    </div>
  )
}

export default CharacteristicFunctionLimit
