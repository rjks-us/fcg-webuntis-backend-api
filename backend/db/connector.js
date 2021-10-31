const {MongoClient} = require('mongodb');

const config = require('../config.json')

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
        if(isConnected()) rejects('Already connected to database 5001');

        const mb = new MongoClient(`mongodb+srv://${config.mongo.USERNAME}:${config.mongo.PASSWORD}@fcg-app.ckpca.mongodb.net/_devices?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});

        mb.connect((err, db) => {
            if(err) return rejects(err); 

            _db = db.db('_devices');

            _db.createCollection('admin', (err, res) => {});
            _db.createCollection('mobile', (err, res) => {});
            _db.createCollection('manipulizer', (err, res) => {});
            _db.createCollection('motd', (err, res) => {});

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
        if(!isConnected()) rejects('No connection is opened 5002')
    });
}

module.exports = {
    db: getDB,
    isConnected: isConnected,
    login: login,
    disconnect: disconnect
}