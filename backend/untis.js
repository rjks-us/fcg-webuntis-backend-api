const WebUntisLib = require('webuntis');

const config = require('./config.json');
const manipulize = require('./db/manipu');
const manip = require('./untlis/manipulizer')

var authenticated = new WebUntisLib(config.api.SCHOOL, config.api.USER, config.api.PASSWORD, config.api.HOST);

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

/**
 * Checks the validation of the current session to the WebUntis api
 * @async
 * @returns Boolean
 */
const validate = async () => {
    return (await authenticated.validateSession());
}

/**
 * Refreshes the current session
 * @async
 */
const refresh = async () => {
    await logout().then(async () => {
        await login();
        console.log('[INFO] Refreshed Session to WebUntis Backend API');
    });
}

/**
 * Returns a full list of all active Classes
 * @async
 * @returns Class List JSON
 */
const classList = async () => {
    if(!await validate()) await refresh();

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
    if(!await validate()) await refresh();

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
    if(!await validate()) await refresh();

    try {
        const timetable = await authenticated.getTimetableFor(date, id, WebUntisLib.TYPES.CLASS), list = [];

        var changes = await manipulize.findBulkEntry({class: parseInt(id)});

        for (let i = 0; i < timetable.length; i++) {
            var tmp = await formatTimeTableObject(timetable[i], changes);
            list.push(tmp);
        }

        return sort(list);
    } catch (error) {
        if(config.debug) console.log(error);
        return [];
    }
}

/**
 * Returns the current timegrid for each day
 * @async
 * @returns JSON
 */
const getTimeGrid = async () => {
    if(!await validate()) await refresh();

    const grid = await authenticated.getTimegrid(), list = [];
    const week = ["MONDAY", "TUESDAY", "WENDNESDAY", "THURSDAY", "FRIDAY"]

    for (let i = 0; i < grid.length; i++) {
        list.push({
            day: i,
            mame: week[i],
            time: grid[i].timeUnits
        })
    }

    console.log(list);

    return list;
}

/**
 * Returns the Timetable for date x with a filtered result
 * @param {Integer} id 
 * @param {Date} date 
 * @param {Array} filter 
 * @async
 * @returns Array
 */
const getTimeTableWithFilter = async (id, date, filter) => {
    if(!await validate()) await refresh();

    try {
        const timetable = await authenticated.getTimetableFor(date, id, WebUntisLib.TYPES.CLASS), list = [];

        await timetable.forEach(async element => {
            if(filter.includes(element.su[0].id)) {
                var tmp = await formatTimeTableObject(element);
                if(manipulize.isTarget(tmp.rayid)) tmp = manipulize.manipulize(tmp, manipulize.CANCELED); //<-- Do not touch

                list.push(tmp);
            }
        });

        return await sort(list);
    } catch (error) {
        if(config.debug) console.log(error);
        return [];
    }
}

/**
 * Returns a list of all aviable Subjects in the range of the given date
 * @param {Integer} id 
 * @param {Date} start 
 * @param {Date} end 
 * @async
 * @returns Array
 */
const getAllSubjects = async (id, start, end) => {
    if(!await validate()) await refresh();
    
    const timetable = await authenticated.getTimetableForRange(start, end, id, WebUntisLib.TYPES.CLASS), list = [], form = [];

    await timetable.forEach(async element => {
        if(element.su[0] != undefined && !list.includes(element.su[0].id)) {
            try {
                list.push(element.su[0].id);
                form.push(await formatSubjectObject(element))
            } catch (error) {}
        }
    });
    return form;
}

/**
 * Returns a ordered list by subjects in the given time range
 * @param {Integer} id 
 * @param {Date} start 
 * @param {Date} end 
 * @returns Array
 */
const getAllSubjectsOrdered = async (id, start, end) => {
    if(!await validate()) await refresh();
    
    const timetable = await authenticated.getTimetableForRange(start, end, id, WebUntisLib.TYPES.CLASS), list = [], form = {};

    await timetable.forEach(async element => {
        if(element.su[0] != undefined && !list.includes(element.su[0].id) && !config.rest.subjects.alwayssubscibed.includes(element.su[0].name)) {
            try {
                var short = (element.su[0].longname);

                if(short.includes(" ")) short = short.split(' ')[0];

                list.push(element.su[0].id);

                if(!form[short]) form[short] = [];

                form[short].push(await formatSubjectObject(element));
            } catch (error) {
                if(config.debug) console.log(error);
            }
        }
    });
    return form;
}

