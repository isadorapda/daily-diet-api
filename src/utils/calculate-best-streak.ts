import { Table } from 'knex/types/tables'

export function calculateBestStreak(meals: Table[]) {
  const isDiet = meals.map((meal) => meal.is_diet)
  let currentStreak = 0
  let bestStreak = 0

  for (let i = 0; i < isDiet.length; i++) {
    if (isDiet[i]) {
      currentStreak++
      bestStreak = Math.max(bestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }
  return bestStreak
}
