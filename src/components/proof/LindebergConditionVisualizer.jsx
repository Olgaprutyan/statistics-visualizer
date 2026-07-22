import { useState, useMemo, useEffect, useCallback } from 'react'
import TeX from './TeX'

const QUICK_KN = [10, 30, 50, 100, 200]
const SIM_COUNT = 4000
const HIST_BINS = 41
const HIST_RANGE = 4.5

/* Простой детерминированный ГПСЧ (mulberry32) — воспроизводимая симуляция. */
function makeRng(seed) {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* Детерминированные показатели условия Линдеберга для заданных параметров. */
function computeMetrics({ scenario, termCount, epsilon, jumpSize, jumpProbability }) {
  if (scenario === 'lindeberg') {
    const smallTermMagnitude = 1 / Math.sqrt(termCount)
    const maxVarianceShare = 1 / termCount
    const lindebergValue = smallTermMagnitude > epsilon ? 1 : 0
    const largeShare = lindebergValue
    return {
      smallTermMagnitude,
      maxVarianceShare,
      lindebergValue,
      largeShare,
      jumpVariance: 0,
      smallVariance: maxVarianceShare,
      remainingVariance: 1,
    }
  }

  // scenario === 'violation'
  const jumpVariance = jumpProbability * jumpSize * jumpSize
  const remainingVariance = Math.max(0, 1 - jumpVariance)
  const smallVariance = remainingVariance / Math.max(1, termCount - 1)
  const smallTermMagnitude = Math.sqrt(smallVariance)

  const jumpContribution = jumpSize > epsilon ? jumpVariance : 0
  const smallContribution = smallTermMagnitude > epsilon ? remainingVariance : 0

  const lindebergValue = jumpContribution + smallContribution
  const maxVarianceShare = Math.max(jumpVariance, smallVariance)

  return {
    smallTermMagnitude,
    maxVarianceShare,
    lindebergValue,
    largeShare: lindebergValue,
    jumpVariance,
    smallVariance,
    remainingVariance,
  }
}

/* Схема нормированных слагаемых Y_{n,k}. */
function TermsSchema({ scenario, termCount, epsilon, jumpSize, metrics }) {
  const width = 460
  const height = 180
  const padTop = 20
  const padBottom = 26
  const halfH = (height - padTop - padBottom) / 2
  const midY = padTop + halfH

  const shownTerms = Math.min(termCount, 30)
  const truncated = termCount > 30

  // Масштаб по оси значений: покрываем диапазон до 2.4 в единицах Y.
  const valueRange = 2.4
  const scale = halfH / valueRange
  const clampH = (value) => Math.min(Math.abs(value), valueRange) * scale

  const epsY = clampH(epsilon)
  const smallBarH = clampH(metrics.smallTermMagnitude)
  const jumpBarH = clampH(jumpSize)

  const slot = (width - 44) / shownTerms
  const barW = Math.max(slot - 3, 2)

  return (
    <svg
      className="lcv-schema"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        scenario === 'lindeberg'
          ? `Схема слагаемых: ${shownTerms} малых столбцов одинаковой высоты`
          : 'Схема слагаемых: малые столбцы и одно доминирующее слагаемое'
      }
    >
      {/* нулевая ось */}
      <line x1="20" y1={midY} x2={width - 20} y2={midY} className="lcv-axis" />

      {/* границы epsilon */}
      <line x1="20" y1={midY - epsY} x2={width - 20} y2={midY - epsY} className="lcv-eps-line" />
      <line x1="20" y1={midY + epsY} x2={width - 20} y2={midY + epsY} className="lcv-eps-line" />
      <text x={width - 22} y={midY - epsY - 4} className="lcv-eps-label">+ε</text>
      <text x={width - 22} y={midY + epsY + 12} className="lcv-eps-label">−ε</text>

      {/* столбцы (симметричные относительно нуля) */}
      {Array.from({ length: shownTerms }, (_, i) => {
        const isJump = scenario === 'violation' && i === 0
        const barH = isJump ? jumpBarH : smallBarH
        const x = 24 + i * slot
        return (
          <rect
            key={i}
            x={x}
            y={midY - barH}
            width={barW}
            height={barH * 2}
            rx="1.5"
            className={isJump ? 'lcv-bar lcv-bar--jump' : 'lcv-bar'}
          />
        )
      })}

      {scenario === 'violation' && (
        <text x="24" y={height - 7} className="lcv-jump-note">
          ↑ Слагаемое с заметной долей дисперсии
        </text>
      )}
      {truncated && scenario === 'lindeberg' && (
        <text x="24" y={height - 7} className="lcv-trunc-note">
          Показаны 30 из {termCount} слагаемых
        </text>
      )}
    </svg>
  )
}

