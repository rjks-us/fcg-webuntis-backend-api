const jwt = require('jsonwebtoken');

const config = require('../config.json');
const Scopes = require('./scopes');

/**
 * 
 * @param {JWTTOKEN} key 
 * @param {Array} scopes 
 * @param {JSON} options 
 * @returns JWT Token
 */
const createKey = (key, scopes, options) => {
    return new Promise(async (resolve, rejects) => {
        if(await !hasPermission(key, Scopes.ADMINISTRATION) || await !hasPermission(key, Scopes.MANAGEKEY)) rejects('You are lacking permission ADMINISTRATION or MANAGEKEY');

        if(options.owner === undefined) rejects('You must provide a owner of the key');
        if(options.expire === undefined) options.expire = 60 * 60 * 24 * 30;

        const token = await jwt.sign({owner: options.owner, scopes: scopes}, config.keys.JWT, {expiresIn: options.expire});

        resolve(token);
    })
}

/**
 * 
 * @param {JWT} key 
 * @param {SCOPE} scope 
 * @returns 
 */
const hasPermission = async (key, scope) => {
    return new Promise(async (resolve, rejects) => {
        jwt.verify(key, config.keys.jwt, (err, decode) => {
            if(err || decode === undefined) resolve(false);
            resolve(decode.scopes.find(elm => elm.id == scope.id) != undefined);
        });
    })
}

module.exports = {
    createKey: createKey,
    hasPermission: hasPermission
}