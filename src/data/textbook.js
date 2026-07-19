export const textbook = [
  {
    id: 'introduction',
    number: null,
    title: 'Введение',
  },
  {
    id: 'probability-data',
    number: 1,
    title: 'Вероятность и данные',
  },
  {
    id: 'descriptive-statistics',
    number: 2,
    title: 'Описательная статистика',
  },
  {
    id: 'central-limit-theorem',
    number: 3,
    title: 'Центральная предельная теорема',
    isCurrent: true,
    sections: [
      {
        id: 'question',
        title: 'Главный вопрос',
      },
      {
        id: 'experiment',
        title: 'Эксперимент',
      },
      {
        id: 'observation',
        title: 'Что ты заметил?',
      },
      {
        id: 'intuition',
        title: 'Интуитивное объяснение',
      },
      {
        id: 'formal',
        title: 'Формальный вывод',
      },
      {
        id: 'try-it',
        title: 'Попробуй сам',
      },
      {
        id: 'exercises',
        title: 'Задания',
      },
    ],
  },
  {
    id: 'estimation',
    number: 4,
    title: 'Оценивание параметров',
  },
  {
    id: 'hypothesis-testing',
    number: 5,
    title: 'Проверка гипотез',
  },
  {
    id: 'linear-models',
    number: 6,
    title: 'Линейные модели',
  },
]