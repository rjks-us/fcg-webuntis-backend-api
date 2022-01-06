const notification = require('../schematics/Notification');
const config = require('../../static/config.json');

module.exports = {
    /**
     * Creates a new notification object to database
     * @param {JSON} entry 
     * @returns Promise<any>
     */
    createNotification: async (entry) => {
        return new Promise(async (resolve, rejects) => {
            notification.insertOne(await notification.format(entry))
            .then((result) => resolve(result))
            .catch((error) => rejects(error));
        });
    },
    /**
     * Finds a spesific notification by matching query
     * @param {String} query 
     * @async
     * @returns Promise<JSON>
     */
    findNotification: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await notification.findOne(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Finds spesific notifications by matching query
     * @param {String} query 
     * @async
     * @returns Promise<Array>
     */
    findBulkNotification: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await notification.findMany(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Checks if an notification object exists by query
     * @param {JSON} usermodel 
     * @async
     * @returns new Promise<Boolean>
     */
    notificationExists: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await notification.findOne(query).then((result) => {
                resolve(result != undefined);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Deletes an notification entry by query
     * @param {JSON} query 
     * @async
     * @returns Promise<any>
     */
    deleteDevice: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await notification.deleteOne(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
}