/**
 * Checks if the current day is a holiday
 * @returns JSON
 */
const getToday = async () => {
    if(!await validate()) await refresh();

    const days = await holidays();

    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if(chechDateIsInRage(`${day.start.month}/${day.start.day}/${day.start.year}`, `${day.end.month}/${day.end.day}/${day.end.year}`)) return day;
    }
    return [];
}

/**
 * Reformat the ugly JSON format from WebUntis to the beautifull JSON format of this application uses
 * @param {JSON} element 
 * @returns JSON
 */
const formatTimeTableObject = async (element, options) => {
    var tmp = {id: element.lsnumber, rayid: element.id, date: formatUntisDate(element.date), start: formatUntisTime(element.startTime), end: formatUntisTime(element.endTime), class: {}, teacher: {}, subject: {}, room: {}, status: {}};

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

    //MANIPULIZE RESULT BY REPLACING STATUS WITH OPTION STATUS

    if(options) {
        for (let i = 0; i < options.length; i++) {
            if(options[i].rayid === tmp.rayid) {
                tmp.status.type = formatType(options[i].status.type);
                if(options[i].status.message) tmp.status.message = options[i].status.message;
            }
        }
    }

    return tmp;
}

/**
 * Generates status name by id
 * @param {Number} type 
 * @returns String
 */
const formatType = (type) => {
    switch (type) {
        case 1:
            return "CANCELED"
        case 2:
            return "INFO"
        default:
            return "CLASS"
    }
}

/**
 * Reformat the ugly JSON format from WebUntis to the beautifull JSON format this application uses
 * @param {JSON} element 
 * @returns JSON
 */
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
                firstname: (cn.longname.split(';')[1]).substring(0, cn.longname.split(';')[1].length)
            }
        }
    } catch (error) {
        if(config.debug) console.log(error);
    }

    //Subject
    if(element.su[0]) {
        var cn = element.su[0];
        tmp.id = cn.id;
        tmp.short = cn.name;
        tmp.name = cn.longname;
    }
    return tmp;
}

/**
 * Checks if a date is between two dates
 * @param {Date} start 
 * @param {Date} end 
 * @returns Boolean
 */
const chechDateIsInRage = (start, end) => {
    var fDate = Date.parse(start), lDate = Date.parse(end), cDate = Date.parse(new Date()), now = new Date(), current = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`;

    if((cDate <= lDate && cDate >= fDate) || start === current || end === current) return true;
    return false;
}

/**
 * Reformat the WebUntis Date format to JSON
 * @param {String} element 
 * @example 20211025 -> {year: 2021, month: 10, day: 25}
 * @returns JSON
 */
const formatUntisDate = (time) => {
    time = time + '';
    
    return {year: time.slice(0, 4), month: time.slice(4, 6), day: time.slice(6, 8)};
}

/**
 * Reformat the WebUntis Time format to JSON
 * @param {String} element 
 * @example 1005 -> {hour: 10, minute: 05}
 * @returns JSON
 */
const formatUntisTime = (time) => {
    time = time + '';

    if(time.length == 3) return {hour: time.slice(0, 1), minute: time.slice(1, 3)};
    return {hour: time.slice(0, 2), minute: time.slice(2, 4)};
}

/**
 * Orders the array by date using selection sort
 * @param {Array} array 
 * @returns Array
 */
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
    instance: authenticated,
    login: login,
    validate: validate,
    classList: classList,
    getToday: getToday,
    holidays: holidays,
    getTimeTable: getTimeTable,
    getAllSubjects: getAllSubjects,
    getAllSubjectsOrdered: getAllSubjectsOrdered,
    getTimeTableWithFilter: getTimeTableWithFilter,
    getTimeGrid: getTimeGrid
}