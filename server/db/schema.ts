import { pgTable, serial, timestamp, integer, boolean, text, real } from 'drizzle-orm/pg-core';

export const voidings = pgTable('voidings', {
  id: serial('id').primaryKey(),
  voided_at: timestamp('voided_at').notNull(),
  volume_ml: integer('volume_ml'),
  qmax: real('qmax'),
  duration_seconds: integer('duration_seconds'),
  urine_color: text('urine_color'),
  cloudy: boolean('cloudy'),
  appearance_tags: text('appearance_tags'),
  hematuria: text('hematuria'),
  urgency: text('urgency'),
  pain_locations: text('pain_locations'),
  pain_types: text('pain_types'),
  is_nocturia: boolean('is_nocturia'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
});

export const fluid_intake = pgTable('fluid_intake', {
  id: serial('id').primaryKey(),
  recorded_at: timestamp('recorded_at').notNull(),
  volume_ml: integer('volume_ml'),
  drink_types: text('drink_types'),
  created_at: timestamp('created_at').defaultNow(),
});