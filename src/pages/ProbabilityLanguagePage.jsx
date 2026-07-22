import TeX from '../components/proof/TeX'
import ChoiceQuestion from '../components/probability-language/ChoiceQuestion'
import PossibleOutcomesExplorer from '../components/probability-language/PossibleOutcomesExplorer'
import EventBuilder from '../components/probability-language/EventBuilder'
import ShortSeriesExperiment from '../components/probability-language/ShortSeriesExperiment'
import FrequencyDistributionExperiment from '../components/probability-language/FrequencyDistributionExperiment'
import RunningFrequencyExperiment from '../components/probability-language/RunningFrequencyExperiment'
import GamblerFallacyExperiment from '../components/probability-language/GamblerFallacyExperiment'
import ProbabilityLanguageExercises from '../components/probability-language/ProbabilityLanguageExercises'

/*
 * Часть II главы «Вероятность и данные»: «Вероятность как язык
 * неопределённости». Одностраничная структура; якоря секций совпадают с
 * идентификаторами в data/textbook.js для сайдбара и scroll-spy.
 */

function ProbabilityLanguagePage() {
  return (
    <main className="main-content">
      <section className="lesson-intro" id="pl-intro">
        <div className="chapter-eyebrow">
          <span className="chapter-eyebrow__num">Глава 1 · Часть II</span>
          <span className="chapter-eyebrow__rule" aria-hidden="true" />
          <span className="chapter-eyebrow__name">Вероятность и данные</span>
        </div>

        <h1>Вероятность как язык неопределённости</h1>

        <h2>
          Мы знаем, что результат может измениться. Как описать возможные
          результаты?
        </h2>

        <p className="lesson-intro__description">
          В первой части мы несколько раз повторяли одну и ту же процедуру
          отбора и получали разные выборки и разные значения среднего.
        </p>
        <p className="lesson-intro__description">
          До проведения процедуры мы не знали, какой именно результат появится.
          Но это не означает, что мы не можем сказать о нём ничего.
        </p>
        <p className="lesson-intro__description">
          Мы можем перечислить возможные результаты и построить модель,
          описывающую, какие из них более ожидаемы. Для этого используется
          вероятность.
        </p>

        <ChoiceQuestion
          storageKey="pl.intro.choice"
          question="Из большой совокупности случайно выбирают одного человека. Известно, что 60% людей в этой совокупности пользуются общественным транспортом хотя бы раз в неделю. Можно ли заранее сказать, будет ли выбранный человек пользоваться общественным транспортом?"
          options={[
            { text: 'Да, он обязательно пользуется транспортом', correct: false },
            {
              text: 'Нет, но можно описать вероятность этого результата',
              correct: true,
            },
            {
              text: 'Нет, поэтому число 60% не даёт никакой информации',
              correct: false,
            },
            { text: 'Да, если выбор действительно случайный', correct: false },
          ]}
          correctFeedback="Вероятность не сообщает точный результат отдельного выбора. Она описывает, насколько ожидаемым является событие в рамках заданной процедуры или модели."
          neutralFeedback="Один отдельный результат остаётся неизвестным. Посмотрим, какую информацию всё же даёт вероятность."
        />
      </section>

      {/* ============ Раздел 1. Возможные результаты ============ */}
      <section className="content-section" id="possible-outcomes">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 1</p>
            <h2>Какие результаты вообще могут произойти?</h2>
          </div>
        </div>

        <p className="section-lead">
          Чтобы говорить о вероятности, сначала нужно определить процедуру и
          перечислить результаты, которые мы рассматриваем как возможные.
        </p>

        <div className="pd-definition-block">
          <strong>Случайный эксперимент</strong>
          <p>
            Повторяемая процедура, конкретный результат которой заранее
            неизвестен.
          </p>
        </div>

        <p className="section-lead">Примеры:</p>
        <ul className="pl-list">
          <li>выбор одного человека из совокупности;</li>
          <li>регистрация ответа участника опроса;</li>
          <li>наблюдение результата сделки;</li>
          <li>измерение срока работы устройства;</li>
          <li>определение результата контрольной группы;</li>
          <li>бросок кубика как упрощённая модель.</li>
        </ul>

        <p className="pd-highlight">
          Слово «эксперимент» здесь используется широко. Это не обязательно
          лабораторный эксперимент с вмешательством.
        </p>

        <div className="pd-columns">
          <div className="pd-column">
            <h4>В вероятности</h4>
            <p>Эксперимент — это процедура с неопределённым результатом.</p>
          </div>
          <div className="pd-column">
            <h4>В причинном выводе</h4>
            <p>
              Эксперимент часто означает исследование с назначением
              воздействия.
            </p>
          </div>
        </div>

        <PossibleOutcomesExplorer />

        <ChoiceQuestion
          storageKey="pl.outcomes.question"
          question="Можно ли определить возможные результаты, не уточнив, что именно измеряется?"
          options={[
            { text: 'Да', correct: false },
            { text: 'Нет', correct: true },
          ]}
          correctFeedback="Один и тот же объект можно описывать разными переменными. Поэтому пространство возможных результатов определяется не только объектом, но и процедурой измерения."
          neutralFeedback="Один и тот же объект можно описывать разными переменными, поэтому без указания измеряемой величины множество результатов не определено."
        />
      </section>

      {/* ============ Раздел 2. Исходы и события ============ */}
      <section className="content-section" id="outcomes-and-events">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 2</p>
            <h2>Исход и событие — не одно и то же</h2>
          </div>
        </div>

        <div className="pd-defs">
          <div className="pd-def">
            <h4>Исход</h4>
            <p>Один конкретный возможный результат случайного эксперимента.</p>
          </div>
          <div className="pd-def">
            <h4>Событие</h4>
            <p>Набор исходов, объединённых интересующим нас условием.</p>
          </div>
        </div>

        <p className="section-lead">
          Рассмотрим нейтральную модель шестигранного кубика. Пространство
          исходов:
        </p>
        <TeX block>{'\\Omega = \\{1, 2, 3, 4, 5, 6\\}.'}</TeX>

        <p className="section-lead">
          Каждый отдельный результат является исходом — например, выпадение
          числа 4. Событие «выпало чётное число» объединяет несколько исходов:
        </p>
        <TeX block>{'A = \\{2, 4, 6\\}.'}</TeX>

        <p className="section-lead">Событие «выпало число больше четырёх»:</p>
        <TeX block>{'B = \\{5, 6\\}.'}</TeX>

        <p className="pd-note">
          Операции над событиями (объединение, пересечение, дополнение) мы пока
          не вводим — они появятся в следующей части.
        </p>

        <EventBuilder />
      </section>

      {/* ============ Раздел 3. Что означает вероятность? ============ */}
      <section className="content-section" id="meaning-of-probability">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 3</p>
            <h2>Что сообщает вероятность?</h2>
          </div>
        </div>

        <p className="section-lead">
          Вероятность — это числовая характеристика события в рамках заданной
          модели. Она показывает, насколько ожидаемым считается событие до
          наблюдения результата.
        </p>

        <TeX block>{'0 \\le P(A) \\le 1.'}</TeX>

        <div className="pd-defs">
          <div className="pd-def">
            <h4>
              <TeX>{'P(A) = 0'}</TeX>
            </h4>
            <p>Событие невозможно в рамках модели.</p>
          </div>
          <div className="pd-def">
            <h4>
              <TeX>{'P(A) = 1'}</TeX>
            </h4>
            <p>Событие обязательно в рамках модели.</p>
          </div>
          <div className="pd-def">
            <h4>
              <TeX>{'0 < P(A) < 1'}</TeX>
            </h4>
            <p>Событие возможно, но не гарантировано.</p>
          </div>
        </div>

        <p className="pd-note">
          В конечной модели вероятность 0 соответствует невозможному событию. В
          непрерывных моделях отдельный исход может иметь вероятность 0 и при
          этом оставаться возможным — этот случай будет рассмотрен позже.
        </p>

        <div className="pd-definition-block">
          <strong>Вероятность 0,7 не означает:</strong>
          <ul className="pl-list">
            <li>событие обязательно произойдёт;</li>
            <li>событие произойдёт ровно 7 раз в любых 10 повторениях;</li>
            <li>
              если событие несколько раз не произошло, теперь оно «должно»
              произойти.
            </li>
          </ul>
        </div>

        <ShortSeriesExperiment />
      </section>

      {/* ============ Раздел 4. Вероятность и частота ============ */}
      <section className="content-section" id="probability-and-frequency">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 4</p>
            <h2>Вероятность и частота — разные объекты</h2>
          </div>
        </div>

        <div className="pd-defs">
          <div className="pd-def">
            <h4>
              Вероятность <TeX>{'P(A)'}</TeX>
            </h4>
            <p>Характеристика события в вероятностной модели.</p>
          </div>
          <div className="pd-def">
            <h4>
              Абсолютная частота <TeX>{'N_n(A)'}</TeX>
            </h4>
            <p>
              Число появлений события <TeX>{'A'}</TeX> в первых{' '}
              <TeX>{'n'}</TeX> повторениях.
            </p>
          </div>
          <div className="pd-def">
            <h4>
              Относительная частота <TeX>{'\\hat p_n'}</TeX>
            </h4>
            <p>Доля повторений, в которых событие произошло.</p>
          </div>
        </div>

        <TeX block>{'\\hat p_n = \\frac{N_n(A)}{n}.'}</TeX>

        <p className="pd-highlight">
          Вероятность задаётся моделью. Частота вычисляется по наблюдаемым
          результатам.
        </p>

        <div className="pl-table-scroll">
          <table className="pd-exp__table pd-exp__table--wide">
            <thead>
              <tr>
                <th></th>
                <th>Вероятность</th>
                <th>Относительная частота</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Обозначение</td>
                <td>
                  <TeX>{'P(A)'}</TeX>
                </td>
                <td>
                  <TeX>{'N_n(A) / n'}</TeX>
                </td>
              </tr>
              <tr>
                <td>Относится к</td>
                <td>модели</td>
                <td>наблюдаемой серии</td>
              </tr>
              <tr>
                <td>Известна заранее</td>
                <td>иногда</td>
                <td>нет</td>
              </tr>
              <tr>
                <td>Меняется между сериями</td>
                <td>нет, если модель та же</td>
                <td>да</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="pd-note">
          В прикладной задаче вероятность часто неизвестна. Тогда наблюдаемую
          частоту используют для её оценки. Это важный мост к статистике.
        </p>

        <FrequencyDistributionExperiment />
      </section>

      {/* ============ Раздел 5. Одна длинная последовательность ============ */}
      <section className="content-section" id="long-run-frequency">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 5</p>
            <h2>Как ведёт себя одна длинная последовательность?</h2>
          </div>
        </div>

        <p className="section-lead">
          В предыдущем разделе мы сравнивали много независимых серий. Здесь мы
          смотрим на накопление результатов внутри одной последовательности:
          как относительная частота обновляется после каждого нового
          наблюдения и обычно стабилизируется около <TeX>{'p'}</TeX>.
        </p>

        <RunningFrequencyExperiment />

        <p className="pd-note">
          Новые результаты продолжают изменять частоту. Но их влияние на уже
          накопленную долю уменьшается, потому что каждый новый результат
          составляет только <TeX>{'1/n'}</TeX> всей серии.
        </p>
      </section>

      {/* ============ Раздел 6. Закон больших чисел ============ */}
      <section className="content-section" id="law-of-large-numbers">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 6</p>
            <h2>Закон больших чисел</h2>
          </div>
        </div>

        <p className="section-lead">
          При многократном независимом повторении одной и той же процедуры
          относительная частота события <strong>приближается</strong> к его
          вероятности. Мы говорим именно «приближается», а не «становится
          равной».
        </p>

        <p className="section-lead">
          После <TeX>{'n'}</TeX> повторений относительная частота равна среднему
          значений 0 и 1: событие произошло — записываем 1, не произошло —
          записываем 0. С увеличением числа наблюдений влияние каждого нового
          результата на накопленное среднее уменьшается.
        </p>

        <TeX block>{'\\hat p_n = \\frac{X_1 + \\ldots + X_n}{n},'}</TeX>
        <TeX block>
          {'X_i = \\begin{cases} 1, & \\text{если событие произошло},\\\\ 0, & \\text{если событие не произошло}. \\end{cases}'}
        </TeX>
        <p className="pd-note">
          Величину <TeX>{'X_i'}</TeX> называют индикатором события.
        </p>

        <p className="section-lead">
          Для независимых одинаково распределённых бернуллиевских величин с{' '}
          <TeX>{'P(X_i = 1) = p'}</TeX>:
        </p>

        <TeX block>
          {'\\frac{1}{n}\\sum_{i=1}^{n} X_i \\xrightarrow{P} p.'}
        </TeX>

        <p className="pd-note">
          Обозначение <TeX>{'\\xrightarrow{P}'}</TeX> означает сходимость по
          вероятности. При больших <TeX>{'n'}</TeX> заметные отклонения
          относительной частоты от <TeX>{'p'}</TeX> становятся всё менее
          вероятными. Эквивалентная запись:
        </p>

        <TeX block>
          {'P\\left(\\left|\\hat p_n - p\\right| > \\varepsilon\\right) \\to 0 \\quad \\text{при } n \\to \\infty.'}
        </TeX>

        <div className="pd-defs">
          <div className="pd-def">
            <h4>
              <TeX>{'|\\hat p_n - p|'}</TeX>
            </h4>
            <p>размер ошибки относительной частоты;</p>
          </div>
          <div className="pd-def">
            <h4>
              <TeX>{'\\varepsilon'}</TeX>
            </h4>
            <p>заранее выбранный допустимый уровень ошибки;</p>
          </div>
          <div className="pd-def">
            <h4>
              <TeX>{'P(|\\hat p_n - p| > \\varepsilon)'}</TeX>
            </h4>
            <p>вероятность того, что ошибка окажется больше ε.</p>
          </div>
        </div>

        <details className="pd-details">
          <summary>Почему разброс уменьшается?</summary>
          <div className="pd-details__body">
            <p>
              Для <TeX>{'X_i \\sim \\operatorname{Bernoulli}(p)'}</TeX>:
            </p>
            <TeX block>
              {'E(X_i) = p, \\qquad \\operatorname{Var}(X_i) = p(1-p).'}
            </TeX>
            <p>
              Так как <TeX>{'\\hat p_n = \\frac{1}{n}\\sum_{i=1}^{n} X_i'}</TeX>,
              при независимости:
            </p>
            <TeX block>
              {'E(\\hat p_n) = p, \\qquad \\operatorname{Var}(\\hat p_n) = \\frac{p(1-p)}{n}.'}
            </TeX>
            <p>
              Центр распределения относительной частоты остаётся равным{' '}
              <TeX>{'p'}</TeX>, а её разброс уменьшается с ростом{' '}
              <TeX>{'n'}</TeX>. Неравенство Чебышёва даёт количественную оценку:
            </p>
            <TeX block>
              {'P\\left(|\\hat p_n - p| \\ge \\varepsilon\\right) \\le \\frac{p(1-p)}{n\\varepsilon^2}.'}
            </TeX>
            <p>
              Правая часть стремится к нулю при росте <TeX>{'n'}</TeX>, что и
              даёт одну из форм закона больших чисел.
            </p>
          </div>
        </details>
      </section>

      {/* ============ Раздел 7. Что закон НЕ утверждает ============ */}
      <section className="content-section" id="lln-misconceptions">
        <div className="section-heading">
          <div>
            <p className="section-label">Раздел 7</p>
            <h2>Что закон больших чисел не гарантирует?</h2>
          </div>
        </div>

        <div className="pd-definition-block">
          <strong>Ошибка 1. Точное совпадение</strong>
          <p>
            <em>
              Неверно: после большого числа повторений частота обязательно
              станет точно равна вероятности.
            </em>
          </p>
          <p>
            Закон больших чисел говорит о приближении и уменьшении вероятности
            заметного отклонения. Он не гарантирует точное равенство в конечной
            серии.
          </p>
        </div>

        <div className="pd-definition-block">
          <strong>Ошибка 2. Компенсация прошлых результатов</strong>
          <p>
            <em>
              Неверно: если событие долго не происходило, теперь оно должно
              произойти чаще, чтобы восстановить баланс.
            </em>
          </p>
          <p>
            Для независимых повторений прошлые результаты не меняют вероятность
            следующего исхода. По мере роста серии старый дисбаланс составляет
            всё меньшую долю общего числа наблюдений. Для стабилизации не
            требуется, чтобы следующие результаты специально компенсировали
            предыдущие.
          </p>
        </div>

        <GamblerFallacyExperiment />

        <div className="pd-definition-block">
          <strong>Ошибка 3. Закон для любых данных</strong>
          <p>
            <em>
              Неверно: большое число наблюдений автоматически делает среднее
              надёжным.
            </em>
          </p>
          <p>
            Закон больших чисел требует условий. Если наблюдения систематически
            смещены, сильно зависимы или процедура меняется со временем,
            увеличение числа наблюдений не обязательно решает проблему.
            Например, если опрашивать только посетителей одного сайта, большой
            размер выборки не делает её репрезентативной для всего населения.
          </p>
        </div>

        <p className="pd-highlight">
          Большой объём данных уменьшает случайную изменчивость, но не устраняет
          систематическую ошибку.
        </p>
      </section>

      {/* ============ Формальный итог ============ */}
      <section className="content-section" id="formal-summary">
        <div className="section-heading">
          <div>
            <p className="section-label">Формальная запись</p>
            <h2>Соберём определения</h2>
          </div>
        </div>

        <div className="pl-summary">
          <div className="pl-summary__item">
            <h4>Случайный эксперимент</h4>
            <p>Процедура с заранее неизвестным результатом.</p>
          </div>
          <div className="pl-summary__item">
            <h4>Пространство исходов</h4>
            <TeX>{'\\Omega'}</TeX>
            <p>Множество всех рассматриваемых возможных исходов.</p>
          </div>
          <div className="pl-summary__item">
            <h4>Событие</h4>
            <TeX>{'A \\subseteq \\Omega'}</TeX>
            <p>Набор исходов, удовлетворяющих некоторому условию.</p>
          </div>
          <div className="pl-summary__item">
            <h4>Вероятность события</h4>
            <TeX>{'P(A) \\in [0, 1]'}</TeX>
            <p>
              Числовая характеристика события в выбранной вероятностной модели.
            </p>
          </div>
          <div className="pl-summary__item">
            <h4>Относительная частота</h4>
            <TeX>{'\\hat p_n = N_n(A) / n'}</TeX>
            <p>
              Наблюдаемая доля появлений события в серии из <TeX>{'n'}</TeX>{' '}
              повторений.
            </p>
          </div>
          <div className="pl-summary__item">
            <h4>Закон больших чисел</h4>
            <TeX>{'\\hat p_n \\xrightarrow{P} P(A)'}</TeX>
            <p>
              При соответствующих условиях относительная частота приближается к
              вероятности.
            </p>
          </div>
        </div>
      </section>

      {/* ============ Проверка понимания ============ */}
      <section className="content-section" id="check-understanding">
        <div className="section-heading">
          <div>
            <p className="section-label">Проверка понимания</p>
            <h2>Задания</h2>
          </div>
        </div>

        <ProbabilityLanguageExercises />
      </section>

      {/* ============ Итог части ============ */}
      <section className="content-section" id="key-takeaways">
        <div className="section-heading">
          <div>
            <p className="section-label">Итог части</p>
            <h2>Что нужно запомнить</h2>
          </div>
        </div>

        <ol className="pd-takeaways">
          <li>
            Случайный эксперимент — это процедура с заранее неизвестным
            результатом.
          </li>
          <li>
            Пространство исходов содержит рассматриваемые возможные результаты.
          </li>
          <li>Событие представляет собой один исход или множество исходов.</li>
          <li>Вероятность описывает событие в рамках выбранной модели.</li>
          <li>
            Вероятность и наблюдаемая относительная частота — разные объекты.
          </li>
          <li>
            В коротких сериях частота может заметно отличаться от вероятности.
          </li>
          <li>
            При большом числе независимых повторений частота обычно
            стабилизируется около вероятности.
          </li>
          <li>
            Закон больших чисел не гарантирует точного равенства в конечной
            серии.
          </li>
          <li>Независимые результаты не обязаны компенсировать прошлое.</li>
          <li>Большой объём данных не устраняет систематическую ошибку.</li>
        </ol>
      </section>

      {/* ============ Переход к следующей части ============ */}
      <section className="content-section pd-next" id="pl-next">
        <h2>Как строить сложные события?</h2>
        <p>
          Пока мы рассматривали отдельные события: например, «результат чётный»
          или «выбранный человек поддерживает предложение». Но в реальных
          задачах нас часто интересуют комбинации условий:
        </p>
        <ul className="pl-list">
          <li>произошло хотя бы одно из двух событий;</li>
          <li>произошли оба события;</li>
          <li>событие не произошло;</li>
          <li>вероятность события при дополнительной информации.</li>
        </ul>
        <p>
          В следующей части мы введём операции над событиями, независимость и
          условную вероятность.
        </p>

        <button
          type="button"
          className="primary-button"
          disabled
          aria-disabled="true"
        >
          Следующая часть: события и зависимости — скоро
        </button>
      </section>
    </main>
  )
}

export default ProbabilityLanguagePage
