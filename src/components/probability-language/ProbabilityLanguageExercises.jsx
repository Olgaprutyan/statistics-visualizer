import { useState } from 'react'
import { usePersistentState } from '../../usePersistentState'
import TeX from '../proof/TeX'
import ChoiceQuestion from './ChoiceQuestion'

/*
 * §16. Проверка понимания. Минимум семь заданий.
 * Ответы с выбором проверяются; задание 4 раскрывает решение; свободный ответ
 * (задание 8) сохраняется локально и не оценивается автоматически.
 */

function ProbabilityLanguageExercises() {
  const [task4Revealed, setTask4Revealed] = useState(false)
  const [freeResponse, setFreeResponse] = usePersistentState(
    'pl.ex.free',
    '',
  )
  const [freeRevealed, setFreeRevealed] = useState(false)

  return (
    <div className="pd-exercises">
      <ChoiceQuestion
        storageKey="pl.ex1"
        label="Задание 1"
        question="Что является исходом в процедуре «случайно выбрать одного человека и записать его возраст»?"
        options={[
          { text: 'Все люди в совокупности', correct: false },
          { text: 'Конкретное полученное значение возраста', correct: true },
          { text: 'Средний возраст выборки', correct: false },
          { text: 'Вероятность выбора человека', correct: false },
        ]}
        correctFeedback="Исход — это один конкретный результат процедуры: полученное значение возраста."
        neutralFeedback="Исход — это один конкретный результат процедуры, а не вся совокупность и не статистика."
      />

      <ChoiceQuestion
        storageKey="pl.ex2"
        label="Задание 2"
        question="Пространство исходов равно {1, 2, 3, 4, 5, 6}. Какое множество соответствует событию «выпало число больше 3»?"
        options={[
          { text: '{1, 2, 3}', correct: false },
          { text: '{3, 4, 5, 6}', correct: false },
          { text: '{4, 5, 6}', correct: true },
          { text: '{6}', correct: false },
        ]}
        correctFeedback="Строго больше 3 — это исходы 4, 5 и 6."
        neutralFeedback="«Больше 3» означает строго больше: число 3 не входит, а 4, 5 и 6 — входят."
      />

      <ChoiceQuestion
        storageKey="pl.ex3"
        label="Задание 3"
        question="Вероятность события равна 0,8. Что можно заключить об одном следующем испытании?"
        options={[
          { text: 'Событие обязательно произойдёт', correct: false },
          { text: 'Событие не произойдёт', correct: false },
          {
            text: 'Событие произойдёт с вероятностью 0,8, но конкретный результат неизвестен',
            correct: true,
          },
          {
            text: 'Событие произойдёт ровно 8 раз в следующих 10 испытаниях',
            correct: false,
          },
        ]}
        correctFeedback="Вероятность описывает ожидаемость события, но не определяет исход отдельного испытания."
        neutralFeedback="Вероятность 0,8 не гарантирует отдельный результат и не задаёт точное число событий в 10 испытаниях."
      />

      <div className="pd-exp">
        <p className="pd-q pl-question__label">Задание 4</p>
        <p className="pd-q">
          При вероятности <TeX>{'p = 0{,}6'}</TeX> событие произошло 7 раз в
          10 испытаниях. Чему равна относительная частота?
        </p>
        <div className="pd-btn-row">
          <button
            type="button"
            className="pviz__btn"
            onClick={() => setTask4Revealed(true)}
          >
            Показать решение
          </button>
        </div>
        {task4Revealed && (
          <>
            <TeX block>{'\\frac{7}{10} = 0{,}7.'}</TeX>
            <p className="pd-feedback">
              Вероятность в модели равна 0,6, а наблюдаемая частота в этой серии
              равна 0,7. Эти числа не обязаны совпадать.
            </p>
          </>
        )}
      </div>

      <ChoiceQuestion
        storageKey="pl.ex5"
        label="Задание 5"
        question="Верно или неверно: закон больших чисел утверждает, что в большой конечной серии относительная частота обязательно точно равна вероятности."
        options={[
          { text: 'Верно', correct: false },
          { text: 'Неверно', correct: true },
        ]}
        correctFeedback="Закон больших чисел говорит о приближении, а не о точном равенстве в конечной серии."
        neutralFeedback="Закон больших чисел говорит о приближении и уменьшении вероятности заметного отклонения, а не о точном равенстве."
      />

      <ChoiceQuestion
        storageKey="pl.ex6"
        label="Задание 6"
        question="Независимое событие с вероятностью 0,5 не произошло десять раз подряд. Какова вероятность события в следующем испытании?"
        options={[
          { text: 'Меньше 0,5', correct: false },
          { text: 'Ровно 0,5', correct: true },
          { text: 'Больше 0,5', correct: false },
        ]}
        correctFeedback="Для независимых испытаний прошлые результаты не меняют вероятность следующего исхода."
        neutralFeedback="Испытания независимы: прошлые результаты не меняют вероятность следующего исхода — она остаётся 0,5."
      />

      <ChoiceQuestion
        storageKey="pl.ex7"
        label="Задание 7"
        question="Исследователь собрал миллион наблюдений из систематически смещённого источника. Устраняет ли большой объём данных это смещение?"
        options={[
          { text: 'Да, всегда', correct: false },
          { text: 'Нет', correct: true },
        ]}
        correctFeedback="Большой размер выборки может уменьшить случайный разброс, но не исправляет систематическую ошибку процедуры сбора данных."
        neutralFeedback="Большой размер выборки уменьшает случайный разброс, но не исправляет систематическую ошибку процедуры сбора данных."
      />

      <div className="pd-exp">
        <p className="pd-q pl-question__label">Задание 8. Свободный ответ</p>
        <p className="pd-q">
          Объясни различие между вероятностью и относительной частотой.
        </p>
        <textarea
          className="pd-textarea"
          value={freeResponse}
          onChange={(event) => setFreeResponse(event.target.value)}
          rows={4}
          placeholder="Напиши короткое объяснение"
        />
        <div className="pd-btn-row">
          <button
            type="button"
            className="pviz__btn"
            onClick={() => setFreeRevealed(true)}
          >
            Сравнить с эталоном
          </button>
        </div>
        {freeRevealed && (
          <p className="pd-feedback">
            Вероятность является характеристикой события в модели. Относительная
            частота вычисляется по конкретной наблюдаемой серии и может меняться
            между сериями.
          </p>
        )}
      </div>
    </div>
  )
}

export default ProbabilityLanguageExercises
