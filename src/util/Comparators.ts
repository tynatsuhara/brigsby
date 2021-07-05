export const Comparators = {
    orderBy: <T>(fn: (T) => number): (a: T, b: T) => number => {
        return (a: T, b: T) => fn(a) - fn(b)
    }
}