import { DateTime } from 'luxon';

export function getTimeOfDay(date: DateTime = DateTime.now()) {
  const hour = Number(date.toFormat('h'));
  return hour >= 6 && hour < 12
    ? 'morning'
    : hour >= 12 && hour < 18
      ? 'afternoon'
      : hour >= 18 && hour < 22
        ? 'evening'
        : 'night';
}
