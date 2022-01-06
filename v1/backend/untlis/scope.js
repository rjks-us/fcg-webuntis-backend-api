const SCOPES = require('../../scopes.json').scopes;

/**
 * 
 * @param {Array} targetscope 
 * @param {Array} userscopes 
 * @returns Boolean
 */
 const canModify = (targetscope, userscopes) => {
    for (let i = 0; i < userscopes.length; i++) {
        if(!findScope(targetscope[i])) return false;
        if(findScope(targetscope[i]).inherit.includes(userscopes[i])) {
            return true;
        }
    }
    return false;
}

/**
 * 
 * @param {Int} id || {String} name
 * @returns JSON
 */
const findScope = (id) => {
    for(let i = 0; i < SCOPES.length; i++) {
        if(SCOPES[i].id == id || SCOPES[i].name == id) {
            return SCOPES[i];
        }
    }
    return 0;
}

/**
 * Checks if a user has a scope
 * @param {Array} scopes 
 * @param {ID} find 
 * @returns Boolean
 */
const hasScope = (scopes, find) => {
    for (let i = 0; i < scopes.length; i++) {
        const s = scopes[i];
        if(s === find) return true;
        if(findScope(s).inherit.includes(find)) return true
    }
    return false;
}

/**
 * Checks if a user has a scope
 * @param {Array} scopes 
 * @param {ID} find 
 * @deprecated
 * @returns Boolean
 */
 const hasScopePrototype = (scopes, find) => {
    return scopes.includes(find);
}

/**
 * Checks if a user has a scope
 * @param {Array} scopes 
 * @param {Scope} scope 
 * @returns Boolean
 */
const hasPermission = (scopes, scope) => {
    for (let i = 0; i < scopes.length; i++) {
        if(scopes[i].id == scope) return true;
    }
    return false;
}

module.exports = {
    canModify: canModify,
    hasScope: hasScope,
    hasScopePrototype: hasScopePrototype,
    findScope: findScope,
    hasPermission: hasPermission
}