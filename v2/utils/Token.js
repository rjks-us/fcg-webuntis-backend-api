const jwt = require('jsonwebtoken');

const config = require('../static/config.json')

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
    console.log(token);
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
        jwt.verify(token, config.keys.JWT, async (errorToken, decodeToken) => {

            if(!errorToken) return rejects('The token is invalid');
            if(decodeToken) return rejects('The token is still valid, a refresh is not nessesary');

            jwt.verify(reset, config.keys.JWT, async (errorRefreshToken, decodeRefreshToken) => {
                
                if(errorRefreshToken) rejects('Refresh token is invalid');

                if(errorToken && decodeRefreshToken) return resolve({
                    reset: await new Token(decodeRefreshToken.data.id).setType('R').generate(),
                    token: await new Token(decodeRefreshToken.data.id).setType('T').generate()
                });
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
        if(type === 'R') this.token = {type: 'R', iat: '180d'}; //exp after 180 days of inactivity
        else this.token = {type: 'T', iat: '1d'}; //exp after 24h of use

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

/**
 * Generates admin jwt token
 * @param {String} id 
 * @async
 * @deprecated
 * @returns JWT Token
 */
const generateAdminToken = async (id) => {
    return await jwt.sign({
        id: id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1)
    }, config.keys.JWT);
}

module.exports = {
    Token: Token,
    verifyReset: verifyReset,
    checkRequest: checkRequest,
    generateToken: generateToken,
    generateAdminToken: generateAdminToken
}