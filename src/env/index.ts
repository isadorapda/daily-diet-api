import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const environmentVariables = z.object({
  NODE_ENV: z.enum(['test', 'development', 'production']).default('production'),
  DATABASE_URL: z.string(),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']).default('sqlite'),
  PORT: z.coerce.number().default(3333),
})

const _env = environmentVariables.safeParse(process.env)
if (_env.success === false) {
  console.error('Invalid', _env.error.format())

  throw new Error('Environment variable is invalid')
}

export const env = _env.data
