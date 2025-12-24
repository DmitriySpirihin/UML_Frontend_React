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
        levels: [
          {
            cycles: 3,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 4000 },
              { type: 'hold', duration: 4000 },
              { type: 'exhale', duration: 4000 },
              { type: 'hold', duration: 4000 }
            ]
          },
          {
            cycles: 5,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 5000 },
              { type: 'hold', duration: 5000 },
              { type: 'exhale', duration: 5000 },
              { type: 'hold', duration: 5000 }
            ]
          }
        ]
      },
      {
        name: ['4–7–8 для расслабления', '4–7–8 Relax'],
        aim: ['Успокоение, сон', 'Calm, sleep'],
        levels: [
          {
            cycles: 4,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 4000 },
              { type: 'hold', duration: 7000 },
              { type: 'exhale', duration: 8000 }
            ]
          }
        ]
      },
      {
        name: ['Удлинённый выдох 1:2', 'Extended Exhale 1:2'],
        aim: ['Снятие тревоги', 'Anxiety relief'],
        levels: [
          {
            cycles: 6,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 3000 },
              { type: 'exhale', duration: 6000 }
            ]
          }
        ]
      },
      {
        name: ['Диафрагмальное дыхание', 'Diaphragmatic Breathing'],
        aim: ['Базовый контроль дыхания', 'Basic breath control'],
        levels: [
          {
            cycles: 8,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 4000 },
              { type: 'exhale', duration: 6000 }
            ]
          }
        ]
      }
    ]
  },

  // ДЛЯ ЛЮБИТЕЛЕЙ (AMATEURS)
  {
    level: ['Для любителей', 'For amateurs'],
    protocols: [
      {
        name: ['Резонансное дыхание 6/6', 'Resonant Breathing 6/6'],
        aim: ['HRV, устойчивость к стрессу', 'HRV, stress resilience'],
        levels: [
          {
            cycles: 10,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 6000 },
              { type: 'exhale', duration: 6000 }
            ]
          }
        ]
      },
      {
        name: ['Чередующееся дыхание', 'Alternate Nostril Breathing'],
        aim: ['Баланс, концентрация', 'Balance, focus'],
        levels: [
          {
            cycles: 6,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 4000 },
              { type: 'hold', duration: 2000 },
              { type: 'exhale', duration: 4000 },
              { type: 'inhale', duration: 4000 },
              { type: 'hold', duration: 2000 },
              { type: 'exhale', duration: 4000 }
            ]
          }
        ]
      },
      {
        name: ['Физиологический вздох', 'Physiological Sigh'],
        aim: ['Быстрое снижение стресса', 'Fast stress reduction'],
        levels: [
          {
            cycles: 5,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 2000 },
              { type: 'inhale', duration: 1000 },
              { type: 'exhale', duration: 5000 }
            ]
          }
        ]
      },
      {
        name: ['Дыхание по Виму Хофу', 'Wim Hof Breathing'],
        aim: ['Энергия, стрессоустойчивость', 'Energy, stress resilience'],
        levels: [
          {
            // 3 раунда: 30 быстрых вдох–выдох → холд → восстановление
            cycles: 3,
            isDone: false,
            steps: [
              {
                type: 'pattern',
                repeat: 30,
                steps: [
                  { type: 'inhale', duration: 1500 },
                  { type: 'exhale', duration: 1500 }
                ]
              },
              { type: 'hold', duration: 60000 },
              { type: 'inhale', duration: 3000 },
              { type: 'hold', duration: 15000 },
              { type: 'exhale', duration: 3000 }
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
        levels: [
          {
            cycles: 4,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 6000 },
              { type: 'hold', duration: 6000 },
              { type: 'exhale', duration: 6000 }
            ]
          }
        ]
      },
      {
        name: ['Удлинённый выдох 2:1', '2-to-1 Breathing'],
        aim: ['Глубокое расслабление', 'Deep relaxation'],
        levels: [
          {
            cycles: 6,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 3000 },
              { type: 'exhale', duration: 9000 }
            ]
          }
        ]
      },
      {
        name: ['Пульсирующее дыхание', 'Pulsed Breathing'],
        aim: ['Расслабление, контроль дыхания', 'Relaxation, breath control'],
        levels: [
          {
            cycles: 4,
            isDone: false,
            steps: [
              {
                type: 'pattern',
                repeat: 5,
                steps: [
                  { type: 'inhale', duration: 3000 },
                  { type: 'exhale', duration: 1500 }
                ]
              },
              { type: 'hold', duration: 5000 }
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
        levels: [
          {
            cycles: 4,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 2500 },
              { type: 'inhale', duration: 2500 },
              { type: 'hold', duration: 6000 },
              { type: 'exhale', duration: 6000 },
              { type: 'hold', duration: 2000 }
            ]
          }
        ]
      },
      {
        name: ['CO₂ толерантность (лайт)', 'CO₂ Tolerance (Light)'],
        aim: ['Толерантность к CO₂', 'CO₂ tolerance'],
        levels: [
          {
            cycles: 4,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 3000 },
              { type: 'hold', duration: 30000 },
              { type: 'exhale', duration: 5000 },
              { type: 'hold', duration: 10000 }
            ]
          }
        ]
      },
      {
        name: ['Резонансное дыхание продвинутое', 'Resonant Breathing Advanced'],
        aim: ['HRV, восстановление', 'HRV, recovery'],
        levels: [
          {
            cycles: 12,
            isDone: false,
            steps: [
              { type: 'inhale', duration: 5500 },
              { type: 'exhale', duration: 5500 }
            ]
          }
        ]
      }
    ]
  }
];
export function expandSteps(steps) {
  const res = [];
  for (const step of steps) {
    if (step.type === 'pattern') {
      for (let i = 0; i < step.repeat; i++) {
        res.push(...step.steps);
      }
    } else {
      res.push(step);
    }
  }
  return res;
}