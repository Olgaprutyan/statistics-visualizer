import { useChapter } from '../ChapterContext'
import TeX from '../components/proof/TeX'
import IntroPrediction from '../components/probability-data/IntroPrediction'
import SingleSampleExperiment from '../components/probability-data/SingleSampleExperiment'
import RepeatedSamplesExperiment from '../components/probability-data/RepeatedSamplesExperiment'
import SampleSizeComparison from '../components/probability-data/SampleSizeComparison'
import SamplingVariabilityExplanation from '../components/probability-data/SamplingVariabilityExplanation'
import ProbabilityDataExercises from '../components/probability-data/ProbabilityDataExercises'

function ProbabilityAndDataPage() {
  const { goToChapter } = useChapter()

  return (
    <main className="main-content">
      <section className="lesson-intro" id="pd-intro">
        <div className="chapter-eyebrow">
          <span className="chapter-eyebrow__num">Глава 1</span>
          <span className="chapter-eyebrow__rule" aria-hidden="true" />
          <span className="chapter-eyebrow__name">Вероятность и данные</span>
        </div>

        <h1>От наблюдений к случайной выборке</h1>

        <h2>
          Почему два исследования, проведённые одинаковым способом, могут
          дать разные результаты?
        </h2>

        <p className="lesson-intro__description">
          Когда мы анализируем данные, перед нами обычно находится только
          часть интересующей нас совокупности. Мы можем опросить несколько
          сотен людей, наблюдать продажи в течение ограниченного периода или
          изучить пациентов нескольких клиник.
        </p>

        <p className="lesson-intro__description">
          Если повторить процедуру сбора данных, в выборку, скорее всего,
          попадут другие наблюдения. Поэтому изменятся и сами данные, и
          рассчитанные по ним характеристики.
        </p>

        <p className="lesson-intro__description">
          В этой части мы разберёмся, что именно считается случайным до сбора
          выборки и почему результаты меняются между повторениями
          исследования.
        </p>

        <IntroPrediction />
      </section>

      <section className="content-section" id="sample-and-population">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 1</p>
            <h2>Почему одной выборки недостаточно?</h2>
          </div>
        </div>

        <p className="section-lead">
          Мы хотим узнать характеристику большой совокупности, но обычно
          наблюдаем только небольшую её часть.
        </p>

        <p className="section-lead">
          В университете учатся 10 000 студентов. Нас интересует среднее число
          часов сна в будний день. Опросить всех студентов нельзя, поэтому
          исследователь случайно выбирает часть из них.
        </p>

        <div className="pd-defs">
          <div className="pd-def">
            <h4>Генеральная совокупность</h4>
            <p>Все объекты, о которых исследователь хочет сделать вывод.</p>
          </div>
          <div className="pd-def">
            <h4>Выборка</h4>
            <p>Наблюдения, которые фактически были собраны.</p>
          </div>
          <div className="pd-def">
            <h4>Выборочное среднее</h4>
            <p>Среднее значение, рассчитанное по наблюдаемой выборке.</p>
          </div>
        </div>

        <details className="pd-details">
          <summary>Формальная запись</summary>
          <div className="pd-details__body">
            <TeX block>{'x_1, x_2, \\ldots, x_n'}</TeX>
            <TeX block>
              {'\\bar x = \\frac{x_1 + \\ldots + x_n}{n}.'}
            </TeX>
            <p>
              Маленькие буквы <TeX>{'x_1, \\ldots, x_n'}</TeX> обозначают
              уже полученные значения. Число <TeX>{'\\bar x'}</TeX> — среднее
              конкретной наблюдаемой выборки.
            </p>
          </div>
        </details>

        <SingleSampleExperiment />
      </section>

      <section className="content-section" id="what-is-random">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 2</p>
            <h2>Что именно случайно до сбора выборки?</h2>
          </div>
        </div>

        <p className="section-lead">
          В статистике случайность не обязательно означает хаос или отсутствие
          причин. Смысл в том, что до проведения процедуры мы не знаем её
          конкретный результат.
        </p>

        <div className="pd-columns">
          <div className="pd-column">
            <h4>До сбора данных</h4>
            <p>Мы можем знать:</p>
            <ul>
              <li>из какой совокупности берётся выборка;</li>
              <li>размер выборки;</li>
              <li>правило отбора;</li>
              <li>какие переменные измеряются.</li>
            </ul>
            <p>Но мы не знаем:</p>
            <ul>
              <li>какие наблюдения попадут в выборку;</li>
              <li>какие значения будут получены;</li>
              <li>чему окажется равно выборочное среднее;</li>
              <li>насколько оно отклонится от среднего в совокупности.</li>
            </ul>
          </div>

          <div className="pd-column">
            <h4>После сбора данных</h4>
            <p>Мы уже наблюдаем конкретные значения:</p>
            <TeX block>{'x_1, x_2, \\ldots, x_n.'}</TeX>
            <p>
              Они зафиксированы. Однако при повторении процедуры могли бы быть
              получены другие значения.
            </p>
          </div>
        </div>

        <p className="pd-highlight">
          Случайной считается процедура и её ещё не наблюдавшийся результат.
          После реализации процедуры мы работаем с конкретными
          зафиксированными данными.
        </p>

        <div className="pd-definition-block">
          <strong>Переход к случайным величинам</strong>
          <p>
            До сбора выборки значения удобно обозначать заглавными буквами:
          </p>
          <TeX block>{'X_1, X_2, \\ldots, X_n.'}</TeX>
          <p>
            Заглавные буквы <TeX>{'X_1, \\ldots, X_n'}</TeX> обозначают
            значения до того, как мы их наблюдали. Они рассматриваются как
            случайные величины.
          </p>
          <TeX block>
            {'X_1=x_1,\\quad X_2=x_2,\\quad \\ldots,\\quad X_n=x_n.'}
          </TeX>
          <p>
            Маленькие буквы обозначают конкретный реализовавшийся результат:
            наблюдаемые значения, или реализации случайных величин.
          </p>
        </div>

        <RepeatedSamplesExperiment />
      </section>

      <section className="content-section" id="sampling-variability">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 3</p>
            <h2>Почему результаты меняются между выборками?</h2>
          </div>
        </div>

        <p className="section-lead">
          Различия между результатами, рассчитанными по разным случайным
          выборкам, называют выборочной изменчивостью.
        </p>

        <p className="section-lead">
          Неустойчивость результата не обязательно означает ошибку
          исследования. Даже корректная процедура отбора обычно даёт разные
          наблюдения при повторении.
        </p>

        <div className="pd-definition-block">
          <strong>Выборочная изменчивость</strong>
          <p>
            Изменение значения выборочной статистики при переходе от одной
            случайной выборки к другой.
          </p>
        </div>

        <p className="section-lead">
          Выборочной статистикой может быть среднее, медиана, доля,
          коэффициент корреляции, разность средних или коэффициент регрессии.
          В текущем эксперименте мы будем использовать среднее.
        </p>

        <p className="section-lead">
          Когда мы многократно повторяем одну и ту же процедуру, получаем
          распределение выборочной статистики — множество возможных значений,
          которые могла бы принять статистика до наблюдения данных.
        </p>

        <SampleSizeComparison />
      </section>

      <section className="content-section" id="intuition">
        <div className="section-heading">
          <div>
            <p className="section-label">Интуитивное объяснение</p>
            <h2>Почему размер выборки важен</h2>
          </div>
        </div>

        <p className="section-lead">
          Выборочное среднее складывается из вкладов всех наблюдений. В
          выборке размера <TeX>{'n'}</TeX> каждое наблюдение входит в среднее
          с весом <TeX>{'1/n'}</TeX>.
        </p>

        <p className="section-lead">
          Поэтому в маленькой выборке отдельное необычное значение может
          заметно сдвинуть результат. В большой выборке вес одного наблюдения
          меньше.
        </p>

        <div className="pd-weight-grid">
          <div className="pd-weight-card">
            <strong>n = 5</strong>
            <span>Вес одного наблюдения: 1/5</span>
          </div>
          <div className="pd-weight-card">
            <strong>n = 100</strong>
            <span>Вес одного наблюдения: 1/100</span>
          </div>
        </div>

        <SamplingVariabilityExplanation />
      </section>

      <section className="content-section" id="formal-summary">
        <div className="section-heading">
          <div>
            <p className="section-label">Формальная запись</p>
            <h2>Запишем идею формально</h2>
          </div>
        </div>

        <p className="section-lead">
          До сбора данных наблюдения обозначаются случайными величинами
        </p>

        <TeX block>{'X_1, \\ldots, X_n.'}</TeX>

        <p className="section-lead">Их выборочное среднее</p>

        <TeX block>
          {'\\bar X = \\frac{1}{n}\\sum_{i=1}^{n}X_i'}
        </TeX>

        <p className="section-lead">
          также является случайной величиной. До проведения выборки её
          значение неизвестно.
        </p>

        <p className="section-lead">
          После сбора конкретной выборки получаем:
        </p>

        <TeX block>
          {'\\bar x = \\frac{1}{n}\\sum_{i=1}^{n}x_i.'}
        </TeX>

        <p className="pd-note">
          <TeX>{'\\bar X'}</TeX> обозначает случайное выборочное среднее до
          наблюдения данных, а <TeX>{'\\bar x'}</TeX> — конкретное
          рассчитанное значение после сбора выборки.
        </p>

        <p className="section-lead">
          Если наблюдения независимы и имеют одинаковую дисперсию{' '}
          <TeX>{'\\sigma^2'}</TeX>, то
        </p>

        <TeX block>
          {'\\operatorname{Var}(\\bar X)=\\frac{\\sigma^2}{n}.'}
        </TeX>

        <p className="pd-note">
          С ростом размера выборки дисперсия случайного выборочного среднего
          уменьшается. Это формальная запись того, что большие выборки обычно
          дают более устойчивые оценки.
        </p>

        <details className="pd-details">
          <summary>Откуда берётся σ²/n?</summary>
          <div className="pd-details__body">
            <TeX block>
              {'\\operatorname{Var}\\left(\\frac{1}{n}\\sum_{i=1}^{n}X_i\\right)=\\frac{1}{n^2}\\operatorname{Var}\\left(\\sum_{i=1}^{n}X_i\\right).'}
            </TeX>

            <p>При независимости:</p>

            <TeX block>
              {'\\operatorname{Var}\\left(\\sum_{i=1}^{n}X_i\\right)=\\sum_{i=1}^{n}\\operatorname{Var}(X_i)=n\\sigma^2.'}
            </TeX>

            <p>Следовательно:</p>

            <TeX block>
              {'\\operatorname{Var}(\\bar X)=\\frac{n\\sigma^2}{n^2}=\\frac{\\sigma^2}{n}.'}
            </TeX>
          </div>
        </details>
      </section>

      <section className="content-section" id="check-understanding">
        <div className="section-heading">
          <div>
            <p className="section-label">Проверка понимания</p>
            <h2>Задания</h2>
          </div>
        </div>

        <ProbabilityDataExercises />
      </section>

      <section className="content-section" id="key-takeaways">
        <div className="section-heading">
          <div>
            <p className="section-label">Итог части</p>
            <h2>Что нужно запомнить</h2>
          </div>
        </div>

        <ol className="pd-takeaways">
          <li>Выборка — это часть изучаемой совокупности.</li>
          <li>
            До сбора данных мы не знаем, какие наблюдения попадут в выборку.
          </li>
          <li>После сбора выборки наблюдаемые значения зафиксированы.</li>
          <li>
            При повторении той же процедуры можно получить другую выборку.
          </li>
          <li>
            Поэтому выборочное среднее и другие статистики меняются между
            выборками.
          </li>
          <li>Эти различия называются выборочной изменчивостью.</li>
          <li>Большие выборки обычно дают более устойчивые результаты.</li>
        </ol>
      </section>

      <section className="content-section pd-next" id="pd-next">
        <h2>Зачем нужна вероятность?</h2>
        <p>
          Мы увидели, что до сбора выборки её точный результат неизвестен. При
          повторении одной и той же процедуры возможны разные выборки и разные
          значения статистик.
        </p>
        <p>
          Теперь нужен язык, который позволит описывать множество возможных
          результатов, сравнивать их и говорить, какие из них более или менее
          ожидаемы.
        </p>
        <p>Этим языком является вероятность.</p>

        <button
          type="button"
          className="primary-button"
          onClick={() => goToChapter('probability-language')}
        >
          Следующая часть: вероятность как язык неопределённости
        </button>
      </section>
    </main>
  )
}

export default ProbabilityAndDataPage
