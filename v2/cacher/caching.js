const config = require('../static/config.json');
const {classList, getTimeTable} = require('../webuntis/untis');

const timetable = require('../database/commands/timetable');
const device = require('../database/commands/device');
const { Notification, actions } = require('../notification/notificationhandler');
const notificationManager = require('../database/commands/notification');
const { ObjectId } = require('mongodb');
const untis = require('../webuntis/untis');

var days = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];

const update = async () => {
    //var date = new Date('December 20, 2021');
    var date = new Date();

    await cache(date);

    setInterval(async () => {
        date = new Date();
        await cache(date);
    }, config.refreshrate * 1000);
}

const cache = async (date) => {

    var changesCollection = [];

    console.log('[INFO] Started caching canceled elements of all classes')

    const prefix = days[date.getDay()];

    const start = Date.now(), classes = await classList();

    for (let i = 0; i < classes.length; i++) {
        const c = classes[i], table = await getTimeTable(c.id, date);

        for (let a = 0; a < table.length; a++) {
            if(table[a].status.type === "CANCELED" || table[a].status.type === "INFO") {
                table[a].identifier = timetable.generateSubjectIdentifier(table[a].class.id, table[a].subject.id, table[a].start.hour, table[a].start.minute);
                changesCollection.push(table[a]);
                //console.log(table[a]);
            }
        }
    }
    
    const filteredCollection = [], tmpEntrys = [];

    for(let i = 0; i < changesCollection.length; i++) {
        for(let a = 0; a < changesCollection.length; a++) {
            if(changesCollection[i].identifier === changesCollection[a].identifier) {
                const indentifier = changesCollection[i].identifier;

                if(!tmpEntrys.includes(`${indentifier}-${changesCollection[i].status.type}`)) {
                    if(filteredCollection[indentifier] === undefined) {
                        filteredCollection[indentifier] = [];
                    }
    
                    filteredCollection[indentifier].push(changesCollection[i]);
                    tmpEntrys.push(`${indentifier}-${changesCollection[i].status.type}`);
                }
            }
        }
    }

    const finalSubjectCollection = [];

    for(var key in filteredCollection) {
        if(filteredCollection[key].length == 1) {
            //just one info object
            var starting = filteredCollection[key][0];

            finalSubjectCollection.push(starting)

        } else if(filteredCollection[key].length == 2) {
            //Canceled subject with info object
            var starting = (filteredCollection[key][0].status.type === 'CANCELED') ? filteredCollection[key][0] : filteredCollection[key][1];
            var infoObject = filteredCollection[key][1];

            starting.room = infoObject.room;
            starting.status.message = infoObject.status.message;

            finalSubjectCollection.push(starting)
        }
    }

    var newElementsFoundForChanges = 0, userNotificationCache = [];

    for (let i = 0; i < finalSubjectCollection.length; i++) {
        const finalObject = finalSubjectCollection[i];

        const result = await timetable.findBulkEntry({identifier: finalSubjectCollection[i].identifier, date: {day: finalObject.date.day, month: finalObject.date.month, year: finalObject.date.year}})
        if(result.length === 0) {

            const createdEntry = await timetable.createEntry({
                date: {
                    day: finalObject.date.day,
                    month: finalObject.date.month,
                    year: finalObject.date.year,
                },
                identifier: finalObject.identifier,
                status: finalObject.status.type,
                message: finalObject.status.message,
                classid: finalObject.class.id,
                rayid: finalObject.rayid,
                subject: {
                    id: finalObject.subject.id,
                    short: finalObject.subject.short,
                    name: finalObject.subject.name,
                },
                teacher: {
                    id: finalObject.teacher.id,
                    fullname: finalObject.teacher.firstname + ' ' + finalObject.teacher.lastname,
                },
                room: {
                    id: finalObject.room.id,
                    short: finalObject.room.short,
                    name: finalObject.room.name,
                }
            })

            newElementsFoundForChanges++;

            //TODO: find all targeted devices who have subscribed to the certain

           const devices = await device.getDevicesWhichHaveSubscribedToProvidedSubjects([finalObject.subject.id]);

           for (let a = 0; a < devices.length; a++) {

                if(userNotificationCache[devices[a]._id] === undefined) {
                    userNotificationCache[devices[a]._id] = {
                        collection: [finalObject],
                        canceled: [],
                        info: [],
                    }
                } else {
                    userNotificationCache[devices[a]._id].collection.push(finalObject);
                }
           }
        }
    }
    for(var key in userNotificationCache) {
        const array = userNotificationCache[key].collection;

        array.forEach(element => {
            if(element.status.type === 'CANCELED') {
                userNotificationCache[key].canceled.push(element);
            }

            if(element.status.type === 'INFO') {
                userNotificationCache[key].info.push(element);
            }

        })
    }

    for(var key in userNotificationCache) {

        const pushNotificationKey = await device.getMostRecentFirebasePushNotificationKey(ObjectId(key)), canceled = userNotificationCache[key].canceled;

        ///CANCLED OBJECTS

        var title = '', body = '';
        if(canceled.length == 1) {
            var finalObject = canceled[0];

            title = 'Entfall';
            body = '(' + prefix + ') Gute Nachrichten, ' + finalObject.subject.name + ' bei' + finalObject.teacher.firstname + ' ' + finalObject.teacher.lastname + ' entfällt';

        } else if(canceled.length == 2) {
            var finalObject = canceled[0], secondaryObject = canceled[1];

            title = 'Entfall';
            body = '(' + prefix + ') Gute Nachrichten, ' + finalObject.subject.name + ' und  ' + secondaryObject.subject.name +  ' entfallen';

        } else if(canceled.length == 2) {
            var finalObject = canceled[0], secondaryObject = canceled[1];

            title = 'Entfall';
            body = '(' + prefix + ') Gute Nachrichten, ' + finalObject.subject.name + ', ' + secondaryObject.subject.name +  ' und ein weiterer Kurs entfallen';

        } else if(canceled.length >= 3)  {
            var finalObject = canceled[0], secondaryObject = canceled[1];

            title = 'Entfall';
            body = '(' + prefix + ') Gute Neuigkeiten, ' + finalObject.subject.name + ', ' + secondaryObject.subject.name +  ' und ' + (canceled.length - 2) + ' weitere Kurse entfallen';

        }

        if(title !== '' || body !== '') {
            var notification = new Notification(title, body);

            if(pushNotificationKey != undefined) notification.sendSingle(pushNotificationKey.token, ObjectId(key), actions.CLASS_CHANGED_TO_CANCELED);
        }

        ///INFO OBJECTS

        const info = userNotificationCache[key].info;

        title = '', 
        body = '';

        if(info.length == 1) {
            var finalObject = info[0];

            console.log(finalObject);

            title = 'Information';
            body = '(' + prefix + '): Es gibt neue Informationen zu dem Kurs ' + finalObject.subject.name + ' bei' + finalObject.teacher.firstname + ' ' + finalObject.teacher.lastname + '';

        } else if(info.length == 2) {
            var finalObject = info[0], secondaryObject = info[1];

            title = 'Informationen';
            body = '(' + prefix + '): Es gibt neue Informationen zu den Kursen ' + finalObject.subject.name + ' und  ' + secondaryObject.subject.name +  '';

        } else if(info.length == 2) {
            var finalObject = info[0], secondaryObject = info[1];

            title = 'Informationen';
            body = '(' + prefix + '): Es gibt neue Informationen zu den Kursen ' + finalObject.subject.name + ', ' + secondaryObject.subject.name +  ' und einem weiteren Kurs';

        } else if(info.length >= 3) {
            var finalObject = info[0], secondaryObject = info[1];

            title = 'Informationen';
            body = '(' + prefix + '): Es gibt neue Informationen zu den Kursen ' + finalObject.subject.name + ', ' + secondaryObject.subject.name +  ' und ' + (info.length - 2) + ' weiteren Kursen';

        }

        if(title !== '' || body !== '') {
            notification = new Notification(title, body);

            if(pushNotificationKey != undefined) notification.sendSingle(pushNotificationKey.token, ObjectId(key), actions.CLASS_CHANGED_TO_INFO);
        }
    }

    await checkForUpdates(date);

    console.log('[INFO] Successfully added ' + newElementsFoundForChanges + ' new changes to database (' + ((Date.now() - start) / 1000) + ' seconds)');
}

