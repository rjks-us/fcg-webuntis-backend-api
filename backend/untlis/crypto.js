const bcrypt = require('bcrypt');

/**
 * Use this to hash a password
 * @param {String} input 
 * @returns Promise<String>
 */
const encript = (input) => {
    return new Promise((resolve, rejects) => {
        bcrypt.hash(input, 10, (err, hash) => {
            if(err) return rejects(err);
            return resolve(hash);
        });
    });
}

/**
 * Use this method to check if the hash is equals the plain password
 * @param {String} plain 
 * @param {String} hash 
 * @returns Promise<Boolean>
 */
const check = (plain, hash) => {
    return new Promise((resolve, rejects) => {
        bcrypt.compare(plain, hash, (err, result) => {
            if(err) return rejects(err);
            return resolve(result);
        })
    });
}

module.exports = {
    encript: encript,
    check: check
}