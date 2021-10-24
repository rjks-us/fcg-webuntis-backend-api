const { lchown } = require('fs');
const WebUntisLib = require('webuntis');
const { connect } = require('./api/application');

const config = require('./config.json');

var authenticated = new WebUntisLib(config.api.SCHOOL, "KratzRobert", "", config.api.HOST);

/**
 * @description Webuntis instance connecting to Untis API
 * @returns Promise<any>
 */
const login = () => {
    return new Promise((resolve, rejects) => {
        try {
            authenticated.login().then(() => resolve()).catch(err => rejects(err));
        } catch (error) {
            rejects('Could not authenticate to the WebUntis API');
        }
    });
};

/**
 * @description Webuntis instance disconnecting to Untis API
 * @returns Promise<any>
 */
const logout = async () => {
    await authenticated.logout();
};

const validate = async () => {
    return (await authenticated.validateSession);
}

const refresh = async () => {
    await login();
}

/**
 * Returns a full list of all active Classes
 * @async
 * @returns Class List JSON
 */
const classList = async () => {
    if(!validate) await refresh();

    const teachers = await authenticated.getTeachers(), classes = await authenticated.getClasses(), list = [];

    await classes.forEach(c => {
        if(c.active) {
            var tmp = {id: c.id, short: c.name, name: c.longName, teachers: []};
            teachers.forEach(t => {
                if(c.teacher1 && t.id === c.teacher1) tmp.teachers.push((t.longName.split(';')[0] + ' ' + t.longName.split(';')[1]).replaceAll('  ', ' '));
                if(c.teacher2 && t.id === c.teacher2) tmp.teachers.push((t.longName.split(';')[0] + ' ' + t.longName.split(';')[1]).replaceAll('  ', ' '));
            });
            list.push(tmp);
        }
    });
    return list;
}

/**
 * Returns all active holidays
 * @async
 * @returns Array<JSON>
 */
const holidays = async () => {
    if(!validate) await refresh();

    const holidays = await authenticated.getHolidays(), list = [];

    await holidays.forEach(days => {
        list.push({id: days.id, short: days.name, name: days.longName, start: formatUntisDate(days.startDate), end: formatUntisDate(days.endDate)})
    })

    return list;
}

/**
 * Returns the timetable for the given day
 * @param {Integer} id 
 * @param {Date} date 
 * @async
 * @returns Array<JSON>
 */
const getTimeTable = async (id, date) => {
    if(!validate) await refresh();

    try {
        const timetable = await authenticated.getTimetableFor(date, id, WebUntisLib.TYPES.CLASS), list = [];

        timetable.forEach(async element => {
            list.push(await formatTimeTableObject(element));
        });

        return sort(list);
    } catch (error) {
        return [];
    }
}

const formatTimeTableObject = async (element) => {
    var tmp = {id: element.lsnumber, date: formatUntisDate(element.date), start: formatUntisTime(element.startTime), end: formatUntisTime(element.endTime), class: {}, teacher: {}, subject: {}, room: {}, status: {}};

    //Class
    if(element.kl[0]) {
        var cn = element.kl[0];
        tmp.class = {
            id: cn.id,
            short: cn.name,
            name: cn.longname
        }
    }
    //Teacher
    if(element.te[0]) {
        var cn = element.te[0];
        tmp.teacher = {
            id: cn.id,
            short: cn.name,
            //name: (cn.longname.split(';')[0] + ' ' + cn.longname.split(';')[1]).replaceAll('  ', ' '),
            lastname: cn.longname.split(';')[0],
            firstname: (cn.longname.split(';')[1])
        }
    }
    //Subject
    if(element.su[0]) {
        var cn = element.su[0];
        tmp.subject = {
            id: cn.id,
            short: cn.name,
            name: cn.longname
        }
    }
    //Subject
    if(element.ro[0]) {
        var cn = element.ro[0];
        tmp.room = {
            id: cn.id,
            short: cn.name,
            name: cn.longname
        }
    }
    tmp.status = {type: "CLASS", message: element.substText};

    if(element.code && element.code === 'irregular') tmp.status = {type: "INFO", message: element.substText};
    if(element.code && element.code === 'cancelled') tmp.status = {type: "CANCELED", message: element.substText};

    return tmp;
}

const formatSubjectObject = async (element) => {
    var tmp = {id: 0, short: '', name: '', class: {}, teacher: {}};

    //Class
    if(element.kl[0]) {
        var cn = element.kl[0];
        tmp.class = {
            id: cn.id,
            short: cn.name,
            name: cn.longname
        }
    }
    try {
        //Teacher
        if(element.te[0]) {
            var cn = element.te[0];
            tmp.teacher = {
                id: cn.id,
                short: cn.name,
                //name: (cn.longname.split(';')[0] + ' ' + cn.longname.split(';')[1]).replaceAll('  ', ' '),
                lastname: cn.longname.split(';')[0],
                firstname: (cn.longname.split(';')[1]).substring(1, cn.longname.split(';')[1].length)
            }
        }
    } catch (error) {}

    //Subject
    if(element.su[0]) {
        var cn = element.su[0];
        tmp.id = cn.id;
        tmp.short = cn.name;
        tmp.name = cn.longname;
    }
    return tmp;
}

const getAllSubjects = async (id, start, end) => {
    if(!validate) await refresh();
    
    const timetable = await authenticated.getTimetableForRange(start, end, id, WebUntisLib.TYPES.CLASS), list = [], form = [];

    await timetable.forEach(async element => {
        if(!list.includes(element.su[0].id)) {
            list.push(element.su[0].id);
            form.push(await formatSubjectObject(element))
        }
    });

    return form;
}

const formatUntisDate = (time) => {
    time = time + '';
    return {year: time.slice(0, 4), month: time.slice(4, 6), day: time.slice(6, 8)};
}

const formatUntisTime = (time) => {
    time = time + '';
    if(time.length == 3) return {hour: time.slice(0, 1), minute: time.slice(1, 3)};
    return {hour: time.slice(0, 2), minute: time.slice(2, 4)};
}

const sort = (array) => {
    let n = array.length;
    
    for(let i = 0; i < n; i++) {
        let min = i;
        for(let j = i+1; j < n; j++){
            if(parseInt(array[j].start.hour + array[j].start.minute) < parseInt(array[min].start.hour + array[min].start.minute)) {
                min=j;
            }
         }
         if (min != i) {
             let tmp = array[i]; 
             array[i] = array[min];
             array[min] = tmp;      
        }
    }
    return array;
}

module.exports = {
    login: login,
    validate: validate,
    classList: classList,
    holidays: holidays,
    getTimeTable: getTimeTable,
    getAllSubjects: getAllSubjects
}