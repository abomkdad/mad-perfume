// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,integer,index,primaryKey} from 'drizzle-orm/sqlite-core';
export const sales=sqliteTable('sales',{
 id:text('id').primaryKey(),branchId:text('branch_id').notNull(),registerId:text('register_id').notNull(),cashier:text('cashier').notNull(),occurredAt:integer('occurred_at').notNull(),timePrecision:text('time_precision').notNull().default('second'),historical:integer('historical').notNull().default(0),amountMinor:integer('amount_minor').notNull(),currency:text('currency').notNull(),payment:text('payment').notNull(),products:text('products').notNull(),status:text('status').notNull(),createdAt:integer('created_at').notNull(),clipKey:text('clip_key'),attempts:integer('attempts').notNull().default(0),nextAttempt:integer('next_attempt').notNull(),lease:text('lease'),leaseUntil:integer('lease_until'),error:text('error')
},t=>[index('idx_sales_created').on(t.createdAt),index('idx_sales_jobs').on(t.status,t.nextAttempt)]);
export const mappings=sqliteTable('mappings',{branchId:text('branch_id').notNull(),registerId:text('register_id').notNull(),device:text('device').notNull(),channel:integer('channel').notNull(),offsetSeconds:integer('offset_seconds').notNull().default(0)},t=>[primaryKey({columns:[t.branchId,t.registerId]})]);
export const integrations=sqliteTable('integrations',{id:text('id').primaryKey(),status:text('status').notNull(),updatedAt:integer('updated_at').notNull(),lastSuccess:integer('last_success').notNull()});
