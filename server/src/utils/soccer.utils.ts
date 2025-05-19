export const calculateCurrentSeason = (date: Date): number => {
    return date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1;
};
