import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useJournalStore } from '../store/journalStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { ChevronLeft, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RelativeRating } from '../types/journal';

const getDateString = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Convert relative ratings to numeric values for charting
const ratingToValue = (rating: RelativeRating): number => {
  switch (rating) {
    case 'better':
      return 1;
    case 'same':
      return 0;
    case 'worse':
      return -1;
    default:
      return 0;
  }
};

// Calculate cumulative score over time
const calculateCumulativeScore = (
  entries: { date: string; value: number }[]
): { date: string; score: number; displayDate: string }[] => {
  let cumulative = 0;
  return entries.map((entry) => {
    cumulative += entry.value;
    return {
      date: entry.date,
      score: cumulative,
      displayDate: new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  });
};

export function JournalStats() {
  const { entries, trackableItems, getStreakDays } = useJournalStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);

  const enabledItems = trackableItems.filter((item) => item.enabled);
  const streak = getStreakDays();

  // Get entries for the selected time range
  const rangeEntries = useMemo(() => {
    const endDate = getDateString();
    const startDate = getDateString(new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000));
    return entries
      .filter((e) => e.date >= startDate && e.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, timeRange]);

  // Calculate overall progress data
  const overallProgressData = useMemo(() => {
    const dailyScores: { date: string; value: number }[] = [];

    rangeEntries.forEach((entry) => {
      const dayScore = entry.trackings.reduce((sum, t) => sum + ratingToValue(t.rating), 0);
      dailyScores.push({ date: entry.date, value: dayScore });
    });

    return calculateCumulativeScore(dailyScores);
  }, [rangeEntries]);

  // Calculate per-item progress data
  const itemProgressData = useMemo(() => {
    if (!selectedItemId) return [];

    const itemEntries: { date: string; value: number }[] = [];

    rangeEntries.forEach((entry) => {
      const tracking = entry.trackings.find((t) => t.itemId === selectedItemId);
      if (tracking) {
        itemEntries.push({ date: entry.date, value: ratingToValue(tracking.rating) });
      }
    });

    return calculateCumulativeScore(itemEntries);
  }, [rangeEntries, selectedItemId]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    let better = 0;
    let same = 0;
    let worse = 0;

    rangeEntries.forEach((entry) => {
      entry.trackings.forEach((t) => {
        if (t.rating === 'better') better++;
        else if (t.rating === 'same') same++;
        else if (t.rating === 'worse') worse++;
      });
    });

    const total = better + same + worse;
    return { better, same, worse, total };
  }, [rangeEntries]);

  // Per-item stats
  const itemStats = useMemo(() => {
    return enabledItems.map((item) => {
      let better = 0;
      let same = 0;
      let worse = 0;

      rangeEntries.forEach((entry) => {
        const tracking = entry.trackings.find((t) => t.itemId === item.id);
        if (tracking?.rating === 'better') better++;
        else if (tracking?.rating === 'same') same++;
        else if (tracking?.rating === 'worse') worse++;
      });

      const trend = better - worse;
      return { ...item, better, same, worse, trend };
    });
  }, [rangeEntries, enabledItems]);

  return (
    <div className="soft-page min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/journal"
            className="p-3 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-soft-text" />
          </Link>
          <div>
            <h1 className="text-3xl soft-heading mb-1">Your Progress</h1>
            <p className="soft-subheading">See how you've been doing over time</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="soft-card mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-soft-text-light" />
            <span className="font-medium text-soft-text">Time range:</span>
          </div>
          <div className="flex gap-2">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  timeRange === days ? 'soft-pill-active' : 'soft-pill'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="soft-card-mint text-center">
            <p className="text-3xl font-bold text-soft-text">{summaryStats.better}</p>
            <p className="text-sm text-soft-text-light flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" /> Better days
            </p>
          </div>
          <div className="soft-card-sky text-center">
            <p className="text-3xl font-bold text-soft-text">{summaryStats.same}</p>
            <p className="text-sm text-soft-text-light flex items-center justify-center gap-1">
              <Minus className="w-4 h-4" /> Steady days
            </p>
          </div>
          <div className="soft-card-rose text-center">
            <p className="text-3xl font-bold text-soft-text">{summaryStats.worse}</p>
            <p className="text-sm text-soft-text-light flex items-center justify-center gap-1">
              <TrendingDown className="w-4 h-4" /> Tough days
            </p>
          </div>
          <div className="soft-card-lavender text-center">
            <p className="text-3xl font-bold text-soft-text">{streak}</p>
            <p className="text-sm text-soft-text-light">🔥 Day streak</p>
          </div>
        </div>

        {/* Overall Progress Chart */}
        <div className="soft-card mb-8">
          <h2 className="text-xl font-semibold soft-heading mb-4">Overall Trend</h2>
          {overallProgressData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overallProgressData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9B8DC" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C9B8DC" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                  <XAxis dataKey="displayDate" stroke="#7A7A7A" fontSize={12} />
                  <YAxis stroke="#7A7A7A" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAFAFA',
                      border: 'none',
                      borderRadius: '1rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#B8A4D0"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-8 text-soft-text-light">
              No data yet. Start tracking to see your progress!
            </p>
          )}
        </div>

        {/* Per-Item Stats */}
        <div className="soft-card mb-8">
          <h2 className="text-xl font-semibold soft-heading mb-4">By Category</h2>
          <div className="space-y-3">
            {itemStats.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setSelectedItemId(selectedItemId === item.id ? null : item.id)
                }
                className={`w-full p-4 rounded-xl transition-all flex items-center justify-between ${
                  selectedItemId === item.id
                    ? 'bg-soft-lavender'
                    : 'bg-soft-fog hover:bg-soft-lavender/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-soft-text">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-green-600">↑{item.better}</span>
                    <span className="text-blue-500">→{item.same}</span>
                    <span className="text-red-400">↓{item.worse}</span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.trend > 0
                        ? 'bg-soft-mint text-green-700'
                        : item.trend < 0
                          ? 'bg-soft-rose text-red-600'
                          : 'bg-soft-sky text-blue-600'
                    }`}
                  >
                    {item.trend > 0 ? '+' : ''}
                    {item.trend}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Item Chart */}
        {selectedItemId && itemProgressData.length > 0 && (
          <div className="soft-card">
            <h2 className="text-xl font-semibold soft-heading mb-4">
              {enabledItems.find((i) => i.id === selectedItemId)?.name} Trend
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={itemProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                  <XAxis dataKey="displayDate" stroke="#7A7A7A" fontSize={12} />
                  <YAxis stroke="#7A7A7A" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAFAFA',
                      border: 'none',
                      borderRadius: '1rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#A8D5B4"
                    strokeWidth={3}
                    dot={{ fill: '#A8D5B4', strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
