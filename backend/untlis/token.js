const jwt = require('jsonwebtoken');

const config = require('../config.json')

/**
 * Generates a token for the user id
 * @param {String} id 
 * @param {Char} type 
 * @returns Token
 */
const generateToken = async (id, type) => {
    return await new Token(id).setType(type).generate();
}

/**
 * Valadides the incoming request
 * @param {JWT} token 
 * @returns Promise<any>
 */
const checkRequest = async (token) => {
    return new Promise((resolve, rejects) => {
        jwt.verify(token, config.keys.JWT, (err, decode) => {
            if(err || !decode) rejects();
            resolve(decode)
        })
    })
}

/**
 * Verifys that the refresh token is valid and the token is invalid
 * @param {Jwt} token 
 * @param {Jwt} reset 
 * @returns Promise<JSON>
 */
const verifyReset = async (token, reset) => {
    return new Promise((resolve, rejects) => {
        jwt.verify(token, config.keys.JWT, async (et, dt) => {
            jwt.verify(reset, config.keys.JWT, async (err, dr) => {
                if(et && dr) return resolve({
                    reset: await new Token(dr.data.id).setType('R').generate(),
                    token: await new Token(dr.data.id).setType('T').generate()
                });
                rejects(); //<-- Unauthorized
            })
        })
    })
}

class Token {
    /**
     * Constructor
     * @param {String} id 
     */
    constructor (id) {this.id = id;}

    /**
     * 
     * @param {String} type 
     * @returns Token
     */
    setType = (type) => {
        if(type === 'R') this.token = {type: 'R', iat: 60 * 60 * 24 * 180}; //exp after 180 days of inactivity
        else this.token = {type: 'T', iat: 10}; //exp after 24h of use

        return this;
    }

    /**
     * Generates a new JWT token with the user id provided from the constructor
     * @returns JWT
     */
    generate = async () => {
        return await jwt.sign({data: {type: this.token.type, id: this.id}}, config.keys.JWT, {expiresIn: this.token.iat});
    }
}

module.exports = {
    Token: Token,
    verifyReset: verifyReset,
    checkRequest: checkRequest,
    generateToken: generateToken
}