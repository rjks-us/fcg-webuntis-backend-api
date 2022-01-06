const crypto = require('../../utils/Crypto');
const db = require('../manager');

const name = 'notifications'; ///This provides the database manager the name of the target collection in the database
var instance;

module.exports = {
    dbname: name,
    setInstance: (database) => instance = database,
    /**
     * Find one element by provided query
     * @example var result = await findOne({name: 'Tom Werner'});
     * @example console.log(result);
     * @async
     * @param {JSON} query 
     * @returns Promise<any>
     */
     findOne: async (query) => {
        return new Promise(async (resolve, rejects) => {
            if(!db.isConnected()) return rejects('No connection established');
    
            const result = await instance.collection(name).findOne(query);
    
            resolve(result);
        });
    },
    /**
     * Find many elements by provided query
     * @example var result = await findOne({age: 10});
     * @example result.forEach((element) => console.log(element));
     * @async
     * @param {JSON} query 
     * @returns Promise<any>
     */
    findMany: async (query) => {
        return new Promise(async (resolve, rejects) => {
            if(!db.isConnected()) return rejects('No connection established');
    
            const result = await instance.collection(name).find(query).toArray();
    
            resolve(result);
        });
    },
    /**
     * Insertes one element to database
     * @example insertOne({name: 'Timo Werner', age: 61}).then((result) => console.log(result)).catch((error) => console.error(error));
     * @async
     * @param {JSON} object 
     * @returns Promise<any>
     */
    insertOne: async (object) => {
        return new Promise(async (resolve, rejects) => {
            try {
                if(!db.isConnected()) return rejects('No connection established');
    
                await instance.collection(name).insertOne(object, (error, result) => {
                    if(error) rejects(error);
                    return resolve(result)
                })
            } catch (error) {
                rejects(error);
            }
        });
    },
    /**
     * Insertes multiple elements to database
     * @example insertMany([{name: 'Timo Werner', age: 61}, {name: 'Paul Mueller', age: 61}]).then((result) => console.log(result)).catch((error) => console.error(error));
     * @async
     * @param {Array} object 
     * @returns Promise<any>
     */
    insertMany: async (object) => {
        return new Promise(async (resolve, rejects) => {
            try {
                if(!db.isConnected()) return rejects('No connection established');
    
                await instance.collection(name).insert(object, (error, result) => {
                    if(error) rejects(error);
                    return resolve(result)
                })
            } catch (error) {
                rejects(error);
            }
        });
    },
    /**
     * Updates one element by provided query
     * @example await updateOne({name: 'Timo Werner'}, {$set: name: 'Timo Werner Jr.'}).then((result) => console.log(result)).catch((error) => console.error(error));
     * @async
     * @param {JSON} query 
     * @param {JSON} action 
     * @returns Promise<any>
     */
    updateOne: async (query, action) => {
        return new Promise(async (resolve, rejects) => {
            if(!db.isConnected()) return rejects('No connection established');
    
            const result = await instance.collection(name).updateOne(query, action);

            if(result.modifiedCount == 0) resolve(false); else resolve(true);
        });
    },
    /**
     * Updates many elements by provided query
     * @example await updateOne({name: 'Timo Werner'}, {$set: lastLogin: Date.now()}).then((result) => console.log(result)).catch((error) => console.error(error));
     * @async
     * @param {JSON} query 
     * @param {JSON} action 
     * @returns Promise<any>
     */
    updateMany: async (query, action) => {
        return new Promise(async (resolve, rejects) => {
            if(!db.isConnected()) return rejects('No connection established');
    
            const result = await instance.collection(name).update(query, action);

            if(result.modifiedCount == 0) resolve(false); else resolve(true);
        });
    },
    /**
     * Deletes one element by provided query
     * @example await deleteOne({name: 'Timo Werner'}).then((result) => console.log(result)).catch((error) => console.error(error));
     * @async
     * @param {JSON} query 
     * @param {JSON} action 
     * @returns Promise<any>
     */
    deleteOne: async (query) => {
        return new Promise(async (resolve, rejects) => {
            if(!db.isConnected()) return rejects('No connection established');
    
            const result = await instance.collection(name).deleteOne(query);

            if(result.modifiedCount == 0) resolve(false); else resolve(true);
        });
    },
    /**
     * Reforms user object to db object
     * @param {JSON} object
     * @async 
     * @returns JSON
     */
    format: (object) => {
        return {
            iat: Date.now(),
            title: object.title,
            message: object.message,
            successfully: object.success,
            identifier: object.identifier,
            actionid: object.actionid,
            sender: object.sender
        };
    }
}