const mogodb = require('mongodb')

const {db, isConnected} = require('../db/connector')

/**
 * Creates manipulated document to db
 * @param {JSON} entry 
 * @async
 * @returns Promise<any>
 */
const addEntry = async (entry) => {
    return new Promise((resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        try {
            const model = formatEntry(entry);

            db().collection('manipulizer').insertOne(model, (err, res) => {
                if(err) rejects(err);
                return resolve(res);
            })
        } catch (error) {
            rejects(error)
        }
    });
}

/**
 * Updates manipulated document in database
 * @param {JSON} entry 
 * @returns Promise<Boolean>
 */
const updateEntry = async (entry) => {
    return new Promise((resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const model = formatEntry(entry);

        const result = db().collection('manipulizer').updateOne({rayid: model.rayid}, {
            $set: {
                status: {
                    message: model.status.message,
                    type: model.status.type
                }
            }
        })
        if(result.modifiedCount == 0) resolve(false); else resolve(true);
    });
}

/**
 * Finds document matching query
 * @param {JSON} query 
 * @async
 * @returns Promise<JSON>
 */
const findEntry = async (query) => {
    return await db().collection('manipulizer').findOne(query)
}

/**
 * Finds documents matching query
 * @param {JSON} query 
 * @async
 * @returns Promise<Array>
 */
const findBulkEntry = async (querry) => {
    return await db().collection('manipulizer').find(querry).toArray();
}

/**
 * Delets manipulated document from db
 * @param {String} entry 
 * @async
 * @returns Promise<any>
 */
const deleteEntry = async (entry) => {
    return new Promise((resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');
        
        db().collection('mobile').deleteOne({_id: mogodb.ObjectId(id)}, (err, object) => {
            if(err) return rejects(err);
            
            if(object.deletedCount > 0) resolve(true);
            else resolve(false);
        })
    });
}

/**
 * Reformat document format
 * @param {JSON} object 
 * @returns JSON
 */
const formatEntry = (object) => {

    return {
        rayid: object.rayid,
        creator: object.creator,
        class: object.class,
        course: object.course,
        iat: Date.now(),
        status: {
            message: object.status.message,
            type: object.status.type
        }
    }
}

module.exports = {
    addEntry: addEntry,
    deleteEntry: deleteEntry,
    findEntry: findEntry,
    findBulkEntry: findBulkEntry,
    updateEntry: updateEntry
}