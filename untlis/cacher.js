const config = require('../config.json')
const {classList, getTimeTable} = require('../untis')

var oldCache = [], newCache = [];

const update = async () => {
    await cache();

    setInterval(async () => {
        await cache();
    }, 20 * 1000); //<----- 30s
}

const cache = async () => {

    console.log('[INFO] Started caching canceled elements of all classes');

    const start = Date.now(), classes = await classList();

    for (let i = 0; i < classes.length; i++) {
        const c = classes[i], timetable = await getTimeTable(c.id);

        for (let a = 0; a < timetable.length; a++) {
            if(timetable[a].status.type === "CANCELED") {
                newCache.push(timetable[a]);
            }
        }
    }

    var newentrys = [], tmpn = [], tmpo = [];

    //Creating a temporary list with class entrys as Strings instantof JSON
    for (let i = 0; i < newCache.length; i++) {
        tmpn.push(newCache[i] + '');
    }

    //Creating a temporary list with class entrys as Strings instantof JSON
    for (let i = 0; i < oldCache.length; i++) {
        tmpo.push(oldCache[i] + '');
    }

    //Compare the temporary array lists
    for (let i = 0; i < tmpn.length; i++) {
        if(!tmpo.includes(tmpn[i])) newentrys.push(tmpn[i]);
    }

    console.log('[INFO] Found ' + newentrys.length + ' new cancelations in ' + (Date.now() - start) +'ms');

    //Check
    oldCache = newCache;
    newCache = [];
}

const inform = (object) => {
    console.log('[INFO] ' + object.class.name + ' has a new entry on subject: ' + object.subject.name);
    //TODO search db for matching db and verify nnotifications
}

module.exports = {
    update: update
}