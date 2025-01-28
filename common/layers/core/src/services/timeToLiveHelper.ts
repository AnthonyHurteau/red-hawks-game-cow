type Durations = "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";

export const timeToLive = (ttl: number, duration: Durations): number => {
    const durationMultipliers: { [key in Durations]: number } = {
        seconds: 1,
        minutes: 60,
        hours: 60 * 60,
        days: 24 * 60 * 60,
        weeks: 7 * 24 * 60 * 60,
        months: 30 * 24 * 60 * 60, // Approximation
        years: 365 * 24 * 60 * 60, // Approximation
    };

    const multiplier = durationMultipliers[duration];

    const result = Math.floor((new Date().getTime() + ttl * multiplier * 1000) / 1000);

    return result;
};
