const mongoDB = require('mongodb');

const admin = require('../schematics/Admin');
const { findOne } = require('../schematics/Notification');

module.exports = {
    /**
     * Creates a Admin User Model in database
     * @param {JSON} usermodel 
     * @async
     * @returns new Promise<any>
     */
    createUserProfile: async (usermodel) => {
        return new Promise(async (resolve, rejects) => {
            admin.insertOne(await admin.format(usermodel, true))
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
            await admin.findOne(query).then((result) => {
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
            await admin.findMany(query).then((result) => {
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
            await admin.findOne(query).then((result) => {
                resolve(result != undefined);
            }).catch((error) => rejects(error));
        });
    },
    /**
     * Update Scope Array in document by id
     * @param {String} id 
     * @param {Array} scopes 
     * @async
     * @returns Promise<Boolean>
     */
    updateScopes: async (query, scopes) => {
        return new Promise(async (resolve, rejects) => {
            await admin.updateOne(query, {
                $set: {
                    scopes: scopes
                }
            })
            .then((result) => resolve(result))
            .catch((error) => rejects(error));
        });
    },
    /**
     * Logs user action to db by query
     * @param {String} id 
     * @param {ExpressRequest} req
     * @async 
     * @returns Promise<Boolean>
     */
    logRequest: async (id, req) => {
        return new Promise(async (resolve, rejects) => {
            await admin.updateOne({_id: mongoDB.ObjectId(id)}, {
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
    /**
     * Creates the default root user which is provided in the static/defaultuser.json config
     * @async
     * @returns Boolean
     */
    createDefaultRootUser: async () => {
        const root = require('../../static/defaultuser.json').default;
    
        if(!findOne({email: root.email})) return;
    
        root.iat = Date.now();
        root.access = [];
    
        try {
            await admin.insertOne(await admin.format(root, true));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}