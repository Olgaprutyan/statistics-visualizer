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
    sections: [
      { id: 'pd-intro', title: 'От наблюдений к выборке' },
      {
        id: 'sample-and-population',
        title: 'Почему одной выборки недостаточно?',
      },
      { id: 'what-is-random', title: 'Что именно случайно?' },
      {
        id: 'sampling-variability',
        title: 'Почему результаты меняются?',
      },
      { id: 'key-takeaways', title: 'Что нужно запомнить' },
    ],
  },
  {
    id: 'probability-language',
    number: null,
    title: 'Вероятность как язык',
    sections: [
      { id: 'pl-intro', title: 'Вероятность как язык' },
      { id: 'possible-outcomes', title: 'Возможные результаты' },
      { id: 'outcomes-and-events', title: 'Исходы и события' },
      { id: 'meaning-of-probability', title: 'Что означает вероятность?' },
      { id: 'probability-and-frequency', title: 'Вероятность и частота' },
      { id: 'law-of-large-numbers', title: 'Закон больших чисел' },
      { id: 'key-takeaways', title: 'Что нужно запомнить' },
    ],
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
        id: 'means-intro',
        title: 'Выборочные средние',
      },
      {
        id: 'experiment',
        title: 'Эксперимент',
      },
      {
        id: 'mini-lab',
        title: 'Мини-лаборатория',
      },
      {
        id: 'build-up',
        title: 'Как рождается распределение',
      },
      {
        id: 'center-height',
        title: 'Почему центр высокий',
      },
      {
        id: 'stability',
        title: 'Стабильность средних',
      },
      {
        id: 'spread-shrink',
        title: 'Почему разброс сужается',
      },
      {
        id: 'summary-gather',
        title: 'Итоги раздела',
      },
      {
        id: 'formal',
        title: 'Формальный вывод',
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
