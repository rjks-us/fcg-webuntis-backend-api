const CLASS = {id: 0, name: 'CLASS', message: ''}, CANCELED = {id: 1, name: 'CANCELED', message: 'eigenverantwortliches Arbeiten'}, IRREGULAR = {id: 2, name: 'CANCELED', message: ''};

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

const isTarget = (rayid) => {

    if(rayid == 271643 || rayid == 271648) { //TODO: ADD DB SUPPORT
        return true;
    }

    return false;
}

module.exports = {
    CLASS,
    CANCELED,
    IRREGULAR,
    manipulize: manipulize,
    isTarget: isTarget
}