const checkForUpdates = async (date) => {

    ///Timetable changes, if a subject is already in the database, changes can be made like changing the room

    const classes = await untis.classList();

    for (let i = 0; i < classes.length; i++) {
        await timetable.findBulkEntry({classid: classes[i].id, date: {day: date.getDate().toString(), month: (date.getUTCMonth() + 1).toString(), year: date.getFullYear().toString()}}).then(async (result) => {

            const subjects = await untis.getTimeTable(classes[i].id, date);

            for (let a = 0; a < subjects.length; a++) {
                subjects[a].identifier = timetable.generateSubjectIdentifier(subjects[a].class.id, subjects[a].subject.id, subjects[a].start.hour, subjects[a].start.minute);
            }

            for (let a = 0; a < result.length; a++) {
                for (let b = 0; b < subjects.length; b++) {
                    const oldTimeTablerObject = result[a], newTimeTableObject = subjects[b];

                    if(oldTimeTablerObject.identifier === newTimeTableObject.identifier && oldTimeTablerObject.rayid === newTimeTableObject.rayid) {

                        //FROM CANCELED TO INFO
                        if(oldTimeTablerObject.status === "CANCELED" && newTimeTableObject.status.type === "INFO") {

                            await timetable.updateTimeTableState(ObjectId(oldTimeTablerObject._id), newTimeTableObject.status.type, newTimeTableObject.status.message);

                            await notifyAllSubscribedDevices(newTimeTableObject, actions.CANCELED_CHANGED_TO_INFO, date);

                        } else //FROM INFO TO CANCELED
                        if(oldTimeTablerObject.status === "INFO" && newTimeTableObject.status.type === "CANCELED") {

                            await timetable.updateTimeTableState(ObjectId(oldTimeTablerObject._id), newTimeTableObject.status.type, newTimeTableObject.status.message);

                            await notifyAllSubscribedDevices(newTimeTableObject, actions.INFO_CHANGED_TO_CANCELED, date);
                        } else //CANCELED TO CLASS
                        if(oldTimeTablerObject.status === "CANCELED" && newTimeTableObject.status.type === "CLASS") {


                            await timetable.updateTimeTableState(ObjectId(oldTimeTablerObject._id), newTimeTableObject.status.type, newTimeTableObject.status.message);

                            await notifyAllSubscribedDevices(newTimeTableObject, actions.CANCELED_CHANGED_TO_CLASS, date);
                        } else //FROM INFO TO CLASS
                        if(oldTimeTablerObject.status === "INFO" && newTimeTableObject.status.type === "CLASS") {

                            await timetable.updateTimeTableState(ObjectId(oldTimeTablerObject._id), newTimeTableObject.status.type, newTimeTableObject.status.message);

                            await notifyAllSubscribedDevices(newTimeTableObject, actions.INFO_CHANGED_TO_CLASS, date);
                        }

                        //TODO, UPDATE DATABASE ENTRY 
                    }   
                }
            }
        }).catch(error => console.error(error));   
    }
}

