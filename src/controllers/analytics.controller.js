const User = require('../models/user.model');
const Account = require('../models/account.model');
const DailyMetric = require('../models/analytics.model');

const TREND_DAYS = 30;

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

async function syncTodayMetric(today) {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const newUsersToday = await User.countDocuments({
    createdAt: { $gte: today, $lt: tomorrow },
  });

  await DailyMetric.findOneAndUpdate(
    { date: dateKey(today) },
    { $set: { newUsers: newUsersToday } },
    { upsert: true }
  );
}

async function getSummary(req, res) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = new Date(today);
  since.setDate(since.getDate() - (TREND_DAYS - 1));

  await syncTodayMetric(today);

  const [totalActive, totalDeleted, totalAccounts, metrics] = await Promise.all([
    User.countDocuments({ isDeleted: { $ne: true } }),
    User.countDocuments({ isDeleted: true }),
    Account.countDocuments(),
    DailyMetric.find({ date: { $gte: dateKey(since) } }).sort({ date: 1 }),
  ]);

  const countsByDay = new Map(metrics.map((row) => [row.date, row.newUsers]));
  const dailySignups = [];
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = dateKey(d);
    dailySignups.push({ date: key, count: countsByDay.get(key) || 0 });
  }

  const last7 = dailySignups.slice(-7).reduce((sum, d) => sum + d.count, 0);
  const prev7 = dailySignups.slice(-14, -7).reduce((sum, d) => sum + d.count, 0);

  res.json({
    totals: {
      activeUsers: totalActive,
      deletedUsers: totalDeleted,
      totalUsers: totalActive + totalDeleted,
      accounts: totalAccounts,
    },
    newUsers: {
      last7Days: last7,
      previous7Days: prev7,
    },
    dailySignups,
  });
}

module.exports = { getSummary };
