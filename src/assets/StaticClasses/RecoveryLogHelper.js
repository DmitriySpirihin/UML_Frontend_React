import { AppData } from "./AppData";
import { saveData } from "./SaveHelper";
/*
const breathingLog = {
  "2025-12-08":[{
    startTime: 1702213815432, 
    endTime: 1702213895432,
    maxHold:120000
  },
],
}
const meditationLog = {
  "2025-12-08":[{
    startTime: 1702213815432, 
    endTime: 1702213895432,
  },
],
}
const hardeningLog = {
  "2025-12-08":[{
    startTime: 1702213815432, 
    endTime: 1702213895432,
    timeInColdWater:120000
  },
],
}
*/

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

export const saveMeditationSession = async(start, end) => {
  const dateKey = formatDate(start);
  if (!AppData.meditationLog[dateKey]) {
    AppData.meditationLog[dateKey] = [];
  }
  AppData.meditationLog[dateKey].push({
    startTime: start,
    endTime: end,
  });
  await saveData();
};

export const saveBreathingSession = async(start, end, maxHold) => {
  const dateKey = formatDate(start);
  if (!AppData.breathingLog[dateKey]) {
    AppData.breathingLog[dateKey] = [];
  }
  AppData.breathingLog[dateKey].push({
    startTime: start,
    endTime: end,
    maxHold: maxHold,
  });
  await saveData();
};

