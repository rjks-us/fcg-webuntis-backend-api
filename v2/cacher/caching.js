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

    var changesCollection = []; ///all canceled subjects

    var globalNotificationCollection = [];

    console.log('[INFO] Started caching canceled elements of all classes')

    const prefix = days[date.getDay()];

    const start = Date.now(), classes = await classList();

    ///Find all required entrys, add them to a list and set identifier to the object
    for (let i = 0; i < classes.length; i++) {
        const c = classes[i], table = await getTimeTable(c.id, date);

        for (let a = 0; a < table.length; a++) {
            if((table[a].status.type === "CANCELED" || table[a].status.type === "INFO") && table[a].subject.id !== undefined) {
                table[a].identifier = timetable.generateSubjectIdentifier(table[a].class.id, table[a].subject.id, 0, 0); 
                changesCollection.push(table[a]);
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

    for(var key in filteredCollection) {

        if(filteredCollection[key].length == 1) {
            
            globalNotificationCollection.push(filteredCollection[key][0]);
            console.log('CANCELED');

        } else if(filteredCollection[key].length == 2) {

            var canceled = filteredCollection[key][0], info = filteredCollection[key][1];

            if(canceled.status.type == 'INFO') {
                var tmp = canceled;
                canceled = info;
                info = tmp;
            }

            var _id = canceled.id, _rayid = canceled.rayid, _date = canceled.date, _start = canceled.start, _end = canceled.end, _class = canceled.class, _identifier = canceled.identifier;

            var _room = canceled.room, _status = canceled.status, _subject = canceled.subject, _teacher = canceled.teacher;

            if(info.teacher === {}) { ///No teacher = canceled hour
                _room = info.room;
                console.log('CANCELED');
            } else if(info.room !== undefined && info.room.id == 403) { ///Canceled
                _room = info.room;
                _status = canceled.status;
                console.log('CANCELED');
            } else if(canceled.room.id != info.room.id) { ///Room changed
                _room = info.room;
                _status = info.status;
                console.log('ROOM CHANGED');
            } else if(canceled.teacher.id != info.teacher.id) { ///Teacher changed
                _teacher = info.teacher;
                _status = info.status;
                console.log('SUBTEACHER');
            } else if(canceled.subject.id != info.subject.id) { ///Subject changed
                _teacher = info.teacher;
                _status = info.status;
                console.log('SUBJECT CHANGED');
            } else {
                console.log('NO DATA FOUND');
            }

            globalNotificationCollection.push({
                id: _id,
                rayid: _rayid,
                date: _date,
                start: _start,
                end: _end,
                class: _class,
                teacher: _teacher,
                subject: _subject,
                room: _room,
                status: _status,
                identifier: _identifier
            });
        }
    }

    var newElementsFoundForChanges = 0;

    for (let i = 0; i < globalNotificationCollection.length; i++) {
        const finalObject = globalNotificationCollection[i];
        //console.log(finalObject);
        try {
            const result = await timetable.findBulkEntry({identifier: finalObject.identifier, date: {day: finalObject.date.day, month: finalObject.date.month, year: finalObject.date.year}})
    
            if(result.length === 0) { ///NEW ENTRY FOUND

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

                const devices = await device.getDevicesWhichHaveSubscribedToProvidedSubjects([finalObject.subject.id], finalObject.class.id);

                for (let a = 0; a < devices.length; a++) {
                    const dev = devices[a];
                    
                    const pushNotificationKey = await device.getMostRecentFirebasePushNotificationKey(ObjectId(dev._id))
        
                    if(finalObject.status.type === 'INFO') {
                        var title = 'Information';
                        var body = 'Der Kurs ' + finalObject.subject.name + ' findet heute bei' + finalObject.teacher.firstname + ' ' + finalObject.teacher.lastname + ' in ' + finalObject.room.name + ' statt';
        
                        var notification = new Notification(title, body);
        
                        if(pushNotificationKey != undefined) notification.sendSingle(pushNotificationKey.token, ObjectId(dev._id), actions.CLASS_CHANGED_TO_INFO);
        
                    } else {
                        var title = 'Entfall';
                        var body = 'Der Kurs ' + finalObject.subject.name + ' bei' + finalObject.teacher.firstname + ' ' + finalObject.teacher.lastname + ' entfällt heute';
        
                        var notification = new Notification(title, body);
        
                        if(pushNotificationKey != undefined) notification.sendSingle(pushNotificationKey.token, ObjectId(dev._id), actions.CLASS_CHANGED_TO_CANCELED);
                    }
                }
            }

        } catch (error) {
            console.log(error);
        }
        
    }

    console.log(newElementsFoundForChanges + ' entrys');

}

module.exports = {
    update: update
}