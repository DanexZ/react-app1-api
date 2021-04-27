const db = require('../../db');
const {makePlural} = require('../functions/makePlural');
const {removeLastChar} = require('../functions/removeLastChar');

class Model{
    constructor(){
        this.modelName = this.getTableName(this.constructor.name);
        this.tableName = makePlural(this.modelName);
        this.relations = [];
        this.relFlag = false;
        this.oneFlag = false;
        this.whereConditions = '';
        this.getCounter = 0;
    }


    getTableName(text){

        const array = text.match(/[A-Z][a-z]+/g);
        let newText = array[0];

        for(let i=1; i<array.length; i++){
            newText += `_${array[i]}`;
        }
            
        return newText.toLowerCase();
    }




    create(columns, values){
        return new Promise((resolve, reject) => {

            let columns_str = '';
            let questions_str = '';

            for(let i=0; i<columns.length; i++){
                columns_str += `${columns[i]},`;
            }

            for(let i=0; i<values.length; i++){
                questions_str += '?,';
            }

            columns_str = removeLastChar(columns_str);
            questions_str = removeLastChar(questions_str);


            const query = `INSERT INTO ${this.tableName} (${columns_str}) VALUES (${questions_str})`;

            console.log(values);
            console.log(query);
            
            db.query(query, values, (err, info) => {
                if (err) reject(err);console.log(err);

                resolve(info.insertId);
            });

        });
    }



    createMany(columns, rows){
        return new Promise((resolve, reject) => {

            let columns_str = '';
            let values_str = '';

            for(let i=0; i<columns.length; i++){
                columns_str += `${columns[i]},`;
            }

            rows.forEach(row => {

                let items = '';

                for(let [key, value] of Object.entries(row)) {
                    value = db.escape(value); 
                    items += `'${value}',`; 
                }

                const singleRow = `( ${removeLastChar(items)} )`;

                values_str += `${singleRow},`;

            });

            columns_str = removeLastChar(columns_str);
            values_str = removeLastChar(values_str);


            const query = `INSERT INTO ${this.tableName} (${columns_str}) VALUES ${values_str}`;

            console.log(query);
            
            db.query(query, (err, info) => {
                if (err) reject(err);console.log(err);

                resolve(info);
            });

        });
    }



    delete(){
        return new Promise((resolve, reject) => {

            const query = `DELETE FROM ${this.tableName} ${this.whereConditions}`;

            db.query(query, (err, {affectedRows}, fields) => {
                if (err) reject(err);

                this.whereConditions = '';

                resolve(affectedRows);
            });
        });
    }



    edit(columns, values){
        return new Promise((resolve, reject) => {

            let assigments = '';

            for(let i=0; i<columns.length; i++){
                assigments += `${columns[i]}='${values[i]}', `;
            }

            assigments = removeLastChar(assigments.trim());

            const query = `UPDATE ${this.tableName} SET ${assigments} ${this.whereConditions}`;
            console.log(query);
            
            db.query(query, (err, {changedRows}, fields) => {
                if (err) reject(err);

                console.log(changedRows);
                this.whereConditions = '';

                resolve(changedRows);
            });

        });
    }



    first(){

        return this[`${this.tableName}`][0];

    }



    get(selector='*', table=null){
        return new Promise(async (resolve, reject) => {

            if(this.relations.length && !this.getCounter){

                this.getCounter = 1;
                table = await this.get();

                console.log(table[0]);

                let foreign_key = `${this.modelName}_id`;
                
                const relTables = [];
    
                for(let i=0; i<this.relations.length; i++){
                    const relTable = await this.get('*', this.relations[i]);
                    relTables.push(relTable);
                }

                for(let i=0; i<table.length; i++){
                    for(let m=0; m<this.relations.length; m++){
    
                        const relation = `${(this.relations[m])}`;
                        console.log(`relation: ${relation}`);
    
                        table[i][`${relation}`] = [];
    
                        for(let n=0; n<relTables.length; n++){
    
                            const relTable = relTables[n];
                            console.log(relTable);

                            if(relTable.length){
                                for(let [key] of Object.entries(relTable[0])) {

                                    if(key == 'commentable_id'){
                                        foreign_key = 'commentable_id'
                                    }
                                }
                            }
                            

                            console.log(`foreign_key: ${foreign_key}`);
    
                            for(let o=0; o<relTable.length; o++){
    
                                if( relTable[o][`${foreign_key}`] == table[i].id){
                                    table[i][`${relation}`].push(relTable[o]);
                                }
    
                            }
                        }
                    }   
                }
                
                this[`${this.tableName}`] = table;
                this.getCounter = 0;

                if(this.singleFlag){
                    this.singleFlag = false;

                    resolve(table[0]);
                } else {
                    resolve(table);
                }

            } else {

                table = table ? table : this.tableName;

                const query = `SELECT ${selector} FROM ${table} ${this.whereConditions}`;
                console.log(query);
    
                db.query(query, (err, array, fields) => {
                    if (err) reject(err);
    
                    this.whereConditions = '';
                    this[`${this.tableName}`] = array;

                    if(this.oneFlag){
                        this.oneFlag = false;

                        if(array.length){
                            resolve(array[0]);
                        } else {
                            resolve(false);
                        }
                        
                    } else {
                        resolve(array);
                    }
                    
                }); 
            }

        });
    }




    with(str){

        this.relations = str.split(', ');

        return this;
    }



    where(column_name, comparison){

        //comparison = db.escape(comparison);

        if(this.whereConditions.includes('WHERE')){
            this.whereConditions = `${this.whereConditions} AND ${column_name}='${comparison}'`;
        } else {
            this.whereConditions = `WHERE ${column_name}='${comparison}'`;
        }

        return this;    
    }

    
    one(param=null){

        if(param == 'single'){
            this.singleFlag = true;
        } else {
            this.oneFlag = true;
        }
        
        return this;
    }


}

module.exports = Model;