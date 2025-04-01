export class Timer<Step extends string> {
    private startTime: number;
    private steps: Partial<Record<Step, { start: number; end?: number }>> = {};

    constructor() {
        this.startTime = Date.now();
    }

    start(step: Step) {
        this.steps[step] = {start: Date.now()};
    }

    stop(step: Step) {
        const stepData = this.steps[step];
        if (!stepData) {
            throw new Error(`Timer step "${step}" was never started.`);
        }
        stepData.end = Date.now();
    }

    total(): number {
        return Date.now() - this.startTime;
    }

    timings(): Partial<Record<Step, number>> {
        const result: Partial<Record<Step, number>> = {};
        for (const [key, value] of Object.entries(this.steps) as [Step, { start: number; end?: number }][]) {
            if (value.end !== undefined) {
                result[key] = value.end - value.start;
            }
        }
        return result;
    }
}