export class phoneNumber{
    value :string 
    constructor(value:string){
        if(!this.validatePhoneNumber(value)){
            throw new Error("Invalid phone number format");
        }

    }
    
    validatePhoneNumber(phoneNumber: string): boolean {
        const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;        
        return phoneNumberPattern.test(phoneNumber);
    }

}