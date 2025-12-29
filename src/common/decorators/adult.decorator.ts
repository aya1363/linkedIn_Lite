import {registerDecorator,ValidationOptions,ValidationArguments,} from 'class-validator';

export function IsAdult(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
    registerDecorator({
        name: 'IsAdult',
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: {
            validate(value: any, args: ValidationArguments) {

                console.log(args.property);
                
        const dob = value instanceof Date ? value : new Date(value);
        if (isNaN(dob.getTime())) return false; 
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();

            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

            return age >= 18;
        },
        defaultMessage() {
            return 'Age must be 18 or older';
        },
        },
    });
    };
}
