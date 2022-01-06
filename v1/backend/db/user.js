const mogodb = require('mongodb')

const {db, isConnected} = require('../db/connector')

/**
 * Inserts a device into database
 * @param {JSON} usermodel 
 * @async
 * @returns Promise<any>
 */
const createDevice = async (usermodel) => {
    return new Promise((resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        try {
            const model = formUser(usermodel);

            console.log(usermodel);

            db().collection('devices').insertOne(model, (err, res) => {
                if(err) rejects(err);

                console.log(res);

                return resolve(res)
            })
        } catch (error) {
            rejects(error);
        }
    });
}

/**
 * Checks if the user id exists
 * @param {String} id 
 * @async
 * @returns Promise<Boolean>
 */
const deviceExists = async (id) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const device = await db().collection('devices').findOne({'_id': mogodb.ObjectId(id)});

        resolve((device != undefined));
    });
}

/**
 * Gets the usermodle form database
 * @param {String} id 
 * @async
 * @returns Promise<JSON>
 */
const getProfile = async (id) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const user = await db().collection('devices').findOne({'_id': mogodb.ObjectId(id)});
        if(!user) rejects('User does not exists');

        const tmp = {
            name: user.name,
            courses: user.courses,
            class: user.class,
            iat: user.iat,
            notification: user.notification
        }
        resolve(tmp);
    })
}

/**
 * Delete device by name
 * @param {String} id 
 * @async
 * @returns Promise<Boolean>
 */
const deleteDevice = async (id) => {
    return new Promise((resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');
        
        db().collection('devices').deleteOne({_id: mogodb.ObjectId(id)}, (err, object) => {
            if(err) return rejects(err);
            
            if(object.deletedCount > 0) resolve(true);
            else resolve(false);
        })
    });
}

/**
 * Updates the push notification token
 * @param {String} id 
 * @param {String} token
 * @async
 * @returns Promise<Boolean>
 */
const updatePushToken = async (id, token) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const result = await db().collection('devices').updateOne({_id: mogodb.ObjectId(id)}, {
            $push: {
                notification: {
                    token: token,
                    iat: Date.now()
                }
            }
        });
        if(result.modifiedCount == 0) resolve(false); else resolve(true);
    });
}

/**
 * Updates the class entry of a user
 * @param {String} id 
 * @param {Number} newclass
 * @async
 * @returns Promise<Boolean>
 */
const updateClass = async (id, newclass) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');
        
        const result = await db().collection('devices').updateOne({_id: mogodb.ObjectId(id)}, {
            $set: {
                class: newclass
            }
        });
        if(result.modifiedCount == 0) resolve(false); else resolve(true);
    });
}

/**
 * Updates the cours array entry of a user
 * @param {String} id 
 * @param {Array} newcourse
 * @async
 * @returns Promise<Boolean>
 */
const updateCourse = async (id, newcourse) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const result = await db().collection('devices').updateOne({_id: mogodb.ObjectId(id)}, {
            $set: {
                courses: newcourse
            }
        });
        if(result.modifiedCount == 0) resolve(false); else resolve(true);
    });
}

/**
 * Updates the name entry of a user
 * @param {String} id 
 * @param {String} name 
 * @returns Promise<Boolean>
 */
const updateName = async (id, name) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');
        
        const result = await db().collection('devices').updateOne({_id: mogodb.ObjectId(id)}, {
            $set: {
                name: name
            }
        });
        if(result.modifiedCount == 0) resolve(false); else resolve(true);
    });
}

const disable = async (id, state) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');
        
        const result = await db().collection('devices').updateOne({_id: mogodb.ObjectId(id)}, {
            $set: {
                disabled: state
            }
        });
        if(result.modifiedCount == 0) resolve(false); else resolve(true);
    });
}

/**
 * Logs the request to the database
 * @param {String} id 
 * @param {any} req 
 * @returns Promise<Boolean>
 */
const logRequest = async (id, req) => {
    return new Promise(async (resolve, rejects) => {
        if(!isConnected()) return rejects('No connection established');

        const result = await db().collection('devices').updateOne({_id: mogodb.ObjectId(id)}, {
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
 * Retuns device object matching query
 * @param {JSON} querry 
 * @returns JSON
 */
const findUser = async (querry) => {
    return await db().collection('devices').findOne(querry)
}

const findBulkUser = async (querry) => {
    return await db().collection('devices').find(querry).toArray();
}

/**
 * Reforms the user modle to database format
 * @param {JSON} model 
 * @returns JSON
 */
const formUser = (model) => {
    const user = {
        name: model.name,
        platform: model.platform,
        device: model.device,
        courses: model.courses,
        class: model.class,
        push: [],
        notification: [],
        iat: Date.now(),
        disabled: false,
        access: []
    }
    if(model.push) user.push.push({token: model.push, iat: Date.now()});
    
    return user;
}

module.exports = {
    createDevice: createDevice,
    deleteDevice: deleteDevice,
    updateClass: updateClass,
    updatePushToken: updatePushToken,
    updateCourse: updateCourse,
    updateName: updateName,
    logRequest: logRequest,
    getProfile: getProfile,
    deviceExists: deviceExists,
    findUser: findUser,
    findBulkUser: findBulkUser,
    disable: disable
}