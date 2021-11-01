const mogodb = require('mongodb')

const {db, isConnected} = require('../db/connector')

/**
 * Creates message document to db
 * @param {JSON} entry 
 * @async
 * @returns Promise<any>
 */
const addEntry = async (entry) => {
    return new Promise((resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        try {
            const model = formatEntry(entry);

            db().collection('motd').insertOne(model, (err, res) => {
                if(err) rejects(err);
                return resolve(res);
            })
        } catch (error) {
            rejects(error)
        }
    });
}

/**
 * Deletes message document from database
 * @param {String} id 
 * @returns Promise<Boolean>
 */
const deleteEntry = async (id) => {
    return new Promise((resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        console.log(mogodb.ObjectId(id));

        db().collection('motd').deleteOne({_id: mogodb.ObjectId(id)}, (err, object) => {
            if(err) return rejects(err);
            
            if(object.deletedCount > 0) resolve(true);
            else resolve(false);
        })
    });
}

/**
 * Find admin document by query
 * @param {String} query 
 * @async
 * @returns Promise<any>
 */
const findEntry = async (querry) => {
    return await db().collection('motd').findOne(querry)
}

/**
 * Find message document bulk by query
 * @param {String} query 
 * @async
 * @returns Promise<Array>
 */
const findBulkEntry = async (querry) => {
    return await db().collection('motd').find(querry).toArray();
}

/**
 * Reforms user object to db object
 * @param {JSON} object
 * @returns JSON
 */
const formatEntry = (object) => {
    return {
        creator: object.creator,
        type: object.type,
        push: object.push,
        message: object.message,
        classes: object.classes,
        iat: Date.now(),
        date: {
            day: object.date.day,
            month: object.date.month,
            year: object.date.year
        }
    }
}

module.exports = {
    addEntry: addEntry,
    deleteEntry: deleteEntry,
    findEntry: findEntry,
    findBulkEntry: findBulkEntry
}