import { DetailDivide } from "./detail_devide";

export class Divide {
    id: number;
    name: string;
    detail_divide: DetailDivide[];

    constructor(id: number, name: string , detail_divide: DetailDivide[]) {
        this.id = id;
        this.name = name;
        this.detail_divide = detail_divide;
       
    }
    static create(id: number, name: string , detail_divide: DetailDivide[]): Divide {
        if (!name) throw new Error("Name is required");
        return new Divide(id, name , detail_divide);
    }

    addDetailDivide(detail_divide: DetailDivide): void {
        this.detail_divide.push(detail_divide);
    }
    getId(): number {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    setName(name: string): void {
        this.name = name;
    }
}