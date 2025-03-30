export function calculateAdjustedPrice(
    total: number | undefined,
    fixturePrice: number | undefined
): number | undefined {
    if (total === undefined) return undefined;
    if (fixturePrice === undefined) return total;
    return total - fixturePrice;
}