const notifyAllSubscribedDevices = async (newObject, action, date) => {
    
    const devices = await device.getDevicesWhichHaveSubscribedToProvidedSubjects([newObject.subject.id]);

    const prefix = days[date.getDay()];
    
    for (let i = 0; i < devices.length; i++) {
        const pushNotificationKey = await device.getMostRecentFirebasePushNotificationKey(ObjectId(devices[i]._id));
     
        var title = 'Änderung', body = '';

        if(action === actions.CANCELED_CHANGED_TO_INFO) {

            body = '(' + prefix + '): Es gibt neue Informationen zu dem Kurs ' + newObject.subject.name + ' bei' + newObject.teacher.firstname + ' ' + newObject.teacher.lastname;

        } else if(action === actions.INFO_CHANGED_TO_CANCELED) {

            body = '(' + prefix + '): Der Kurs ' + newObject.subject.name + ' bei' + newObject.teacher.firstname + ' ' + newObject.teacher.lastname + ' entfällt nun doch';
            
        } else if(action === actions.CANCELED_CHANGED_TO_CLASS) {

            body = '(' + prefix + '): Der Kurs ' + newObject.subject.name + ' bei' + newObject.teacher.firstname + ' ' + newObject.teacher.lastname + ' findet nun doch statt';

        } else if(action === actions.INFO_CHANGED_TO_CLASS) {

            body = '(' + prefix + '): Die Informationen zu dem Kurs ' + newObject.subject.name + ' bei' + newObject.teacher.firstname + ' ' + newObject.teacher.lastname + ' wurden geändert';

        }

        if(title !== '' && body !== '') {
            const notification = new Notification(title, body);

            if(pushNotificationKey != undefined) notification.sendSingle(pushNotificationKey.token, ObjectId(devices._id), action);
        }
    }

}

module.exports = {
    update: update
}