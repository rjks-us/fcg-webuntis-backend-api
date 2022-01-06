const device = require('../schematics/User');
const admin = require('../schematics/Admin');

module.exports = {
    /**
     * Inserts a device into database
     * @param {JSON} usermodel 
     * @async
     * @returns Promise<any>s
     */
    createUserDevice: async (usermodel) => {
        return new Promise(async (resolve, rejects) => {

            console.log(device.format(usermodel));

            await device.insertOne(device.format(usermodel))
            .then((result) => resolve(result))
            .catch((error) => rejects(error));
        });
    },
    /**
     * Finds a spesific user by matching query
     * @param {String} query 
     * @async
     * @returns Promise<JSON>
     */
    findUser: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await device.findOne(query).then((result) => {
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
    findBulkUser: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await device.findMany(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Finds an element matching the provided query
     * @param {JSON} usermodel 
     * @async
     * @returns new Promise<Boolean>
     */
    userProfileExists: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await device.findOne(query).then((result) => {
                resolve(result != undefined);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Deletes an device completly from database, not recommended, instad use the disable function
     * @param {JSON} query 
     * @async
     * @returns Promise<any>
     */
    deleteDevice: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await device.deleteOne(query).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Updates the push Token matching query
     * @param {JSON} query 
     * @param {String} token
     * @async
     * @returns Promise<any>
     */
    updatePushToken: async (query, token) => {
        return new Promise(async (resolve, rejects) => {
            await device.updateOne(query, {
                $push: {
                    push: {
                        token: token,
                        iat: Date.now()
                    }
                }
            }).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Updates the classId matching query
     * @param {JSON} query 
     * @param {int} newcourses
     * @async
     * @returns Promise<any>
     */
    updateClass: async (query, newclass) => {
        return new Promise(async (resolve, rejects) => {
            await device.updateOne(query, {
                $set: {
                    class: newclass
                }
            }).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Updates the courses matching query
     * @param {JSON} query 
     * @param {Int16Array} newcourses
     * @async
     * @returns Promise<any>
     */
    updateCourses: async (query, newcourses) => {
        return new Promise(async (resolve, rejects) => {
            await device.updateOne(query, {
                $set: {
                    courses: newcourses
                }
            }).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Updates the name matching query
     * @param {JSON} query 
     * @param {String} name
     * @async
     * @returns Promise<any>
     */
    updateName: async (query, name) => {
        return new Promise(async (resolve, rejects) => {
            await device.updateOne(query, {
                $set: {
                    name: name
                }
            }).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Disables the device matching query
     * @param {JSON} query 
     * @async
     * @returns Promise<any>
     */
    disableDevice: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await device.updateOne(query, {
                $set: {
                    disabled: disabled
                }
            }).then((result) => {
                resolve(result);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Returns the most recent Firebase notification key from Device Object
     * @param {JSON} query
     * @async
     * @returns Promise<any>
     */
    getMostRecentFirebasePushNotificationKey: async (query) => {
        return new Promise(async (resolve, rejects) => {
            await device.findOne(query).then((result) => {
                if(!result || result.push === undefined || result.push.length == 0) rejects('No Push Token found');

                resolve(result.push[result.push.length - 1]);
            })
            .catch((error) => rejects(error));
        });
    },
    /**
     * Returns a list of all devices which have subscribed to the provided classes
     * @param {Array} subjects 
     * @async
     * @returns Promise<any>
     */
    getDevicesWhichHaveSubscribedToProvidedSubjects: async (subjects) => {
        return new Promise(async (resolve, rejects) => {
            await device.findMany({courses: {$in: subjects}, disabled: false}).then((result) => {
                resolve(result);
            })
            .catch((error) => rejects(error));
        });
    },
    /**
     * Logs device action to db by query
     * @param {String} id 
     * @param {ExpressRequest} req
     * @async 
     * @returns Promise<Boolean>
     */
    logRequest: async (query, req) => {
        return new Promise(async (resolve, rejects) => {
            await admin.updateOne(query, {
                $push: {
                    access: {
                        path: req.path,
                        iat: Date.now(),
                        agent: req.header('user-agent'),
                        referrer: req.header('referrer'),
                        ip: req.header('x-forwarded-for') || req.connection.remoteAddress
                    }
                }
            })
            .then((result) => resolve(result))
            .catch((error) => rejects(error));
        });
    },
}