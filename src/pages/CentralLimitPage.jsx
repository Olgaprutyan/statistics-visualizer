import TeX from '../components/proof/TeX'
import ExperimentPanel from '../components/ExperimentPanel'
import PredictionCard from '../components/PredictionCard'
import OutlierImpact from '../components/OutlierImpact'
import MiniLab from '../components/MiniLab'
import SamplingBuilder from '../components/SamplingBuilder'
import CombinationsLab from '../components/CombinationsLab'
import SpreadShrink from '../components/SpreadShrink'
import SummaryGather from '../components/SummaryGather'
import WhyItWorks from '../components/WhyItWorks'

function CentralLimitPage() {
  return (
      <main className="main-content">
        <section className="lesson-intro" id="question">
          <div className="chapter-eyebrow">
            <span className="chapter-eyebrow__num">Тема 3</span>
            <span className="chapter-eyebrow__rule" aria-hidden="true" />
            <span className="chapter-eyebrow__name">
              Центральная предельная теорема
            </span>
          </div>

          <h1>Почему среднее становится нормальным?</h1>

          <p className="lesson-intro__description">
            Представь, что мы много раз проводим один и тот же
            эксперимент. Каждый раз мы случайно выбираем несколько
            наблюдений, вычисляем их среднее и записываем результат. Если
            повторить это тысячи раз, получится новое распределение —
            распределение выборочных средних.
          </p>

          <p className="lesson-intro__description">
            Самое удивительное начинается дальше. Даже если исходные
            данные совсем не похожи на нормальное распределение,
            распределение средних постепенно приобретает знакомую форму
            колокола. Почему так происходит? Давай сначала посмотрим на
            это своими глазами, а уже потом разберёмся, откуда берётся
            этот результат.
          </p>
        </section>

        <section className="content-section" id="means-intro">
          <div className="section-heading">
            <div>
              <p className="section-label">Введение</p>

              <h2>Посмотрим на выборочные средние</h2>
            </div>
          </div>

          <p className="section-lead">
            Прежде чем говорить о теореме, давай проведём небольшой
            эксперимент. Мы будем много раз брать случайную выборку из
            одного и того же распределения. Для каждой выборки вычислим
            среднее значение и запишем его. После тысяч повторений
            получится новое распределение — распределение выборочных
            средних.
          </p>

          <p className="experiment-transition">
            Компьютер много раз создаст новую случайную выборку, вычислит
            её среднее и сохранит результат. Так мы увидим распределение
            возможных значений выборочного среднего.
          </p>
        </section>

        <section className="experiment-section" id="experiment">
          <div className="section-heading">
            <div>
              <p className="section-label">Интерактивный эксперимент</p>

              <h2>Проведём эксперимент</h2>
            </div>
          </div>

          <PredictionCard />

          <ExperimentPanel />

          <div className="whats-next">
            <h3>Что сейчас произошло?</h3>

            <div className="info-card-row">
              <article className="info-card">
                <h4>Что показано</h4>

                <ul>
                  <li>это не распределение исходных данных;</li>
                  <li>
                    это распределение возможных выборочных средних.
                  </li>
                </ul>
              </article>

              <article className="info-card">
                <h4>Как оно строилось</h4>

                <ol>
                  <li>создать выборку;</li>
                  <li>вычислить среднее;</li>
                  <li>повторить тысячи раз.</li>
                </ol>
              </article>

              <article className="info-card">
                <h4>Зачем это нужно</h4>

                <ul>
                  <li>понять устойчивость среднего;</li>
                  <li>позже построить доверительные интервалы;</li>
                  <li>позже проверять гипотезы.</li>
                </ul>
              </article>
            </div>
          </div>

          <div className="motivation-card">
            <h3>Почему нас вообще интересуют выборочные средние?</h3>

            <p>
              Представь, что ты хочешь узнать средний рост студентов
              университета. Измерить всех студентов невозможно, поэтому ты
              случайно выбираешь 30 человек и считаешь их средний рост.
              Получилось 174,8 см.
            </p>

            <p>
              Но насколько можно доверять этому числу? Если завтра выбрать
              других 30 студентов, средний рост, скорее всего, получится
              немного другим. Каждая новая случайная выборка даёт своё
              среднее — значит, выборочное среднее тоже зависит от
              случайности.
            </p>

            <p>
              Мы хотим понять, насколько сильно средние могут отличаться
              друг от друга. Для этого нужно представить, что мы проводим
              одно и то же исследование снова и снова, каждый раз набирая
              новую выборку. Собирать тысячи настоящих выборок долго и
              дорого — поэтому мы попросили компьютер сделать это за нас.
            </p>

            <p className="key-point">
              Мы изучаем, как могло бы меняться наше среднее, если бы
              исследование повторялось снова и снова.
            </p>
          </div>
        </section>

        <section className="content-section" id="mini-lab">
          <div className="section-heading">
            <div>
              <p className="section-label">Исследование</p>
              <h2>Мини-лаборатория</h2>
            </div>
          </div>

          <p className="section-lead">
            Меняй только размер выборки и наблюдай, как меняется
            распределение выборочных средних.
          </p>

          <MiniLab />
        </section>

        <section className="content-section" id="build-up">
          <div className="section-heading">
            <div>
              <p className="section-label">Интерактив</p>
              <h2>Как рождается распределение выборочных средних?</h2>
            </div>
          </div>

          <p className="section-lead">
            Сейчас мы будем много раз проводить одно и то же
            исследование. Каждый раз компьютер будет случайно выбирать
            новую выборку, вычислять её среднее и добавлять это среднее
            на гистограмму. Попробуй проследить, как постепенно возникает
            распределение выборочных средних.
          </p>

          <SamplingBuilder />
        </section>

        <section className="content-section" id="center-height">
          <div className="section-heading">
            <div>
              <p className="section-label">Интерактив</p>
              <h2>Почему центр самый высокий?</h2>
            </div>
          </div>

          <p className="section-lead">
            Рассмотрим простой случай. Пусть каждое наблюдение может
            принимать только два значения: 0 (маленькое) или 2 (большое).
            Посмотрим, сколько разных способов дают одно и то же
            выборочное среднее.
          </p>

          <CombinationsLab />
        </section>

        <section className="content-section" id="stability">
          <div className="section-heading">
            <p className="section-number">03</p>

            <div>
              <p className="section-label">Устойчивость</p>
              <h2>Почему средние становятся стабильнее?</h2>
            </div>
          </div>

          <p className="section-lead">
            Одно отдельное наблюдение может случайно оказаться очень
            большим или очень маленьким.
          </p>

          <p className="stability-text">
            Но среднее объединяет несколько наблюдений. Если одно
            значение оказалось слишком большим, другие значения могут
            частично компенсировать его влияние.
          </p>

          <p className="stability-text">
            Чем больше наблюдений входит в среднее, тем труднее одной
            необычной точке сильно сдвинуть результат.
          </p>

          <OutlierImpact />

          <div className="explainer-card">
            <h3>Почему влияние уменьшается?</h3>

            <p>
              Среднее — это сумма всех наблюдений, разделённая на их
              количество.
            </p>

            <p>
              Если изменить одно наблюдение на величину{' '}
              <TeX>{'\\Delta'}</TeX>, среднее изменится только на{' '}
              <TeX>{'\\Delta / n'}</TeX>.
            </p>

            <p>
              Поэтому один и тот же скачок сильнее влияет на выборку из
              трёх наблюдений, чем на выборку из тридцати.
            </p>

            <div className="formula formula--mechanism">
              <TeX block>
                {'\\bar{x}_{\\text{новое}} - \\bar{x}_{\\text{старое}} = \\frac{\\Delta}{n}'}
              </TeX>
            </div>

            <ul>
              <li>Δ — насколько изменилось одно наблюдение;</li>
              <li>n — количество наблюдений в выборке;</li>
              <li>чем больше n, тем меньше меняется среднее.</li>
            </ul>
          </div>

          <div className="tip-card">
            <span className="tip-card__icon" aria-hidden="true">
              ℹ️
            </span>

            <div>
              <strong>Важно</strong>

              <p>
                Большая выборка не делает выбросы безвредными и не
                исправляет ошибки в данных. Этот эксперимент показывает
                только одно: влияние одного наблюдения на обычное среднее
                уменьшается пропорционально размеру выборки. Если необычных
                наблюдений много или они возникают неслучайно, среднее всё
                ещё может давать искажённую картину.
              </p>
            </div>
          </div>

          <div className="explainer-card">
            <h3>Но дело не только в одной точке</h3>

            <p>
              В случайной выборке одни наблюдения оказываются выше
              среднего генеральной совокупности, а другие — ниже.
            </p>

            <p>
              Когда мы усредняем много независимых наблюдений, эти
              случайные отклонения частично компенсируют друг друга.
            </p>

            <p>
              Поэтому средние больших выборок обычно располагаются ближе
              к центру и меньше отличаются друг от друга.
            </p>
          </div>

          <p className="stability-text">
            Эту компенсацию случайных отклонений удобно представить в три
            шага:
          </p>

          <div className="intuition-steps">
            <div className="intuition-card">
              <span>1</span>
              <h3>Берём наблюдения</h3>
              <p>
                Каждое отдельное наблюдение может сильно отличаться от
                остальных.
              </p>
            </div>

            <div className="intuition-card">
              <span>2</span>
              <h3>Вычисляем среднее</h3>
              <p>
                Большие и маленькие значения частично компенсируют друг друга.
              </p>
            </div>

            <div className="intuition-card">
              <span>3</span>
              <h3>Повторяем эксперимент</h3>
              <p>
                Распределение средних постепенно приобретает знакомую форму.
              </p>
            </div>
          </div>

          <p className="section-transition">
            Мы увидели, как гасится влияние одного наблюдения. Теперь
            посмотрим на ту же устойчивость с другой стороны — почему при
            росте выборки распределение самих средних становится всё уже.
          </p>
        </section>

        <section className="content-section" id="spread-shrink">
          <div className="section-heading">
            <div>
              <p className="section-label">Интерактив</p>
              <h2>Почему распределение становится уже?</h2>
            </div>
          </div>

          <p className="section-lead">
            Раньше мы смотрели на влияние одного необычного наблюдения.
            Теперь проследим за самим средним: будем по одному добавлять
            наблюдения в выборку и смотреть, как среднее постепенно
            перестаёт «скакать» и оседает возле истинного значения. Именно
            поэтому с ростом n распределение выборочных средних становится
            всё уже.
          </p>

          <SpreadShrink />
        </section>

        <section className="content-section" id="summary-gather">
          <div className="section-heading">
            <div>
              <p className="section-label">Итог раздела</p>
              <h2>Давайте соберём всё, что мы уже открыли</h2>
            </div>
          </div>

          <p className="section-lead">
            Мы провели несколько экспериментов и заметили важные
            закономерности. Теперь запишем их так, как это принято делать
            в математической статистике.
          </p>

          <SummaryGather />
        </section>

        <section className="content-section" id="formal">
          <div className="section-heading">
            <p className="section-number">04</p>

            <div>
              <p className="section-label">Формальный вывод</p>
              <h2>Почему это действительно работает?</h2>
            </div>
          </div>

          <p className="section-lead">
            До сих пор мы изучали центральную предельную теорему с помощью
            экспериментов. Теперь попробуем понять, как математики
            доказывают, что она действительно верна.
          </p>

          <WhyItWorks />
        </section>

        <section className="content-section about-section" id="about">
          <p className="section-label">О проекте</p>
          <h2>Статистика, которую можно увидеть</h2>
          <p>
            Мы создаём открытый интерактивный учебник по статистике,
            эконометрике и причинному выводу.
          </p>
        </section>
      </main>
  )
}

export default CentralLimitPage
