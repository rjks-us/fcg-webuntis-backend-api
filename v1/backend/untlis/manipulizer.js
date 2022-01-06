const CLASS = {id: 0, name: 'CLASS', message: ''}, CANCELED = {id: 1, name: 'CANCELED', message: 'eigenverantwortliches Arbeiten'}, IRREGULAR = {id: 2, name: 'INFO', message: ''};

const manipulizer = require('../db/manipu')

/**
 * Manipulize a Timetable Object
 * @param {JSON} element 
 * @param {JSON} type 
 * @param {String} message 
 * @returns JSON
 */
const manipulize = (element, type, message) => {
    var msg = message || type.message;

    element.status.type = type.name;
    element.status.message = msg;

    return element;
}

/**
 * Checks if timetable object is manipulated
 * @param {Number} rayid
 * @deprecated 
 * @returns Boolean
 */
const isTarget = async (rayid) => {
    const element = await manipulizer.findEntry({rayid: rayid});

    return (element != null);
}

module.exports = {
    CLASS,
    CANCELED,
    IRREGULAR,
    manipulize: manipulize,
    isTarget: isTarget
}