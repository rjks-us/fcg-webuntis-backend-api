const {MongoClient} = require('mongodb');
const fs = require('fs');

const config = require('../static/config.json')

let _db;

/**
 * @description Returns the instance of the api db from the existing connection
 * @returns Promise<any>
 * 
 * This is a fuction - Robert, 05.09.2021
 */
const getDB = () => {return _db;}

/**
 * @description Gives back an Boolean, true = connected, false = disconnected
 * @returns Boolean
 */
const isConnected = () => {return (_db != undefined);}

/**
 * @description Connects to the mongodb database with the credentials from ../config.json
 * @returns Promise<any>
 * @async
 */
const login = async () => {
    return new Promise((resolve, rejects) => {
        if(isConnected()) rejects('Already connected to database');

        const mb = new MongoClient(`mongodb+srv://${config.mongo.USERNAME}:${config.mongo.PASSWORD}@fcg-app.ckpca.mongodb.net/_devices?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});

        mb.connect((err, db) => {
            if(err) return rejects(err); 

            _db = db.db('_devices');

            const tables = fs.readdirSync(__dirname + '/schematics').filter(file => file.toString().endsWith('.js'));

            tables.forEach(table => {
                const file = require(__dirname + '/schematics/' + table);
                
                file.setInstance(getDB());

                _db.createCollection(file.dbname, (err, res) => {});
            });

            return resolve(); 
        });
    });
}

/**
 * @description Disconnects from the Database
 * @returns Promise<any>
 * @async
 */
const disconnect = async () => {
    return new Promise((resolve, rejects) => {
        if(!isConnected()) rejects('There is no connection to the database');
    });
}

module.exports = {
    db: getDB,
    isConnected: isConnected,
    login: login,
    disconnect: disconnect
}