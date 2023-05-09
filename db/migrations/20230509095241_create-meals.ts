import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('daily-meals', (t) => {
    t.uuid('id').primary()
    t.uuid('session_id').index()
    t.text('name').notNullable()
    t.text('description').notNullable()
    t.date('date').notNullable()
    t.time('time').notNullable()
    t.boolean('is_diet').notNullable()
    t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    t.timestamp('updated_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('daily-meals')
}
