function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

function resetAuditUsageIfNeeded(user) {
  const today = getTodayDateString();

  if (user.usageDate !== today) {
    user.auditsUsedToday = 0;
    user.usageDate = today;
  }
}

function hasReachedFreeAuditLimit(user) {
  if (!user) return false;
  if (user.plan !== "free") return false;

  resetAuditUsageIfNeeded(user);

  return user.auditsUsedToday >= 2;
}

function getAuditUsageData(user) {
  if (!user) return null;

  return {
    plan: user.plan,
    auditsUsedToday: user.auditsUsedToday,
    auditsRemaining:
      user.plan === "free" ? Math.max(0, 2 - user.auditsUsedToday) : null,
    usageDate: user.usageDate,
  };
}

module.exports = {
  getTodayDateString,
  resetAuditUsageIfNeeded,
  hasReachedFreeAuditLimit,
  getAuditUsageData,
};