require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const DailyMetric = require('../src/models/analytics.model');

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Priya', 'Wei',
  'Sofia', 'Liam', 'Noah', 'Emma', 'Ava', 'Mia', 'Ethan', 'Ravi', 'Anika',
  'Diego', 'Fatima', 'Lucas',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Patel', 'Kim', 'Garcia', 'Chen', 'Silva', 'Kumar',
  'Nguyen', 'Brown', 'Davis', 'Martin', 'Lopez', 'Clark', 'Rossi',
];

const SEED_DAYS = 45;
const DELETED_RATIO = 0.12;

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

// Deterministic PRNG so re-running the script produces the same dataset.
function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function seed() {
  await connectDB();
  const rng = mulberry32(20260818);

  const now = new Date();
  now.setHours(9, 0, 0, 0);

  const docs = [];
  const metricDocs = [];
  let seq = 1;
  for (let dayOffset = SEED_DAYS - 1; dayOffset >= 0; dayOffset--) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - dayOffset);
    const dateKey = createdAt.toISOString().slice(0, 10);

    // Gentle upward trend: more signups on recent days than old ones.
    const progress = (SEED_DAYS - dayOffset) / SEED_DAYS;
    const signupsToday = 1 + Math.floor(rng() * 3) + Math.round(progress * 3);

    metricDocs.push({
      updateOne: {
        filter: { date: dateKey },
        update: {
          $set: { newUsers: signupsToday },
          $setOnInsert: { __v: 0 },
        },
        upsert: true,
      },
    });

    for (let i = 0; i < signupsToday; i++) {
      createdAt.setMinutes(createdAt.getMinutes() + Math.floor(rng() * 90));
      const name = `${pick(FIRST_NAMES, rng)} ${pick(LAST_NAMES, rng)}`;
      const email = `seed.user${seq}@example.com`;
      const isDeleted = rng() < DELETED_RATIO;
      let updatedAt = new Date(createdAt);
      if (isDeleted) {
        updatedAt = new Date(createdAt);
        updatedAt.setDate(updatedAt.getDate() + 1 + Math.floor(rng() * Math.max(dayOffset, 1)));
        if (updatedAt > now) updatedAt = new Date(now);
      }

      docs.push({
        updateOne: {
          filter: { email },
          update: {
            $set: {
              name,
              email,
              isDeleted,
              createdAt,
              updatedAt,
            },
            $setOnInsert: {
              __v: 0,
            },
          },
          upsert: true,
        },
      });
      seq++;
    }
  }

  const result = await User.collection.bulkWrite(docs, { ordered: false });
  console.log(`Seeded ${docs.length} sample users (matched ${result.matchedCount}, upserted ${result.upsertedCount}).`);

  const metricResult = await DailyMetric.collection.bulkWrite(metricDocs, { ordered: false });
  console.log(`Seeded ${metricDocs.length} daily metrics (matched ${metricResult.matchedCount}, upserted ${metricResult.upsertedCount}).`);

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
