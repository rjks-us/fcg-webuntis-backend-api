const manipulizer = require('../schematics/Manipulizer');
const device = require('../schematics/User');

module.exports = {
    /**
     * Creates manipulated document to db
     * @param {JSON} entry 
     * @async
     * @returns Promise<any>
     */
    addEntry: async (entry) => {
        return new Promise(async (resolve, rejects) => {
            manipulizer.insertOne(await manipulizer.format(entry))
            .then((result) => resolve(result))
            .catch((error) => rejects(error));
        });
    },
    /**
     * Updates manipulated document in database
     * @param {JSON} entry 
     * @returns Promise<Boolean>
     */
    updateEntry: async (query, type, message) => {
        return new Promise(async (resolve, rejects) => {
            await manipulizer.updateOne(query, {
                $set: {
                    status: {
                        message: message,
                        type: type
                    }
                }
            }).then((result) => resolve(result)).catch((error) => rejects(error));
        });
    },
    /**
     * Finds a spesific user by matching query
     * @param {String} query 
     * @async
     * @returns Promise<JSON>
     */
    findEntry: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await manipulizer.findOne(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Finds all users matching the query
     * @param {String} query 
     * @async
     * @returns Promise<Array>
     */
    findBulkEntrys: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await manipulizer.findMany(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Delets manipulated document from database
     * @param {String} entry 
     * @async
     * @returns Promise<any>
     */
    deleteEntry: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await manipulizer.deleteOne(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    }
}