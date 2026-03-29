import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { db } from './db/index';
import { voidings, fluid_intake } from './db/schema';
import { desc } from 'drizzle-orm';

const app = express();
app.use(cors());
app.use(express.json());

// Voidings
app.get('/voidings', async (req, res) => {
  const rows = await db.select().from(voidings).orderBy(desc(voidings.voided_at));
  res.json(rows);
});

app.post('/voidings', async (req, res) => {
  const row = await db.insert(voidings).values(req.body).returning();
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
  const row = await db.insert(fluid_intake).values(req.body).returning();
  res.json(row[0]);
});

app.delete('/fluid-intake/:id', async (req, res) => {
  await db.delete(fluid_intake).where(eq(fluid_intake.id, Number(req.params.id)));
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));