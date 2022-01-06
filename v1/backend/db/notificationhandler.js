const mogodb = require('mongodb');

const {db, isConnected} = require('../db/connector');

/**
 * Logs the request to the database
 * @param {String} id 
 * @param {any} req 
 * @returns Promise<Boolean>
 */
 const logRequest = async (id, req) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const result = await db().collection('mobile').updateOne({_id: mogodb.ObjectId(id)}, {
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