import { usePersistentState } from '../../usePersistentState'

/*
 * §8.3. «Определи процедуру и результат».
 * Учебная цель: показать, что множество возможных исходов зависит от того,
 * как сформулирована процедура и что именно регистрируется.
 * Случайные данные здесь НЕ генерируются — только переключение сценариев.
 */

const SCENARIOS = [
  {
    id: 'respondent',
    tab: 'Один респондент',
    procedure:
      'Случайно выбрать одного респондента и записать, поддерживает ли он предложение.',
    variable: 'Отношение к предложению',
    outcomes: ['Поддерживает', 'Не поддерживает'],
    note: 'Возможных результатов всего два: множество исходов конечно.',
  },
  {
    id: 'firm',
    tab: 'Одна фирма',
    procedure: 'Случайно выбрать одну фирму и записать число её сотрудников.',
    variable: 'Число сотрудников',
    outcomes: ['0', '1', '2', '3', '…'],
    note: 'Множество возможных результатов может быть большим или теоретически неограниченным: любое целое неотрицательное число.',
  },
  {
    id: 'sales',
    tab: 'Один день продаж',
    procedure: 'Выбрать один день и записать объём продаж.',
    variable: 'Объём продаж',
    outcomes: ['Любое допустимое неотрицательное значение в выбранных единицах'],
    note: 'Результат измеряется непрерывной величиной: возможных значений бесконечно много.',
  },
]

function PossibleOutcomesExplorer() {
  const [scenarioId, setScenarioId] = usePersistentState(
    'pl.outcomes.scenario',
    'respondent',
  )

  const scenario =
    SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]

  return (
    <div className="pd-exp">
      <div className="pviz__group" role="group" aria-label="Выбор сценария">
        {SCENARIOS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              'pviz__btn' +
              (item.id === scenario.id ? ' pviz__btn--active' : '')
            }
            aria-pressed={item.id === scenario.id}
            onClick={() => setScenarioId(item.id)}
          >
            {item.tab}
          </button>
        ))}
      </div>

      <div className="pl-scenario">
        <div className="pl-scenario__row">
          <span className="pl-scenario__key">Процедура</span>
          <span className="pl-scenario__value">{scenario.procedure}</span>
        </div>
        <div className="pl-scenario__row">
          <span className="pl-scenario__key">Что измеряем</span>
          <span className="pl-scenario__value">{scenario.variable}</span>
        </div>
        <div className="pl-scenario__row">
          <span className="pl-scenario__key">Возможные результаты</span>
          <span className="pl-scenario__value">
            <span className="pl-outcome-chips">
              {scenario.outcomes.map((outcome, index) => (
                <span className="pl-outcome-chip" key={index}>
                  {outcome}
                </span>
              ))}
            </span>
          </span>
        </div>
      </div>

      <p className="pd-exp__hint">{scenario.note}</p>
    </div>
  )
}

export default PossibleOutcomesExplorer
