import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { mealRoutes } from './routes/meals'

export const app = fastify()

app.register(cookie)

app.register(mealRoutes, {
  prefix: 'daily-meals',
})
