export function orderLines(lines: string[]) {
    return lines.sort((a, b) => {
        if (a.startsWith("M")) return -1;
        if (b.startsWith("M")) return 1;
        if (a.startsWith("T")) return -1;
        if (b.startsWith("T")) return 1;
        if (a.startsWith("F")) return -1;
        if (b.startsWith("F")) return 1;
        return 0;
    });
}
