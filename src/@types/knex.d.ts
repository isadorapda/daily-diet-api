// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Table {
    id: string
    session_id?: string
    name: string
    description: string
    is_diet: boolean
    date: string
    time: string
    created_at: string
    updated_at: string | Date
  }
}
