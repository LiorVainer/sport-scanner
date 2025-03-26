export const calculateCurrentSeason = (date: Date): number => {
    return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
};
