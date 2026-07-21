import { useState } from 'react'

/*
 * Демонстрация для четвёртого момента: вклад одиночных четвёртых степеней
 * бледнеет, а вклад пар приближается к 3. Значение E[Y⁴] = 9 — выбранный
 * пример, а не общее условие ЦПТ. Состояние не сохраняется.
 */

const SAMPLE_SIZES = [10, 50, 200, 1000]
const EXAMPLE_FOURTH_MOMENT = 9
const AXIS_MAX = 4

function format(value) {
  return value.toFixed(3).replace('.', ',')
}

function FourthMomentVisualizer() {
  const [sampleSize, setSampleSize] = useState(10)

  const singlesPart = EXAMPLE_FOURTH_MOMENT / sampleSize
  const pairsPart = 3 * ((sampleSize - 1) / sampleSize)
  const total = singlesPart + pairsPart

  const singlesOpacity = Math.max(
    0.16,
    Math.min(1, singlesPart / (EXAMPLE_FOURTH_MOMENT / 10)),
  )

  return (
    <figure className="fmv">
      <figcaption className="fmv__head">
        <h4>Четвёртый момент приближается к 3</h4>
        <p>
          Вклад одиночных четвёртых степеней бледнеет, а вклад пар
          стремится к нормальному пределу 3.
        </p>
      </figcaption>

      <div className="fmv-sizes" role="group" aria-label="Размер выборки">
        {SAMPLE_SIZES.map((size) => (
          <button
            className={
              size === sampleSize
                ? 'ipv-order-btn ipv-order-btn--active'
                : 'ipv-order-btn'
            }
            type="button"
            key={size}
            aria-pressed={size === sampleSize}
            onClick={() => setSampleSize(size)}
          >
            n = {size}
          </button>
        ))}
      </div>

      <div className="fmv-track">
        <span
          className="fmv-limit"
          style={{ left: `${(3 / AXIS_MAX) * 100}%` }}
        >
          <span className="fmv-limit__label">Нормальный предел: 3</span>
        </span>

        <div className="fmv-row">
          <span className="fmv-row__label">Вклад пар</span>
          <span className="fmv-row__track">
            <span
              className="fmv-row__fill fmv-row__fill--pairs"
              style={{ width: `${(pairsPart / AXIS_MAX) * 100}%` }}
            />
          </span>
          <strong className="fmv-row__value">{format(pairsPart)}</strong>
        </div>

        <div className="fmv-row">
          <span className="fmv-row__label">
            Вклад E[Yᵢ⁴]
          </span>
          <span className="fmv-row__track">
            <span
              className="fmv-row__fill fmv-row__fill--singles"
              style={{
                width: `${(singlesPart / AXIS_MAX) * 100}%`,
                opacity: singlesOpacity,
              }}
            />
          </span>
          <strong className="fmv-row__value">{format(singlesPart)}</strong>
        </div>
      </div>

      <div className="fmv-total">
        <span>Сумма</span>
        <strong>{format(total)}</strong>
      </div>

      <p className="fmv-note">
        Здесь E[Y⁴] = 9 — выбранный пример четвёртого момента исходного
        распределения, а не общее условие центральной предельной теоремы.
      </p>
    </figure>
  )
}

export default FourthMomentVisualizer
