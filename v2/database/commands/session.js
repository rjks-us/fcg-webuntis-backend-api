const jwt = require('jsonwebtoken');

const session = require('../schematics/Session');
const crypto = require('../../utils/Crypto');
const config = require('../../static/config.json');

/**
 * Note: migrated from v1 to v2 --> token system to session system
 */

module.exports = {
    /**
     * Creates a new session for an admin user
     * @param {String} id 
     * @param {JSON} body 
     * @returns Promise<any>
     */
    createSession: async (id, body) => {
        return new Promise(async (resolve, rejects) => {
            const token = await jwt.sign({data: {id: id, body: body}}, config.keys.JWT, {expiresIn: '180d'});

            session.insertOne(await session.format({
                token: token.toString(),
                exp: Date.now() + 1000 * 60 * 60 * 24 * 180,
                userid: id,
                valid: true,
                data: body
            }, false))
            .then((result) => resolve(token))
            .catch((error) => rejects(error));
        });
    },
    /**
     * Verifies a session
     * @param {String} sessionToken
     * @returns Promise<Boolean>
     */
    verifySession: async (sessionToken) => {
        return new Promise(async (resolve, rejects) => {
            
            jwt.verify(sessionToken, config.keys.JWT, (error, decode) => {
                if(error) return resolve(false);
                
                if(decode === undefined) return resolve(false);

                const providedId = (decode.data === undefined) ? decode.id : decode.data.id;

                console.log(providedId);

                session.findOne({userid: providedId, valid: true, session: sessionToken})
                .then((result) => {
                    if(!result) return resolve(false);

                    if(result.valid != undefined && result.valid == false) return resolve(false);

                    if(Date.now() >= result.exp) return resolve(false);

                    return resolve(true);
                })
                .catch((error) => rejects(error));
            });
        });
    },
    /**
     * Returns the body of an session tokens, also when the token has expired
     * @param {String} sessionToken 
     * @returns Promise<JSON>
     */
    getBodyOfSession: (sessionToken) => {
        return new Promise(async (resolve, rejects) => {
        
            session.findOne({session: sessionToken})
            .then((result) => resolve(result))
            .catch((error) => rejects(error));
        });
    },
    /**
     * Ends a valid session
     * @param {String} sessionToken
     * @returns Promise<Boolean>
     */
    endSession: async (sessionToken) => {
        return new Promise(async (resolve, rejects) => {
            
            session.updateOne({token: await crypto.encript(sessionToken)}, {
                $set: {
                    valid: false
                }
            })
            .then((result) => resolve(result))
            .catch((error) => rejects(error));
        });
    }
}