/* Разложение общей дисперсии на «малые» и «крупные». */
function VarianceBar({ largeShare }) {
  const small = Math.max(0, Math.min(1, 1 - largeShare))
  const large = Math.max(0, Math.min(1, largeShare))
  return (
    <div className="lcv-varbar">
      <div className="lcv-varbar__track">
        <div
          className="lcv-varbar__small"
          style={{ width: `${small * 100}%` }}
        />
        <div
          className="lcv-varbar__large"
          style={{ width: `${large * 100}%` }}
        />
      </div>
      <div className="lcv-varbar__labels">
        <span>Малые значения · {small.toFixed(3)}</span>
        <span>Крупные значения · {large.toFixed(3)}</span>
      </div>
    </div>
  )
}

/* График k_n ↦ L_n(ε) для обоих сценариев. */
function KnCurve({ scenario, termCount, epsilon, jumpSize, jumpProbability }) {
  const width = 300
  const height = 170
  const pad = { top: 14, right: 14, bottom: 30, left: 34 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  const knMin = 5
  const knMax = 200

  const xToPx = (kn) => pad.left + ((kn - knMin) / (knMax - knMin)) * plotW
  const yToPx = (y) => pad.top + (1 - Math.max(0, Math.min(1, y))) * plotH

  const { lindPath, violPath } = useMemo(() => {
    const lind = []
    const viol = []
    for (let kn = knMin; kn <= knMax; kn += 1) {
      const lindMetrics = computeMetrics({
        scenario: 'lindeberg',
        termCount: kn,
        epsilon,
        jumpSize,
        jumpProbability,
      })
      const violMetrics = computeMetrics({
        scenario: 'violation',
        termCount: kn,
        epsilon,
        jumpSize,
        jumpProbability,
      })
      lind.push(`${lind.length === 0 ? 'M' : 'L'}${xToPx(kn).toFixed(1)},${yToPx(lindMetrics.lindebergValue).toFixed(1)}`)
      viol.push(`${viol.length === 0 ? 'M' : 'L'}${xToPx(kn).toFixed(1)},${yToPx(violMetrics.lindebergValue).toFixed(1)}`)
    }
    return { lindPath: lind.join(' '), violPath: viol.join(' ') }
  }, [epsilon, jumpSize, jumpProbability])

  const markerX = xToPx(termCount)

  return (
    <svg
      className="lcv-kncurve"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="График доли дисперсии от крупных значений в зависимости от числа слагаемых"
    >
      {[0, 0.5, 1].map((y) => (
        <g key={y}>
          <line
            x1={pad.left}
            y1={yToPx(y)}
            x2={width - pad.right}
            y2={yToPx(y)}
            className="lcv-grid"
          />
          <text x={pad.left - 6} y={yToPx(y) + 3} className="lcv-tick lcv-tick--y">
            {y.toFixed(1)}
          </text>
        </g>
      ))}

      <path d={violPath} className="lcv-curve lcv-curve--viol" />
      <path d={lindPath} className="lcv-curve lcv-curve--lind" />

      <line
        x1={markerX}
        y1={pad.top}
        x2={markerX}
        y2={height - pad.bottom}
        className="lcv-marker"
      />

      {[5, 100, 200].map((kn) => (
        <text key={kn} x={xToPx(kn)} y={height - pad.bottom + 14} className="lcv-tick">
          {kn}
        </text>
      ))}
      <text x={pad.left + plotW / 2} y={height - 4} className="lcv-axis-label">
        Количество слагаемых kₙ
      </text>

      <g transform={`translate(${pad.left + 6}, ${pad.top + 2})`}>
        <line x1="0" y1="5" x2="16" y2="5" className="lcv-curve lcv-curve--lind" />
        <text x="20" y="8" className="lcv-legend">Линдеберг выполняется</text>
        <line x1="0" y1="19" x2="16" y2="19" className="lcv-curve lcv-curve--viol" />
        <text x="20" y="22" className="lcv-legend">Линдеберг нарушается</text>
      </g>
    </svg>
  )
}

/* Гистограмма нормированной суммы + плотность N(0,1). */
function SumHistogram({ scenario, termCount, jumpSize, jumpProbability, seed }) {
  const width = 320
  const height = 200
  const pad = { top: 14, right: 12, bottom: 28, left: 12 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  const bins = useMemo(() => {
    const rng = makeRng(seed * 2654435761 + termCount * 40503 + (scenario === 'violation' ? 7 : 1))
    const counts = new Array(HIST_BINS).fill(0)
    const binWidth = (2 * HIST_RANGE) / HIST_BINS

    const jumpVariance = jumpProbability * jumpSize * jumpSize
    const remainingVariance = Math.max(0, 1 - jumpVariance)
    const smallScale = Math.sqrt(remainingVariance / Math.max(1, termCount - 1))
    const rademacherScale = 1 / Math.sqrt(termCount)

    for (let s = 0; s < SIM_COUNT; s++) {
      let sum = 0
      if (scenario === 'lindeberg') {
        for (let k = 0; k < termCount; k++) {
          sum += (rng() < 0.5 ? -1 : 1) * rademacherScale
        }
      } else {
        // крупное слагаемое B
        const u = rng()
        if (u < jumpProbability / 2) sum += jumpSize
        else if (u < jumpProbability) sum += -jumpSize
        // остальные слагаемые Радемахера
        for (let k = 1; k < termCount; k++) {
          sum += (rng() < 0.5 ? -1 : 1) * smallScale
        }
      }
      const idx = Math.floor((sum + HIST_RANGE) / binWidth)
      if (idx >= 0 && idx < HIST_BINS) counts[idx]++
    }
    return { counts, binWidth }
  }, [scenario, termCount, jumpSize, jumpProbability, seed])

  const maxCount = Math.max(...bins.counts, 1)
  const slot = plotW / HIST_BINS

  const xToPx = (x) => pad.left + ((x + HIST_RANGE) / (2 * HIST_RANGE)) * plotW

  // плотность N(0,1), нормированная под масштаб гистограммы
  const normalPath = useMemo(() => {
    const pts = []
    const peak = 1 / Math.sqrt(2 * Math.PI)
    // высота колокола на графике = высота, соответствующая max доли в идеальном случае
    const expectedPeakFrac = peak * bins.binWidth
    const scaleY = plotH / (Math.max(maxCount / SIM_COUNT, expectedPeakFrac) * 1.1)
    for (let i = 0; i <= 100; i++) {
      const x = -HIST_RANGE + (2 * HIST_RANGE) * (i / 100)
      const density = peak * Math.exp(-(x * x) / 2)
      const frac = density * bins.binWidth
      const px = xToPx(x)
      const py = pad.top + plotH - frac * scaleY
      pts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [bins, maxCount, plotH])

  const barScaleY = plotH / ((maxCount / SIM_COUNT) * 1.1)

  return (
    <svg
      className="lcv-hist"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        scenario === 'lindeberg'
          ? 'Гистограмма нормированной суммы, приближающаяся к нормальной кривой'
          : 'Гистограмма нормированной суммы с отклонениями от нормальной кривой'
      }
    >
      <line
        x1={pad.left}
        y1={pad.top + plotH}
        x2={width - pad.right}
        y2={pad.top + plotH}
        className="lcv-axis"
      />
      {bins.counts.map((c, i) => {
        const frac = c / SIM_COUNT
        const h = frac * barScaleY
        return (
          <rect
            key={i}
            x={pad.left + i * slot + 0.5}
            y={pad.top + plotH - h}
            width={Math.max(slot - 1, 1)}
            height={h}
            className="lcv-hist-bar"
          />
        )
      })}
      <path d={normalPath} className="lcv-normal" />
      <text x={xToPx(0)} y={height - 4} className="lcv-axis-label" textAnchor="middle">
        Sₙ = Σ Yₙ,ₖ
      </text>
    </svg>
  )
}

function LindebergConditionVisualizer() {
  const [scenario, setScenario] = useState('lindeberg')
  const [termCount, setTermCount] = useState(30)
  const [epsilon, setEpsilon] = useState(0.8)
  const [jumpSize, setJumpSize] = useState(3)
  const [jumpProbability, setJumpProbability] = useState(0.08)
  const [seed, setSeed] = useState(1)

  const maxJumpSize = useMemo(
    () => Math.sqrt(0.95 / jumpProbability),
    [jumpProbability],
  )

  // ограничиваем размер скачка, чтобы p·a² < 1
  useEffect(() => {
    if (jumpSize > maxJumpSize) {
      setJumpSize(Math.round(maxJumpSize * 10) / 10)
    }
  }, [jumpProbability, maxJumpSize, jumpSize])

  const metrics = useMemo(
    () => computeMetrics({ scenario, termCount, epsilon, jumpSize, jumpProbability }),
    [scenario, termCount, epsilon, jumpSize, jumpProbability],
  )

  const status = useMemo(() => {
    const v = metrics.lindebergValue
    if (v < 0.01) return 'Крупные значения почти не участвуют в общей дисперсии.'
    if (v < 0.1) return 'Крупные значения всё ещё дают небольшой вклад в общую дисперсию.'
    return 'Редкие крупные скачки сохраняют заметную долю общей дисперсии.'
  }, [metrics.lindebergValue])

  // В режиме выполнения условия max_k v_{n,k} = 1/k_n → 0 (Феллер выполнен).
  // В режиме нарушения крупное слагаемое сохраняет долю ≥ p·a², которая не
  // уменьшается при росте k_n.
  const fellerStatus =
    scenario === 'lindeberg'
      ? 'Каждое отдельное слагаемое становится пренебрежимо малым'
      : 'Одно слагаемое сохраняет заметную долю дисперсии'

  return (
    <div className="lcv">
      <h4 className="lcv__title">Когда отдельный скачок перестаёт быть важным?</h4>
      <p className="lcv__subtitle">
        Условие Линдеберга проверяет, исчезает ли доля общей дисперсии,
        связанная с крупными значениями отдельных слагаемых. Здесь
        показаны уже нормированные слагаемые{' '}
        <TeX>{'Y_{n,k} = X_{n,k} / s_n'}</TeX>.
      </p>

      <div className="lcv__scenario" role="group" aria-label="Сценарий">
        <button
          type="button"
          className={
            'lcv__scenario-btn' +
            (scenario === 'lindeberg' ? ' lcv__scenario-btn--active' : '')
          }
          aria-pressed={scenario === 'lindeberg'}
          onClick={() => setScenario('lindeberg')}
        >
          Линдеберг выполняется
        </button>
        <button
          type="button"
          className={
            'lcv__scenario-btn' +
            (scenario === 'violation' ? ' lcv__scenario-btn--active' : '')
          }
          aria-pressed={scenario === 'violation'}
          onClick={() => setScenario('violation')}
        >
          Линдеберг нарушается
        </button>
      </div>

      <div className="lcv__controls">
        <div className="lcv__control">
          <label htmlFor="lcv-kn" className="lcv__label">
            Количество слагаемых kₙ = {termCount}
          </label>
          <input
            id="lcv-kn"
            type="range"
            min="5"
            max="200"
            step="1"
            value={termCount}
            onChange={(e) => setTermCount(Number(e.target.value))}
            aria-valuemin={5}
            aria-valuemax={200}
            aria-valuenow={termCount}
            aria-valuetext={`kₙ равно ${termCount}`}
            className="lcv__slider"
          />
          <div className="lcv__quick">
            {QUICK_KN.map((val) => (
              <button
                key={val}
                type="button"
                className={
                  'lcv__quick-btn' +
                  (termCount === val ? ' lcv__quick-btn--active' : '')
                }
                aria-pressed={termCount === val}
                onClick={() => setTermCount(val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="lcv__control">
          <label htmlFor="lcv-eps" className="lcv__label">
            Порог крупного значения ε = {epsilon.toFixed(1)}
          </label>
          <input
            id="lcv-eps"
            type="range"
            min="0.2"
            max="2"
            step="0.1"
            value={epsilon}
            onChange={(e) => setEpsilon(Number(e.target.value))}
            aria-valuemin={0.2}
            aria-valuemax={2}
            aria-valuenow={epsilon}
            aria-valuetext={`ε равно ${epsilon.toFixed(1)}`}
            className="lcv__slider"
          />
        </div>

        {scenario === 'violation' && (
          <>
            <div className="lcv__control">
              <label htmlFor="lcv-jump" className="lcv__label">
                Размер редкого скачка a = {jumpSize.toFixed(1)}
              </label>
              <input
                id="lcv-jump"
                type="range"
                min="1"
                max="6"
                step="0.1"
                value={jumpSize}
                onChange={(e) =>
                  setJumpSize(Math.min(Number(e.target.value), maxJumpSize))
                }
                aria-valuemin={1}
                aria-valuemax={6}
                aria-valuenow={jumpSize}
                aria-valuetext={`размер скачка ${jumpSize.toFixed(1)}`}
                className="lcv__slider"
              />
              <p className="lcv__hint">
                Параметры ограничены так, чтобы общая дисперсия оставалась
                равной 1 (<TeX>{'p a^2 < 1'}</TeX>).
              </p>
            </div>

            <div className="lcv__control">
              <label htmlFor="lcv-prob" className="lcv__label">
                Вероятность скачка p = {jumpProbability.toFixed(2)}
              </label>
              <input
                id="lcv-prob"
                type="range"
                min="0.01"
                max="0.25"
                step="0.01"
                value={jumpProbability}
                onChange={(e) => setJumpProbability(Number(e.target.value))}
                aria-valuemin={0.01}
                aria-valuemax={0.25}
                aria-valuenow={jumpProbability}
                aria-valuetext={`вероятность скачка ${jumpProbability.toFixed(2)}`}
                className="lcv__slider"
              />
            </div>
          </>
        )}
      </div>

      <div className="lcv__main">
        <div className="lcv__left">
          <p className="lcv__caption">
            Каждый прямоугольник — одно нормированное слагаемое{' '}
            <TeX>{'Y_{n,k}'}</TeX>; его высота показывает типичный размер
            этого слагаемого.
          </p>
          <TermsSchema
            scenario={scenario}
            termCount={termCount}
            epsilon={epsilon}
            jumpSize={jumpSize}
            metrics={metrics}
          />
          <p className="lcv__caption">
            Значения за границами <TeX>{'\\pm\\varepsilon'}</TeX> считаются
            крупными.
          </p>

          <VarianceBar largeShare={metrics.largeShare} />

          <div className="lcv__metrics">
            <div className="lcv__metric">
              <span className="lcv__metric-label">
                Показатель Линдеберга <TeX>{'L_n(\\varepsilon)'}</TeX>
              </span>
              <span className="lcv__metric-value">
                {metrics.lindebergValue.toFixed(3)}
              </span>
              <span className="lcv__metric-status">{status}</span>
            </div>
            <div className="lcv__metric">
              <span className="lcv__metric-label">
                Наибольшая доля дисперсии одного слагаемого
              </span>
              <span className="lcv__metric-value">
                {metrics.maxVarianceShare.toFixed(3)}
              </span>
              <span className="lcv__metric-status">{fellerStatus}</span>
            </div>
          </div>

          <KnCurve
            scenario={scenario}
            termCount={termCount}
            epsilon={epsilon}
            jumpSize={jumpSize}
            jumpProbability={jumpProbability}
          />
        </div>

        <div className="lcv__right">
          <SumHistogram
            scenario={scenario}
            termCount={termCount}
            jumpSize={jumpSize}
            jumpProbability={jumpProbability}
            seed={seed}
          />
          <p className="lcv__caption">
            Гистограмма <TeX>{'S_n'}</TeX> и плотность{' '}
            <TeX>{'\\tfrac{1}{\\sqrt{2\\pi}} e^{-x^2/2}'}</TeX>.
          </p>
          <button
            type="button"
            className="lcv__resim"
            onClick={() => setSeed((s) => s + 1)}
          >
            Повторить симуляцию
          </button>
          {scenario === 'violation' && (
            <p className="lcv__explain">
              Многие малые слагаемые создают почти нормальную центральную
              часть, но крупный скачок сдвигает часть распределения вправо
              или влево. Поэтому итоговая форма не обязана становиться
              стандартной нормальной.
            </p>
          )}
        </div>
      </div>

      <div className="lcv__cards">
        <div className="lcv__card">
          <span className="lcv__card-title">Много независимых вкладов</span>
          <TeX block>{'S_n = \\sum_k Y_{n,k}'}</TeX>
          <span className="lcv__card-hint">
            Общая дисперсия нормирована к единице
          </span>
        </div>
        <span className="lcv__card-arrow" aria-hidden="true">→</span>
        <div className="lcv__card">
          <span className="lcv__card-title">Крупные скачки исчезают</span>
          <TeX block>{'L_n(\\varepsilon) \\to 0'}</TeX>
          <span className="lcv__card-hint">
            Дисперсия создаётся малыми значениями
          </span>
        </div>
        <span className="lcv__card-arrow" aria-hidden="true">→</span>
        <div className="lcv__card">
          <span className="lcv__card-title">Возникает нормальный предел</span>
          <TeX block>{'S_n \\xrightarrow{d} N(0,1)'}</TeX>
          <span className="lcv__card-hint">
            Ни одно слагаемое не определяет форму суммы
          </span>
        </div>
      </div>
    </div>
  )
}

export default LindebergConditionVisualizer