export const saveHardeningSession = async(start, end, coldTime) => {
  const dateKey = formatDate(start);
  if (!AppData.hardeningLog[dateKey]) {
    AppData.hardeningLog[dateKey] = [];
  }
  AppData.hardeningLog[dateKey].push({
    startTime: start,
    endTime: end,
    timeInColdWater: coldTime,
  });
  await saveData();
};


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
            strategy: '4-7-8',
            steps: [
              { in: 4000 },
              { hold: 7000 },
              { out: 8000 }
            ]
          },
          {
            cycles: 10,
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
            strategy: '3-6 (1:2)',
            steps: [
              { in: 3000 },
              { out: 6000 }
            ]
          },
          {
            cycles: 10,
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
            strategy: '4-6',
            steps: [
              { in: 4000 },
              { out: 6000 }
            ]
          },
          {
            cycles: 12,
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
            strategy: '6-6',
            steps: [
              { in: 6000 },
              { out: 6000 }
            ]
          },
          {
            cycles: 12,
            strategy: '5.5-5.5',
            steps: [
              { in: 5500 },
              { out: 5500 }
            ]
          },
          {
            cycles: 15,
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
            strategy: '6-6-6',
            steps: [
              { in: 6000 },
              { hold: 6000 },
              { out: 6000 }
            ]
          },
          {
            cycles: 6,
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
            strategy: '3-9 (1:3)',
            steps: [
              { in: 3000 },
              { out: 9000 }
            ]
          },
          {
            cycles: 10,
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
            strategy: '5×(3-1.5) + 5s',
            steps: [
              ...Array(5).fill(null).flatMap(() => [{ in: 3000 }, { out: 1500 }]),
              { hold: 5000 }
            ]
          },
          {
            cycles: 6,
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
            strategy: '5.5-5.5',
            steps: [
              { in: 5500 },
              { out: 5500 }
            ]
          },
          {
            cycles: 18,
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
export const meditationProtocols = [
  // ДЛЯ НОВИЧКОВ
  {
    level: ['Для новичков', 'For beginners'],
    protocols: [
      {
        name: ['Осознанное дыхание', 'Mindful Breathing'],
        aim: ['Базовая осознанность, успокоение', 'Basic mindfulness, calming'],
        instructions: [
          'Сядьте удобно, направьте внимание на дыхание. Замечайте вдох и выдох и мягко возвращайте внимание при отвлечении.',
          'Sit comfortably and focus on your breath. Notice each inhale and exhale, gently returning attention when it wanders.'
        ],
        levels: [
          {
            strategy: 'Короткая сессия для старта',
            cycles: 1,
            steps: [
              { meditateSeconds: 300, restSeconds: 0 } // 5 мин
            ]
          },
          {
            strategy: 'Стандартная сессия',
            cycles: 1,
            steps: [
              { meditateSeconds: 600, restSeconds: 0 } // 10 мин
            ]
          },
          {
            strategy: '2 коротких подхода',
            cycles: 2,
            steps: [
              { meditateSeconds: 300, restSeconds: 60 }
            ]
          }
        ]
      },
      {
        name: ['Сканирование тела', 'Body Scan'],
        aim: ['Расслабление, контакт с телом', 'Relaxation, body awareness'],
        instructions: [
          'Медленно проводите вниманием по телу от стоп до головы, замечая ощущения без оценки.',
          'Slowly move your attention through the body from feet to head, noticing sensations without judging.'
        ],
        levels: [
          {
            strategy: 'Краткое сканирование',
            cycles: 1,
            steps: [
              { meditateSeconds: 300, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Более глубокое сканирование',
            cycles: 1,
            steps: [
              { meditateSeconds: 900, restSeconds: 0 } // 15 мин
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
        name: ['Концентрация на объекте', 'Focused Attention'],
        aim: ['Концентрация, тренировка внимания', 'Focus, attention training'],
        instructions: [
          'Удерживайте внимание на одном объекте (дыхание, звук, пламя), мягко возвращаясь при отвлечении.',
          'Keep your attention on a single object (breath, sound, flame), gently returning when distracted.'
        ],
        levels: [
          {
            strategy: '1 блок средней длительности',
            cycles: 1,
            steps: [
              { meditateSeconds: 900, restSeconds: 0 } // 15 мин
            ]
          },
          {
            strategy: '2 блока с коротким отдыхом',
            cycles: 2,
            steps: [
              { meditateSeconds: 600, restSeconds: 60 } // 10 + 1 мин
            ]
          }
        ]
      },
      {
        name: ['Практика благодарности', 'Gratitude Meditation'],
        aim: ['Позитивный настрой, настроение', 'Positive mindset, mood'],
        instructions: [
          'Вспоминайте 3–5 вещей, за которые вы благодарны, стараясь прочувствовать это состояние.',
          'Recall 3–5 things you feel grateful for and try to fully feel the gratitude.'
        ],
        levels: [
          {
            strategy: 'Короткая практика',
            cycles: 1,
            steps: [
              { meditateSeconds: 300, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Расширенная практика',
            cycles: 1,
            steps: [
              { meditateSeconds: 600, restSeconds: 0 }
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
        name: ['Подсчёт дыханий', 'Breath Counting'],
        aim: ['Устойчивое внимание', 'Stable attention'],
        instructions: [
          'Считайте выдохи от 1 до 10, затем начинайте сначала. При потере счёта просто вернитесь к 1.',
          'Count exhales from 1 to 10 and then start again. If you lose count, just return to 1.'
        ],
        levels: [
          {
            strategy: 'Один длинный блок',
            cycles: 1,
            steps: [
              { meditateSeconds: 1200, restSeconds: 0 } // 20 мин
            ]
          },
          {
            strategy: 'Два блока с паузой',
            cycles: 2,
            steps: [
              { meditateSeconds: 600, restSeconds: 120 } // 10 + 2 мин
            ]
          }
        ]
      },
      {
        name: ['Открытое наблюдение', 'Open Monitoring'],
        aim: ['Широкая осознанность', 'Open awareness'],
        instructions: [
          'Наблюдайте мысли, звуки и ощущения, не цепляясь и не оценивая.',
          'Observe thoughts, sounds, and sensations without clinging or judging.'
        ],
        levels: [
          {
            strategy: 'Средняя сессия',
            cycles: 1,
            steps: [
              { meditateSeconds: 900, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Длинная сессия',
            cycles: 1,
            steps: [
              { meditateSeconds: 1500, restSeconds: 0 } // 25 мин
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
        name: ['Глубокая одноточечная концентрация', 'Deep Single‑Point Focus'],
        aim: ['Глубокое сосредоточение', 'Deep concentration'],
        instructions: [
          'Поддерживайте устойчивый фокус на одном объекте длительное время.',
          'Maintain a steady focus on a single object for an extended period.'
        ],
        levels: [
          {
            strategy: 'Один длинный сет',
            cycles: 1,
            steps: [
              { meditateSeconds: 1800, restSeconds: 0 } // 30 мин
            ]
          },
          {
            strategy: '2 интенсивных сета',
            cycles: 2,
            steps: [
              { meditateSeconds: 900, restSeconds: 180 } // 15 + 3 мин
            ]
          }
        ]
      },
      {
        name: ['Комбинированная практика', 'Alternating Practices'],
        aim: ['Глубокая тренировка ума', 'Deep mental training'],
        instructions: [
          'Чередуйте фокус на дыхании, открытое наблюдение и доброжелательность в рамках одной сессии.',
          'Alternate breath focus, open monitoring, and loving‑kindness within a single session.'
        ],
        levels: [
          {
            strategy: '3 блока по 10 минут',
            cycles: 3,
            steps: [
              { meditateSeconds: 600, restSeconds: 60 }
            ]
          },
          {
            strategy: '3 блока по 15 минут',
            cycles: 3,
            steps: [
              { meditateSeconds: 900, restSeconds: 90 }
            ]
          }
        ]
      }
    ]
  }
];

export const coldWaterProtocols = [
  // ДЛЯ НОВИЧКОВ
  {
    level: ['Для новичков', 'For beginners'],
    protocols: [
      {
        name: ['Контрастный душ с холодным финалом', 'Shower Finish Cold'],
        aim: ['Мягкое знакомство с холодом', 'Gentle introduction to cold'],
        instructions: [
          'Примите тёплый душ, затем завершите под холодной водой, сохраняя спокойное дыхание.',
          'Take a warm shower, then finish under cold water while keeping your breathing calm.'
        ],
        levels: [
          {
            strategy: 'Старт: короткий холодный финал',
            cycles: 1,
            steps: [
              { hotSeconds: 180, coldSeconds: 30, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Увеличение холодной фазы',
            cycles: 1,
            steps: [
              { hotSeconds: 180, coldSeconds: 60, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Продвинутый финал',
            cycles: 1,
            steps: [
              { hotSeconds: 180, coldSeconds: 120, restSeconds: 0 }
            ]
          }
        ]
      },
      {
        name: ['Чередование тёплой и холодной воды', 'Warm–Cold Alternating Shower'],
        aim: ['Сосудистый тренинг, бодрость', 'Vascular training, alertness'],
        instructions: [
          'Чередуйте тёплую и холодную воду короткими отрезками, всегда заканчивайте холодной.',
          'Alternate warm and cold water in short intervals, always ending on cold.'
        ],
        levels: [
          {
            strategy: '2 цикла по 30 с',
            cycles: 2,
            steps: [
              { hotSeconds: 30, coldSeconds: 30, restSeconds: 0 }
            ]
          },
          {
            strategy: '3 цикла по 45–60 с',
            cycles: 3,
            steps: [
              { hotSeconds: 45, coldSeconds: 45, restSeconds: 0 }
            ]
          },
          {
            strategy: '4 цикла, финал дольше холод',
            cycles: 4,
            steps: [
              { hotSeconds: 45, coldSeconds: 45, restSeconds: 0 }
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
        name: ['Полностью холодный душ', 'Full Cold Shower'],
        aim: ['Стрессоустойчивость, энергия', 'Stress resilience, energy'],
        instructions: [
          'Используйте только холодную воду, начиная с конечностей и переходя к корпусу, контролируя дыхание.',
          'Use only cold water, starting with limbs and then torso while controlling your breath.'
        ],
        levels: [
          {
            strategy: 'Короткий холодный душ',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 60, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Умеренный холодный душ',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 120, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Длинный холодный душ',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 300, restSeconds: 0 }
            ]
          }
        ]
      },
      {
        name: ['Холодный душ после разминки', 'Post‑Warmup Cold Shower'],
        aim: ['Восстановление, психическая устойчивость', 'Recovery, mental resilience'],
        instructions: [
          'После лёгкой разминки или тренировки примите холодный душ, избегая задержки дыхания.',
          'After a light warm‑up or workout, take a cold shower while avoiding breath‑holding.'
        ],
        levels: [
          {
            strategy: 'Короткий после тренировки',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 90, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Стандартный',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 180, restSeconds: 0 }
            ]
          },
          {
            strategy: 'Удлинённый',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 300, restSeconds: 0 }
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
        name: ['Погружение в прохладную ванну', 'Cool Bath Immersion'],
        aim: ['Глубжеe закаливание, восстановление', 'Deeper hardening, recovery'],
        instructions: [
          'Погрузите тело до пояса или груди в прохладную воду. Оставайтесь на уровне, где можете спокойно дышать.',
          'Immerse your body up to the waist or chest in cool water, staying at an intensity where you can breathe calmly.'
        ],
        levels: [
          {
            strategy: 'Короткое погружение',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 60, restSeconds: 120 }
            ]
          },
          {
            strategy: '2 погружения',
            cycles: 2,
            steps: [
              { hotSeconds: 0, coldSeconds: 90, restSeconds: 180 }
            ]
          },
          {
            strategy: 'Длинное погружение',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 300, restSeconds: 300 }
            ]
          }
        ]
      },
      {
        name: ['Тёплый душ → прохладная ванна', 'Warm‑Then‑Cool Bath'],
        aim: ['Комфортная адаптация, расслабление', 'Comfortable adaptation, relaxation'],
        instructions: [
          'Сначала согрейтесь под тёплым душем, затем перейдите в прохладную ванну и завершите сессию мягким согреванием.',
          'First warm up under a warm shower, then move into a cool bath and finish with gentle rewarming.'
        ],
        levels: [
          {
            strategy: 'Короткий переход',
            cycles: 1,
            steps: [
              { hotSeconds: 180, coldSeconds: 60, restSeconds: 180 }
            ]
          },
          {
            strategy: 'Умеренный переход',
            cycles: 1,
            steps: [
              { hotSeconds: 180, coldSeconds: 180, restSeconds: 240 }
            ]
          },
          {
            strategy: 'Углублённый переход',
            cycles: 1,
            steps: [
              { hotSeconds: 180, coldSeconds: 300, restSeconds: 300 }
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
        name: ['Холодный пландж / бочка', 'Cold Plunge / Tub'],
        aim: ['Максимальная адаптация, сила воли', 'Max adaptation, willpower'],
        instructions: [
          'Погружайтесь в очень холодную воду до груди или шеи. Сохраняйте спокойное дыхание и выходите до сильного онемения.',
          'Immerse yourself in very cold water up to chest or neck. Keep breathing calmly and exit before intense numbness.'
        ],
        levels: [
          {
            strategy: 'Стартовый пландж',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 30, restSeconds: 180 }
            ]
          },
          {
            strategy: 'Умеренный пландж',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 60, restSeconds: 240 }
            ]
          },
          {
            strategy: 'Продвинутый пландж',
            cycles: 1,
            steps: [
              { hotSeconds: 0, coldSeconds: 180, restSeconds: 300 }
            ]
          }
        ]
      },
      {
        name: ['Повторные короткие планджи', 'Repeated Short Plunges'],
        aim: ['Тренировка нервной системы', 'Nervous system training'],
        instructions: [
          'Делайте несколько коротких заходов в холодную воду с полным согреванием между циклами.',
          'Do several short immersions in cold water with full rewarming between cycles.'
        ],
        levels: [
          {
            strategy: '2 коротких захода',
            cycles: 2,
            steps: [
              { hotSeconds: 0, coldSeconds: 30, restSeconds: 180 }
            ]
          },
          {
            strategy: '3 умеренных захода',
            cycles: 3,
            steps: [
              { hotSeconds: 0, coldSeconds: 60, restSeconds: 240 }
            ]
          },
          {
            strategy: '3 продвинутых захода',
            cycles: 3,
            steps: [
              { hotSeconds: 0, coldSeconds: 120, restSeconds: 300 }
            ]
          }
        ]
      }
    ]
  }
];


export const markSessionAsDone = (type,categoryIndex, protocolIndex, levelIndex) => {
  AppData.recoveryProtocols[type][categoryIndex][protocolIndex][levelIndex] = true;
  
};

