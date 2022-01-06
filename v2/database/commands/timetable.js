const { ObjectId } = require('mongodb');
const timetable = require('../schematics/Timetable');

module.exports = {
    /**
     * Creates an new database entry
     * @param {JSON} entry 
     * @returns Promise<any>
     */
    createEntry: async (entry) => {
        return new Promise(async (resolve, rejects) => {
            await timetable.insertOne(timetable.format(entry))
            .then((result) => resolve(result))
            .catch((error) => rejects(error));
        });
    },
    /**
     * Finds a spesific entry by matching query
     * @param {String} query 
     * @async
     * @returns Promise<JSON>
     */
    findEntry: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await timetable.findOne(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Finds all entrys matching the query
     * @param {String} query 
     * @async
     * @returns Promise<Array>
     */
    findBulkEntry: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await timetable.findMany(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Updates the state of an timetable object
     * @param {String} id 
     * @param {String} status 
     * @param {String} message 
     * @returns Promise<any>
     */
    updateTimeTableState: async (id, status, message) => {
        return new Promise(async (resolve, rejects) => {
            await timetable.updateOne({_id: ObjectId(id)}, {
                $set: {
                    status: status,
                    message: message
                }
            }).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Generates an subject identifier String
     * @param {int} classid 
     * @param {int} subjectid 
     * @returns String
     */
    generateSubjectIdentifier: (classid, subjectid, starthour, startminute) => {
        return `i-${classid}-${subjectid}-${starthour}-${startminute}`;
    },
}