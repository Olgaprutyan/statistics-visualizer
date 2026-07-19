import './App.css'
import Sidebar from './components/Sidebar'
import ExperimentPanel from './components/ExperimentPanel'

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <section className="hero-section" id="question">
          <p className="section-label">Тема 3</p>

          <h1>Центральная предельная теорема</h1>

          <h2>Почему среднее становится нормальным?</h2>

          <p className="hero-description">
            Проведём эксперимент и посмотрим, как меняется распределение
            выборочного среднего при увеличении размера выборки.
          </p>

          <a className="primary-button" href="#experiment">
            Перейти к эксперименту
          </a>
        </section>

        <section className="content-section" id="experiment">
          <div className="section-heading">
            <p className="section-number">01</p>

            <div>
              <p className="section-label">
                Интерактивный эксперимент
              </p>

              <h2>Посмотрим на выборочные средние</h2>
            </div>
          </div>

          <ExperimentPanel />
        </section>

        <section className="content-section" id="observation">
          <div className="section-heading">
            <p className="section-number">02</p>

            <div>
              <p className="section-label">Наблюдение</p>
              <h2>Что ты заметил?</h2>
            </div>
          </div>

          <p>
            Попробуй описать своими словами, как изменилась форма
            распределения при увеличении размера выборки.
          </p>

          <textarea
            className="observation-input"
            placeholder="Например: распределение стало более симметричным..."
          />

          <button className="secondary-button" type="button">
            Сохранить заметку
          </button>
        </section>

        <section className="content-section" id="intuition">
          <div className="section-heading">
            <p className="section-number">03</p>

            <div>
              <p className="section-label">Интуиция</p>
              <h2>Случайные отклонения компенсируют друг друга</h2>
            </div>
          </div>

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
        </section>

        <section className="content-section" id="formal">
          <div className="section-heading">
            <p className="section-number">04</p>

            <div>
              <p className="section-label">Формальная часть</p>
              <h2>Формальный вывод</h2>
            </div>
          </div>

          <div className="formula-card">
            <p>
              Пусть X₁, X₂, ..., Xₙ — независимые одинаково распределённые
              случайные величины с математическим ожиданием μ и конечной
              дисперсией σ².
            </p>

            <div className="formula">
              √n · (X̄ₙ − μ) / σ → N(0, 1)
            </div>

            <p>
              Позже мы подключим KaTeX и разберём отдельно каждый элемент
              этой формулы.
            </p>
          </div>
        </section>

        <section className="content-section" id="try-it">
          <div className="section-heading">
            <p className="section-number">05</p>

            <div>
              <p className="section-label">Самостоятельный эксперимент</p>
              <h2>Попробуй сам</h2>
            </div>
          </div>

          <div className="task-grid">
            <button className="task-card" type="button">
              Увеличь размер выборки до 100
            </button>

            <button className="task-card" type="button">
              Выбери экспоненциальное распределение
            </button>

            <button className="task-card" type="button">
              Сравни 100 и 10 000 повторений
            </button>
          </div>
        </section>

        <section className="content-section" id="exercises">
          <div className="section-heading">
            <p className="section-number">06</p>

            <div>
              <p className="section-label">Проверка понимания</p>
              <h2>Задания</h2>
            </div>
          </div>

          <div className="exercise-list">
            <article className="exercise-card">
              <span>01</span>
              <p>
                Почему распределение выборочного среднего становится уже при
                увеличении n?
              </p>
            </article>

            <article className="exercise-card">
              <span>02</span>
              <p>
                Обязательно ли исходное распределение должно быть нормальным?
              </p>
            </article>

            <article className="exercise-card">
              <span>03</span>
              <p>
                Что произойдёт с формой распределения средних при маленьком n?
              </p>
            </article>
          </div>
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
    </div>
  )
}

export default App