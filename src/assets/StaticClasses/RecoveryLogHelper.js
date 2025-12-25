export const breathingLog = {
  "2025-12-08":[{
    startTime: 1702213815432, 
    endTime: 1702213895432,
    id:0,
    cycles:3,
    maxHold:120000
  },
],
}

export const breathingProtocols = [
  // ДЛЯ НОВИЧКОВ
  {
    level: ['Для новичков', 'For beginners'],
    protocols: [
      {
        name: ['Квадратное дыхание', 'Box Breathing'],
        aim: ['Фокусировка, снятие стресса', 'Focus, stress relief'],
        instructions: [
          'Медленно вдохните на счёт, задержите дыхание, выдохните на счёт, снова задержите дыхание. Повторяйте цикл.',
          'Inhale slowly for a count, hold your breath, exhale for a count, then hold again. Repeat the cycle.'
        ],
        levels: [
          {
            cycles: 6,
            isDone: false,
            strategy: '4-4-4-4',
            steps: [
              { in: 4000 },
              { hold: 4000 },
              { out: 4000 },
              { hold: 4000 }
            ]
          },
          {
            cycles: 8,
            isDone: false,
            strategy: '5-5-5-5',
            steps: [
              { in: 5000 },
              { hold: 5000 },
              { out: 5000 },
              { hold: 5000 }
            ]
          },
          {
            cycles: 10,
            isDone: false,
            strategy: '6-6-6-6',
            steps: [
              { in: 6000 },
              { hold: 6000 },
              { out: 6000 },
              { hold: 6000 }
            ]
          }
        ]
      },
      {
        name: ['4–7–8 для расслабления', '4–7–8 Relax'],
        aim: ['Успокоение, сон', 'Calm, sleep'],
        instructions: [
          'Вдохните через нос на 4 счёта, задержите дыхание на 7 счётов, затем медленно выдохните через рот на 8 счётов. Повторите.',
          'Inhale through your nose for a count of 4, hold your breath for 7 counts, then exhale slowly through your mouth for 8 counts. Repeat.'
        ],
        levels: [
          {
            cycles: 8,
            isDone: false,
            strategy: '4-7-8',
            steps: [
              { in: 4000 },
              { hold: 7000 },
              { out: 8000 }
            ]
          },
          {
            cycles: 10,
            isDone: false,
            strategy: '5-8-9',
            steps: [
              { in: 5000 },
              { hold: 8000 },
              { out: 9000 }
            ]
          }
        ]
      },
      {
        name: ['Удлинённый выдох 1:2', 'Extended Exhale 1:2'],
        aim: ['Снятие тревоги', 'Anxiety relief'],
        instructions: [
          'Вдохните спокойно, затем выдыхайте в два раза дольше, чем вдыхали. Например: вдох — 3 с, выдох — 6 с.',
          'Inhale gently, then exhale for twice as long as your inhale. For example: inhale for 3 seconds, exhale for 6 seconds.'
        ],
        levels: [
          {
            cycles: 8,
            isDone: false,
            strategy: '3-6 (1:2)',
            steps: [
              { in: 3000 },
              { out: 6000 }
            ]
          },
          {
            cycles: 10,
            isDone: false,
            strategy: '4-8 (1:2)',
            steps: [
              { in: 4000 },
              { out: 8000 }
            ]
          }
        ]
      },
      {
        name: ['Диафрагмальное дыхание', 'Diaphragmatic Breathing'],
        aim: ['Базовый контроль дыхания', 'Basic breath control'],
        instructions: [
          'Дышите глубоко через нос, надувая живот при вдохе и опуская его при выдохе. Следите, чтобы грудь почти не двигалась.',
          'Breathe deeply through your nose, expanding your belly on the inhale and gently drawing it in on the exhale. Keep your chest still.'
        ],
        levels: [
          {
            cycles: 10,
            isDone: false,
            strategy: '4-6',
            steps: [
              { in: 4000 },
              { out: 6000 }
            ]
          },
          {
            cycles: 12,
            isDone: false,
            strategy: '5-7',
            steps: [
              { in: 5000 },
              { out: 7000 }
            ]
          }
        ]
      }
    ]
  },

  // ДЛЯ ЛЮБИТЕЛЕЙ
  {
    level: ['Для любителей', 'For amateurs'],
    protocols: [
      {
        name: ['Резонансное дыхание', 'Resonant Breathing'],
        aim: ['HRV, устойчивость к стрессу', 'HRV, stress resilience'],
        instructions: [
          'Дышите ровно и спокойно, вдыхая и выдыхая на 6 секунд. Это уравновешивает сердечный ритм и активирует парасимпатическую нервную систему.',
          'Breathe evenly and calmly, inhaling and exhaling for 6 seconds each. This balances heart rate variability and activates the parasympathetic nervous system.'
        ],
        levels: [
          {
            cycles: 10,
            isDone: false,
            strategy: '6-6',
            steps: [
              { in: 6000 },
              { out: 6000 }
            ]
          },
          {
            cycles: 12,
            isDone: false,
            strategy: '5.5-5.5',
            steps: [
              { in: 5500 },
              { out: 5500 }
            ]
          },
          {
            cycles: 15,
            isDone: false,
            strategy: '7-7',
            steps: [
              { in: 7000 },
              { out: 7000 }
            ]
          }
        ]
      },
      {
        name: ['Чередующееся дыхание', 'Alternate Nostril Breathing'],
        aim: ['Баланс, концентрация', 'Balance, focus'],
        instructions: [
          'Закройте правую ноздрю, вдохните через левую. Затем закройте левую, выдохните через правую. Повторите, чередуя ноздри.',
          'Close your right nostril, inhale through the left. Then close the left nostril and exhale through the right. Alternate sides with each breath.'
        ],
        levels: [
          {
            cycles: 8,
            isDone: false,
            strategy: '4-2-4 / 4-2-4',
            steps: [
              { in: 4000 },
              { hold: 2000 },
              { out: 4000 },
              { in: 4000 },
              { hold: 2000 },
              { out: 4000 }
            ]
          },
          {
            cycles: 10,
            isDone: false,
            strategy: '5-3-5 / 5-3-5',
            steps: [
              { in: 5000 },
              { hold: 3000 },
              { out: 5000 },
              { in: 5000 },
              { hold: 3000 },
              { out: 5000 }
            ]
          }
        ]
      },
      {
        name: ['Физиологический вздох', 'Physiological Sigh'],
        aim: ['Быстрое снижение стресса', 'Fast stress reduction'],
        instructions: [
          'Сделайте короткий вдох через нос, сразу добавьте ещё один небольшой вдох, затем медленно и полностью выдохните через рот.',
          'Take a short inhale through your nose, immediately follow with a second small inhale, then exhale slowly and fully through your mouth.'
        ],
        levels: [
          {
            cycles: 3,
            isDone: false,
            strategy: '2+1-5',
            steps: [
              { in: 2000 },
              { in: 1000 },
              { out: 5000 },
              { rest: 20000 }
            ]
          },
          {
            cycles: 5,
            isDone: false,
            strategy: '2.5+1-6',
            steps: [
              { in: 2500 },
              { in: 1000 },
              { out: 6000 },
              { rest: 20000 }
            ]
          }
        ]
      },
      {
        name: ['Энергетическое дыхание с задержкой', 'Energizing Breathing with Hold'],
        aim: ['Энергия, стрессоустойчивость', 'Energy, stress resilience'],
        instructions: [
          'Выполните серию быстрых вдохов и выдохов, затем сделайте длинную задержку дыхания после выдоха. Завершите глубоким вдохом и замедленным выдохом.',
          'Perform a series of rapid inhales and exhales, then hold your breath after a full exhale. Finish with a deep inhale and slow exhale.'
        ],
        levels: [
          {
            cycles: 2,
            isDone: false,
            strategy: '15×(1.5-1.5) + 60s',
            steps: [
              ...Array(15).fill(null).flatMap(() => [{ in: 1500 }, { out: 1500 }]),
              { hold: 60000 },
              { in: 3000 },
              { hold: 15000 },
              { out: 3000 },
              { rest: 30000 }
            ]
          },
          {
            cycles: 3,
            isDone: false,
            strategy: '20×(1.2-1.2) + 90s',
            steps: [
              ...Array(20).fill(null).flatMap(() => [{ in: 1200 }, { out: 1200 }]),
              { hold: 90000 },
              { in: 3000 },
              { hold: 25000 },
              { out: 3000 },
              { rest: 45000 }
            ]
          },
          {
            cycles: 3,
            isDone: false,
            strategy: '25×(1.1-1.1) + 120s',
            steps: [
              ...Array(25).fill(null).flatMap(() => [{ in: 1100 }, { out: 1100 }]),
              { hold: 120000 },
              { in: 3000 },
              { hold: 40000 },
              { out: 3000 },
              { rest: 60000 }
            ]
          },
          {
            cycles: 3,
            isDone: false,
            strategy: '30×(1.0-1.0) + 180s',
            steps: [
              ...Array(30).fill(null).flatMap(() => [{ in: 1000 }, { out: 1000 }]),
              { hold: 180000 },
              { in: 3000 },
              { hold: 50000 },
              { out: 3000 },
              { rest: 60000 }
            ]
          }
        ]
      }
    ]
  },

  // СРЕДНИЙ УРОВЕНЬ
  {
    level: ['Средний уровень', 'Intermediate'],
    protocols: [
      {
        name: ['Треугольное дыхание', 'Triangle Breathing'],
        aim: ['Баланс, концентрация', 'Balance, focus'],
        instructions: [
          'Вдохните, задержите дыхание, затем выдохните — все три фазы одинаковой длительности. Представьте равносторонний треугольник.',
          'Inhale, hold your breath, then exhale — all three phases of equal duration. Visualize an equilateral triangle.'
        ],
        levels: [
          {
            cycles: 5,
            isDone: false,
            strategy: '6-6-6',
            steps: [
              { in: 6000 },
              { hold: 6000 },
              { out: 6000 }
            ]
          },
          {
            cycles: 6,
            isDone: false,
            strategy: '7-7-7',
            steps: [
              { in: 7000 },
              { hold: 7000 },
              { out: 7000 }
            ]
          }
        ]
      },
      {
        name: ['Удлинённый выдох 2:1', '2-to-1 Breathing'],
        aim: ['Глубокое расслабление', 'Deep relaxation'],
        instructions: [
          'Вдохните на короткое время, затем выдыхайте втрое дольше (например, 3 сек вдох, 9 сек выдох). Это активирует расслабление.',
          'Inhale for a short duration, then exhale for triple the time (e.g., 3 seconds in, 9 seconds out). This strongly triggers relaxation.'
        ],
        levels: [
          {
            cycles: 8,
            isDone: false,
            strategy: '3-9 (1:3)',
            steps: [
              { in: 3000 },
              { out: 9000 }
            ]
          },
          {
            cycles: 10,
            isDone: false,
            strategy: '4-12 (1:3)',
            steps: [
              { in: 4000 },
              { out: 12000 }
            ]
          }
        ]
      },
      {
        name: ['Пульсирующее дыхание', 'Pulsed Breathing'],
        aim: ['Расслабление, контроль дыхания', 'Relaxation, breath control'],
        instructions: [
          'Сделайте несколько коротких выдохов на один вдох, затем задержите дыхание. Например: вдох на 3 сек, три коротких выдоха по 1.5 сек.',
          'Take one long inhale, then break the exhale into several short pulses (e.g., 3 pulses of 1.5 sec each), followed by a brief hold.'
        ],
        levels: [
          {
            cycles: 5,
            isDone: false,
            strategy: '5×(3-1.5) + 5s',
            steps: [
              ...Array(5).fill(null).flatMap(() => [{ in: 3000 }, { out: 1500 }]),
              { hold: 5000 }
            ]
          },
          {
            cycles: 6,
            isDone: false,
            strategy: '6×(2.5-1.25) + 6s',
            steps: [
              ...Array(6).fill(null).flatMap(() => [{ in: 2500 }, { out: 1250 }]),
              { hold: 6000 }
            ]
          }
        ]
      }
    ]
  },

  // ДЛЯ ОПЫТНЫХ
  {
    level: ['Для опытных', 'For advanced'],
    protocols: [
      {
        name: ['Двухфазный вдох с задержкой', 'Two-Stage Inhale + Hold'],
        aim: ['Контроль и выносливость', 'Control and endurance'],
        instructions: [
          'Сделайте первый вдох до половины лёгких, затем второй — до полного объёма. Задержите, выдохните, и сделайте короткую паузу.',
          'Inhale halfway, then top off your lungs with a second inhale. Hold, exhale fully, then pause briefly before the next cycle.'
        ],
        levels: [
          {
            cycles: 5,
            isDone: false,
            strategy: '2.5+2.5-6-6-2',
            steps: [
              { in: 2500 },
              { in: 2500 },
              { hold: 6000 },
              { out: 6000 },
              { hold: 2000 }
            ]
          },
          {
            cycles: 6,
            isDone: false,
            strategy: '3+3-8-8-3',
            steps: [
              { in: 3000 },
              { in: 3000 },
              { hold: 8000 },
              { out: 8000 },
              { hold: 3000 }
            ]
          }
        ]
      },
      {
        name: ['CO₂ толерантность', 'CO₂ Tolerance'],
        aim: ['Толерантность к CO₂', 'CO₂ tolerance'],
        instructions: [
          'Сделайте обычный вдох, затем задержите дыхание как можно дольше после выдоха. Это тренирует терпимость к углекислому газу.',
          'Take a normal inhale, then hold your breath for an extended period after a full exhale. This trains CO₂ tolerance and breath-hold capacity.'
        ],
        levels: [
          {
            cycles: 3,
            isDone: false,
            strategy: '3-30-5-10',
            steps: [
              { in: 3000 },
              { hold: 30000 },
              { out: 5000 },
              { hold: 10000 },
              { rest: 45000 }
            ]
          },
          {
            cycles: 3,
            isDone: false,
            strategy: '3-45-6-15',
            steps: [
              { in: 3000 },
              { hold: 45000 },
              { out: 6000 },
              { hold: 15000 },
              { rest: 60000 }
            ]
          },
          {
            cycles: 2,
            isDone: false,
            strategy: '3-60-7-20',
            steps: [
              { in: 3000 },
              { hold: 60000 },
              { out: 7000 },
              { hold: 20000 },
              { rest: 90000 }
            ]
          }
        ]
      },
      {
        name: ['Продвинутое резонансное дыхание', 'Advanced Resonant Breathing'],
        aim: ['HRV, восстановление', 'HRV, recovery'],
        instructions: [
          'Поддерживайте медленный, ровный ритм дыхания (5.5–6 сек на вдох и выдох) в течение длительного времени для глубокого восстановления.',
          'Maintain a slow, steady breathing rhythm (5.5–6 seconds in, 5.5–6 seconds out) for an extended period to enhance deep recovery and HRV.'
        ],
        levels: [
          {
            cycles: 15,
            isDone: false,
            strategy: '5.5-5.5',
            steps: [
              { in: 5500 },
              { out: 5500 }
            ]
          },
          {
            cycles: 18,
            isDone: false,
            strategy: '6-6',
            steps: [
              { in: 6000 },
              { out: 6000 }
            ]
          }
        ]
      }
    ]
  }
];

export const markSessionAsDone = (categoryIndex, protocolIndex, levelIndex) => {
  if (
    breathingProtocols[categoryIndex] &&
    breathingProtocols[categoryIndex].protocols[protocolIndex] &&
    breathingProtocols[categoryIndex].protocols[protocolIndex].levels[levelIndex]
  ) {
    breathingProtocols[categoryIndex].protocols[protocolIndex].levels[levelIndex].isDone = true;
  }
};