const bcrypt = require('bcrypt');

module.exports = {
    /**
     * Use this to hash a password
     * @param {String} input 
     * @returns Promise<String>
     */
    encript: (input) => {
        return new Promise((resolve, rejects) => {
            bcrypt.hash(input, 10, (err, hash) => {
                if(err) return rejects(err);
                return resolve(hash);
            });
        });
    },
    /**
     * Use this method to check if the hash is equals the plain password
     * @param {String} plain 
     * @param {String} hash 
     * @returns Promise<Boolean>
     */
    check: (plain, hash) => {
        return new Promise((resolve, rejects) => {
            bcrypt.compare(plain, hash, (err, result) => {
                if(err) return rejects(err);
                return resolve(result);
            })
        });
    }
}