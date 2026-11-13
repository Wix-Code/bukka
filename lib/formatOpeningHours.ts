type DaySchedule = {
  day: string;
  isOpen: boolean;
  open: string;
  close: string;
};

type WeeklySchedule = {
  format?: string;
  days: DaySchedule[];
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatOpeningHours(value?: string | null): string {
  if (!value) return "Opening hours not available";

  try {
    const schedule = JSON.parse(value) as WeeklySchedule;

    if (
      schedule.format === "mybukka-weekly-hours" &&
      Array.isArray(schedule.days)
    ) {
      const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "Africa/Lagos",
      }).format(new Date());

      const todaySchedule = schedule.days.find(
        (item) => item.day.toLowerCase() === today.toLowerCase(),
      );

      if (!todaySchedule) return "Opening hours not available";

      if (!todaySchedule.isOpen) {
        return "Closed today";
      }

      return `${formatTime(todaySchedule.open)} – ${formatTime(
        todaySchedule.close,
      )}`;
    }
  } catch {
    // Support older plain-text opening hours.
  }

  return value;
}
