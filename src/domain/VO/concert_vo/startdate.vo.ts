export class StartDate {
  private constructor(private readonly value: Date) {}

  static create(date: Date): StartDate {
    if (date.getTime() <= Date.now()) {
      throw new Error("Date must be in the future");
    }

    return new StartDate(date);
  }

  getValue(): Date {
    return this.value;
  }
}