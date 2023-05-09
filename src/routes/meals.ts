import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'
import dayjs from 'dayjs'
import { calculateBestStreak } from '../utils/calculate-best-streak'

export async function mealRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies
      const mealList = await knex('daily-meals')
        .where('session_id', sessionId)
        .select()

      return { mealList }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const mealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = mealParamsSchema.parse(req.params)

      const { sessionId } = req.cookies

      const meal = await knex('daily-meals')
        .where({ id, session_id: sessionId })
        .select()

      return { meal }
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const mealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const mealsBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        isDiet: z.boolean().optional(),
      })

      const { id } = mealParamsSchema.parse(req.params)

      const { name, date, description, time, isDiet } = mealsBodySchema.parse(
        req.body,
      )

      const { sessionId } = req.cookies

      const parsedDate = dayjs(`${date} ${time}`).format('YYYY-MM-DD HH:mm')

      await knex('daily-meals')
        .where({ id, session_id: sessionId })
        .update({
          name,
          description,
          time,
          date: parsedDate,
          is_diet: isDiet,
          updated_at: dayjs().format('YYYY-MM-DD HH:mm'),
        })

      return reply.status(200).send()
    },
  )

  app.get(
    '/statistics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies

      const meals = await knex('daily-meals')
        .where('session_id', sessionId)
        .orderBy('date')

      const stats = {
        totalMeals: meals.length,
        totalMealsDiet: meals.filter((meal) => meal.is_diet).length,
        totalMealsNotDiet: meals.filter((meal) => !meal.is_diet).length,
        bestStreakFollowingDiet: calculateBestStreak(meals),
      }

      return { stats }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const mealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = mealParamsSchema.parse(req.params)

      const { sessionId } = req.cookies

      await knex('daily-meals').where({ id, session_id: sessionId }).del()

      return reply.status(200).send()
    },
  )

  app.post('/', async (req, reply) => {
    const mealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      isDiet: z.boolean(),
    })

    const { name, description, date, time, isDiet } = mealBodySchema.parse(
      req.body,
    )

    const parsedDate = dayjs(`${date} ${time}`).format('YYYY-MM-DD HH:mm')

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('daily-meals').insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      description,
      date: parsedDate,
      time,
      is_diet: isDiet,
    })
    return reply.status(201).send()
  })
}
