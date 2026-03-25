export class StartDate {
  private constructor(public readonly value: Date) { }

  static create(date: Date): StartDate {
    if (date.getTime() <= Date.now()) {
      throw new Error("Date must be in the future");
    }

    return new StartDate(date);
  }

  static hydrate(date: Date): StartDate {
    return new StartDate(date);
  }

  getValue(): Date {
    return this.value;
  }

  equals(other: StartDate): boolean {
    if (!other) return false;
    return this.value.getTime() === other.value.getTime();
  }
}