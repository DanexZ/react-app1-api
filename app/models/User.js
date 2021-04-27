const Model = require('./Model');
const validator = require('validator');
const moment = require('moment');
const timezone = require('moment-timezone');

class User extends Model{
    constructor(data){
        super();
        this.data = data;
        this.errors = [];
    }



    cleanUp(){
        if(typeof(this.data.username) != 'string'){ this.data.username = '' }
        if(typeof(this.data.email) != 'string'){ this.data.email = '' }
        if(typeof(this.data.password) != 'string'){ this.data.password = '' }

        this.data = {
            username: this.data.username.trim(),
            email: this.data.email.trim().toLowerCase(),
            password: this.data.password,
            status: 'new',
            type: 'person',
            created_at: this.data.created_at = moment().tz('Europe/Warsaw').format('YYYY-MM-DD HH:mm:ss')
        }
    }



    validate(){

        return new Promise( async (resolve, reject) => {

            let validUsername = true;
            let validEmail = true;
    
            if(this.data.username == ""){
                this.errors.push("Należy ustawić nazwę użytkownika");
                validUsername = false;
            }
            if(this.data.username.length > 0 && this.data.username.length < 3){
                this.errors.push("Nazwa użytkownika musi zawierać co namniej 3 znaki");
                validUsername = false;
            }
            if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)){
                this.errors.push("Nazwa użytkownika może zawierać tylko litery i cyfry");
                validUsername = false;
            }
            if(this.data.username.length > 20){
                this.errors.push("Nazwa użytkownika nie może być dłuższa niż 20 znaków");
                validUsername = false;
            }
            if(this.data.username.toLowerCase().includes('admin') || this.data.username.toLowerCase().includes('moneyu')){
                this.errors.push("Nazwa użytkownika zawiera zastrzeżone słowo");
                validUsername = false;
            }
            if(!validator.isEmail(this.data.email)){
                this.errors.push("Wprowadź koniecznie poprawny e-mail");
                validEmail = false;
            }
            
            this.validPassword(this.data.password);
            
            // Only if username is valid then check if already exists in database
            if(validUsername){
                const users = await this.where('username', this.data.username).get();
    
                if(users.length){
                    this.errors.push("Ta nazwa użytkownika jest już zajęta");
                }
            }
    
            if(validEmail){
                const users = await this.where('email', this.data.username).get();
    
                if(users.length){
                    this.errors.push('Ten e-mail istnieje już w bazie danych');
                }
            }

            resolve();

        });
    }


    validPassword(password, repeatedPassword=null){

        if(password == ""){
            this.errors.push("Musisz wprowadzić hasło");
        }
        if(password.length > 0 && password.length < 10){
            this.errors.push("Hasło musi się składać z co najmniej 10 znaków");
        }
        if(password.length > 50){
            this.errors.push("Hasło nie może być dłuższe niż 50 znaków");
        }
        if(repeatedPassword && password != repeatedPassword){
            this.errors.push('Hasła nie pasują do siebie');
        }

        const specialChars = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '|', '{', '}', '[', ']', ':', ';', '"', "'", ',', '<', '.', '>', '/', '?' ];
        const bigLetters = 'ABCDEFGHIJKLMNOPRSTWUQVXYZ';
        const smallLetters = 'abcdefghijklmnoprstwuyxqz';
        const digits = '1234567890';

        let flag1 = false; 
        let flag2 = false; 
        let flag3 = false;
        let flag4 = false;

        for(let i=0; i<password.length; i++){
            for(let m=0; m<specialChars.length; m++){
                if(password[i] === specialChars[m]){
                    flag1 = true;
                }
            }

            for(let m=0; m<bigLetters.length; m++){
                if(password[i] === bigLetters.charAt(m)){
                    flag2 = true;
                }
            }

            for(let m=0; m<smallLetters.length; m++){
                if(password[i] === smallLetters.charAt(m)){
                    flag3 = true;
                }
            }

            for(let m=0; m<digits.length; m++){
                if(password[i] === digits.charAt(m)){
                    flag4 = true;
                }
            }
        }

        if(!flag1) this.errors.push('Hasło musi zawierać co najmniej jeden znak specjalny');
        if(!flag2) this.errors.push('Hasło musi zawierać co najmniej jedną dużą literę');
        if(!flag3) this.errors.push('Hasło musi zawierać co najmniej jedną małą literę');
        if(!flag4) this.errors.push('Hasło musi zawierać co najmniej jedną cyfrę');
    }

}

module.exports = User