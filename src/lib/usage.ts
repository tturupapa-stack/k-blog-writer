const STORAGE_KEY = "k-blog-writer-usage";
const DAILY_LIMIT = 3;

interface UsageData {
  date: string;
  count: number;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function getUsage(): UsageData {
  if (typeof window === "undefined") return { date: getTodayStr(), count: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getTodayStr(), count: 0 };
    const data: UsageData = JSON.parse(raw);
    if (data.date !== getTodayStr()) {
      return { date: getTodayStr(), count: 0 };
    }
    return data;
  } catch {
    return { date: getTodayStr(), count: 0 };
  }
}

export function getRemainingUses(): number {
  const usage = getUsage();
  return Math.max(0, DAILY_LIMIT - usage.count);
}

export function canUse(): boolean {
  return getRemainingUses() > 0;
}

export function incrementUsage(): void {
  const usage = getUsage();
  const updated: UsageData = {
    date: getTodayStr(),
    count: usage.count + 1,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
