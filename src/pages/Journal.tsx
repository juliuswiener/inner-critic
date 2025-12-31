import { useState } from 'react';
import { useJournalStore } from '../store/journalStore';
import { ChevronLeft, ChevronRight, TrendingUp, Minus, TrendingDown, Settings2 } from 'lucide-react';
import type { RelativeRating } from '../types/journal';
import { Link } from 'react-router-dom';

const getDateString = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0];
};

const formatDisplayDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = getDateString();
  const yesterday = getDateString(new Date(Date.now() - 86400000));

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const CATEGORY_COLORS: Record<string, string> = {
  wellness: 'soft-card-peach',
  emotional: 'soft-card-lavender',
  social: 'soft-card-sky',
  growth: 'soft-card-mint',
  physical: 'soft-card-rose',
};

export function Journal() {
  const [selectedDate, setSelectedDate] = useState(getDateString());
  const {
    trackableItems,
    reflectionPrompts,
    getEntryByDate,
    setTracking,
    setReflection,
    setNotes,
    getStreakDays,
  } = useJournalStore();

  const entry = getEntryByDate(selectedDate);
  const enabledItems = trackableItems.filter((item) => item.enabled);
  const enabledPrompts = reflectionPrompts.filter((p) => p.enabled);
  const streak = getStreakDays();

  const goToPrevDay = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    setSelectedDate(getDateString(date));
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    const tomorrow = getDateString(date);
    if (tomorrow <= getDateString()) {
      setSelectedDate(tomorrow);
    }
  };

  const getRating = (itemId: string): RelativeRating => {
    return entry?.trackings.find((t) => t.itemId === itemId)?.rating || null;
  };

  const getReflectionResponse = (promptId: string): string => {
    return entry?.reflections.find((r) => r.id === promptId)?.response || '';
  };

  const handleRating = (itemId: string, rating: RelativeRating) => {
    const currentRating = getRating(itemId);
    // Toggle off if clicking same rating
    if (currentRating === rating) {
      setTracking(selectedDate, itemId, null);
    } else {
      setTracking(selectedDate, itemId, rating);
    }
  };

  // Group items by category
  const itemsByCategory = enabledItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof enabledItems>
  );

  const isToday = selectedDate === getDateString();

  return (
    <div className="soft-page min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl soft-heading mb-1">Evening Reflection</h1>
            <p className="soft-subheading">How was your day compared to yesterday?</p>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="soft-card-mint px-4 py-2 flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-semibold">{streak} day streak</span>
              </div>
            )}
            <Link
              to="/journal/settings"
              className="p-3 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
              title="Customize tracking"
            >
              <Settings2 className="w-5 h-5 text-soft-text" />
            </Link>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="soft-card mb-8 flex items-center justify-between">
          <button
            onClick={goToPrevDay}
            className="p-3 rounded-full hover:bg-soft-fog transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-soft-text" />
          </button>
          <div className="text-center">
            <p className="text-xl font-semibold soft-heading">{formatDisplayDate(selectedDate)}</p>
            <p className="text-sm soft-subheading">{selectedDate}</p>
          </div>
          <button
            onClick={goToNextDay}
            disabled={isToday}
            className={`p-3 rounded-full transition-colors ${
              isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-soft-fog'
            }`}
          >
            <ChevronRight className="w-6 h-6 text-soft-text" />
          </button>
        </div>

        {/* Tracking Items by Category */}
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-semibold soft-heading capitalize mb-3 px-2">
              {category}
            </h2>
            <div className="space-y-3">
              {items.map((item) => {
                const rating = getRating(item.id);
                return (
                  <div key={item.id} className={`${CATEGORY_COLORS[category]} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-soft-text">{item.name}</p>
                          <p className="text-sm text-soft-text-light">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRating(item.id, 'worse')}
                          className={`${
                            rating === 'worse' ? 'soft-rating-worse' : 'soft-rating-btn'
                          }`}
                          title="Worse than yesterday"
                        >
                          <TrendingDown className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleRating(item.id, 'same')}
                          className={`${
                            rating === 'same' ? 'soft-rating-same' : 'soft-rating-btn'
                          }`}
                          title="Same as yesterday"
                        >
                          <Minus className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleRating(item.id, 'better')}
                          className={`${
                            rating === 'better' ? 'soft-rating-better' : 'soft-rating-btn'
                          }`}
                          title="Better than yesterday"
                        >
                          <TrendingUp className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Reflections */}
        {enabledPrompts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold soft-heading mb-3 px-2">Reflections</h2>
            <div className="space-y-4">
              {enabledPrompts.map((prompt) => (
                <div key={prompt.id} className="soft-card">
                  <label className="block font-semibold text-soft-text mb-2">
                    {prompt.prompt}
                  </label>
                  <textarea
                    value={getReflectionResponse(prompt.id)}
                    onChange={(e) => setReflection(selectedDate, prompt.id, e.target.value)}
                    placeholder="Write your thoughts..."
                    className="w-full soft-textarea min-h-[100px]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        <div className="soft-card">
          <label className="block font-semibold text-soft-text mb-2">
            Additional Notes (optional)
          </label>
          <textarea
            value={entry?.notes || ''}
            onChange={(e) => setNotes(selectedDate, e.target.value)}
            placeholder="Anything else you want to remember about today..."
            className="w-full soft-textarea min-h-[80px]"
          />
        </div>

        {/* Navigation to Stats */}
        <div className="mt-8 text-center">
          <Link to="/journal/stats" className="soft-btn-primary inline-flex items-center gap-2">
            View Your Progress
            <TrendingUp className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
