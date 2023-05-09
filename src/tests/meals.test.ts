import { describe, test, beforeAll, beforeEach, afterAll, expect } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { app } from '../app'

describe('End-to-end test meal routes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback')
    execSync('npm run knex -- migrate:latest')
  })

  test('user is able to log a meal', async () => {
    await request(app.server)
      .post('/daily-meals')
      .send({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '01/01/2023',
        time: '13:00',
        isDiet: true,
      })
      .expect(201)
  })
  test('user is able to access a list of meals', async () => {
    const createMealsResponse = await request(app.server)
      .post('/daily-meals')
      .send({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '01/01/2023',
        time: '13:00',
        isDiet: true,
      })
    const cookie = createMealsResponse.get('Set-Cookie')
    const mealsList = await request(app.server)
      .get('/daily-meals')
      .set('Cookie', cookie)
      .expect(200)

    expect(mealsList.body.mealList).toEqual([
      expect.objectContaining({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '2023-01-01 13:00',
        time: '13:00',
        is_diet: 1,
      }),
    ])
  })
  test('user is able to access a specific meal', async () => {
    const createMealsResponse = await request(app.server)
      .post('/daily-meals')
      .send({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '01/01/2023',
        time: '13:00',
        isDiet: true,
      })
    const cookie = createMealsResponse.get('Set-Cookie')
    const mealResponse = await request(app.server)
      .get('/daily-meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = mealResponse.body.mealList[0].id

    const getMealResponse = await request(app.server)
      .get(`/daily-meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '2023-01-01 13:00',
        time: '13:00',
        is_diet: 1,
      }),
    )
  })
  test('user is able to delete a specific meal', async () => {
    const createMealsResponse = await request(app.server)
      .post('/daily-meals')
      .send({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '01/01/2023',
        time: '13:00',
        isDiet: true,
      })
    const cookie = createMealsResponse.get('Set-Cookie')

    const mealResponse = await request(app.server)
      .get('/daily-meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = mealResponse.body.mealList[0].id

    await request(app.server)
      .delete(`/daily-meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(200)
  })
  test('user is able to edit a specific meal', async () => {
    const createMealsResponse = await request(app.server)
      .post('/daily-meals')
      .send({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '01/01/2023',
        time: '13:00',
        isDiet: true,
      })
    const cookie = createMealsResponse.get('Set-Cookie')

    const mealResponse = await request(app.server)
      .get('/daily-meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = mealResponse.body.mealList[0].id

    await request(app.server)
      .put(`/daily-meals/${mealId}`)
      .send({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '01/01/2023',
        time: '18:00',
        isDiet: false,
      })
      .set('Cookie', cookie)
      .expect(200)
  })

  test('user is able to access the statistics', async () => {
    const createMealsResponse = await request(app.server)
      .post('/daily-meals')
      .send({
        name: 'Meal test 1',
        description: 'Description of meal test 1',
        date: '01/01/2023',
        time: '13:00',
        isDiet: true,
      })
    const cookie = createMealsResponse.get('Set-Cookie')

    await request(app.server).post('/daily-meals').set('Cookie', cookie).send({
      name: 'Meal test 2',
      description: 'Description of meal test 2',
      date: '01/01/2023',
      time: '16:00',
      isDiet: true,
    })
    await request(app.server).post('/daily-meals').set('Cookie', cookie).send({
      name: 'Meal test 3',
      description: 'Description of meal test 3',
      date: '01/01/2023',
      time: '22:00',
      isDiet: false,
    })

    const mealsStatsResponse = await request(app.server)
      .get('/daily-meals/statistics')
      .set('Cookie', cookie)
      .expect(200)

    expect(mealsStatsResponse.body.stats).toEqual({
      totalMeals: 3,
      totalMealsDiet: 2,
      totalMealsNotDiet: 1,
      bestStreakFollowingDiet: 2,
    })
  })
})
