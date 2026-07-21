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
        id: 'observation',
        title: 'Что ты заметил?',
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