const mogodb = require('mongodb')

const {db, isConnected} = require('../db/connector')
const crypto = require('../untlis/crypto')

/**
 * Created a admin user modle
 * @param {JSON} usermodel 
 * @async
 * @returns new Promise<any>
 */
const createUser = async (usermodel) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) rejects('No connection established');

        try {
            const model = await formUser(usermodel);

            db().collection('admin').insertOne(model, (err, res) => {
                if(err) rejects(err);
                return resolve(res)
            })
        } catch (error) {
            rejects(error);
        }
    });
}

/**
 * Find admin document by query
 * @param {String} query 
 * @async
 * @returns Promise<any>
 */
const findUser = async (query) => {
    return await db().collection('admin').findOne(query);
}

/**
 * Find admin document bulk by query
 * @param {String} query 
 * @async
 * @returns Promise<Array>
 */
const findBulkUser = async (query) => {
    return await db().collection('admin').find(query).toArray();
}

/**
 * Checks if user if exists
 * @param {String} id 
 * @deprecated
 * @returns Promise<Boolean>
 */
const userExists = async (id) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const device = await db().collection('admin').findOne({'_id': mogodb.ObjectId(id)});

        resolve((device != undefined));
    });
}

/**
 * Checks if user email exists
 * @param {String} email
 * @deprecated 
 * @async
 * @returns Promise<Boolean>
 */
const userExistsByEmail = async (email) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const device = await db().collection('admin').findOne({'email': email});

        resolve((device != undefined));
    });
}

/**
 * Update Scope Array in document by id
 * @param {String} id 
 * @param {Array} scopes 
 * @async
 * @returns Promise<Boolean>
 */
const updateScopes = async (id, scopes) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const result = await db().collection('admin').updateOne({_id: mogodb.ObjectId(id)}, {
            $set: {
                scopes: scopes
            }
        });
        if(result.modifiedCount == 0) resolve(false); else resolve(true);
    });
}

/**
 * Logs user action to db by id
 * @param {String} id 
 * @param {ExpressRequest} req
 * @async 
 * @returns Promise<Boolean>
 */
const logRequest = async (id, req) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const result = await db().collection('admin').updateOne({_id: mogodb.ObjectId(id)}, {
            $push: {
                access: {
                    path: req.path,
                    iat: Date.now(),
                    agent: req.header('user-agent'),
                    referrer: req.header('referrer'),
                    ip: req.header('x-forwarded-for') || req.connection.remoteAddress
                }
            }
        });
        if(result.modifiedCount == 0) resolve(false); else resolve(true);
    });
}

/**
 * Reforms user object to db object
 * @param {JSON} object
 * @async 
 * @returns JSON
 */
const formUser = async (object) => {
    return {
        name: object.name,
        email: object.email,
        scopes: object.scopes,
        password: await crypto.encript(object.password),
        iat: Date.now(),
        access: []
    }
}

/**
 * Creates default root document when app is started
 * @async
 * @returns Boolean
 */
const createDefaultRootUser = async () => {
    const root = require('../../default.json').default;

    if(!userExistsByEmail(root.email)) return;

    root.iat = Date.now();
    root.access = [];

    try {
        const result = await createUser(root);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
} 

module.exports = {
    findUser: findUser,
    findBulkUser: findBulkUser,
    logRequest: logRequest,
    updateScopes: updateScopes,
    createUser: createUser,
    createDefaultRootUser: createDefaultRootUser
}