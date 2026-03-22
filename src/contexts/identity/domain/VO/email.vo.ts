export class Email{
    value :string   
    constructor(value:string){
        if(!value.includes("@")){
            throw new Error("Invalid email format");
        }
    }
}