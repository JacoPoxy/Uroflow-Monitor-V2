import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { db } from './db/index';
import { voidings, fluid_intake } from './db/schema';
import { desc, eq } from 'drizzle-orm';

const app = express();
app.use(cors());
app.use(express.json());

// Voidings
app.get('/voidings', async (req, res) => {
  const rows = await db.select().from(voidings).orderBy(desc(voidings.voided_at));
  res.json(rows);
});

app.post('/voidings', async (req, res) => {
  const b = req.body;
  const row = await db.insert(voidings).values({
    voided_at: new Date(b.voided_at),
    volume_ml: b.volume_ml ?? null,
    qmax: b.qmax ?? null,
    duration_seconds: b.duration_seconds ?? null,
    urine_color: b.urine_color ?? null,
    cloudy: b.cloudy ?? null,
    appearance_tags: b.appearance_tags ?? null,
    hematuria: b.hematuria ?? null,
    urgency: b.urgency ?? null,
    pain_locations: b.pain_locations ?? null,
    pain_types: b.pain_types ?? null,
    is_nocturia: b.is_nocturia ?? false,
    notes: b.notes ?? null,
  }).returning();
  res.json(row[0]);
});

app.delete('/voidings/:id', async (req, res) => {
  await db.delete(voidings).where(eq(voidings.id, Number(req.params.id)));
  res.json({ success: true });
});

// Fluid intake
app.get('/fluid-intake', async (req, res) => {
  const rows = await db.select().from(fluid_intake).orderBy(desc(fluid_intake.recorded_at));
  res.json(rows);
});

app.post('/fluid-intake', async (req, res) => {
  const b = req.body;
  const row = await db.insert(fluid_intake).values({
    recorded_at: new Date(b.recorded_at),
    volume_ml: b.volume_ml ?? null,
    drink_types: b.drink_types ?? null,
  }).returning();
  res.json(row[0]);
});

app.delete('/fluid-intake/:id', async (req, res) => {
  await db.delete(fluid_intake).where(eq(fluid_intake.id, Number(req.params.id)));
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));