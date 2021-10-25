# fcg-webuntis-backend-api

## API Endpoints

This application is the backend for the mobile FCG-Timetable-App

## Response Format

All requests must be in the `application/json` format

```json
{
    "status": 200,
    "timestamp": 1635107444234,
    "message": "",
    "data": []
}
```

### Get the current Verison

```bash
$ GET /version
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635182798656,
    "message": "fcg-webuntis-backend-api running on version 1.0.0",
    "data": {
        "version": "1.0.0",
        "name": "fcg-webuntis-backend-api",
        "author": "Robert J. Kratz",
        "web": "https://github.com/rjks-us/fcg-webuntis-backend-api#readme"
    }
}
```

### Get the current signature

```bash
$ GET /signature
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635182833645,
    "message": "Current app signature",
    "data": {
        "author": "Made by Robert J. Kratz",
        "sponsor": "Powered by rjks.us"
    }
}
```

### Get a list of all holidays

```bash
$ GET /v1/holidays
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635182869875,
    "message": "List of all 10 upcoming holidays",
    "data": [
        {
            "id": 42,
            "short": "Herbst",
            "name": "Herbstferien",
            "start": {
                "year": "2021",
                "month": "10",
                "day": "09"
            },
            "end": {
                "year": "2021",
                "month": "10",
                "day": "24"
            }
        }
        ...
    ]
}
```

### Get a list of all classes

```bash
$ GET /v1/classes
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635182911112,
    "message": "List of all 23 active classes",
    "data": [
        {
            "id": 137,
            "short": "5a",
            "name": "Klasse 5a",
            "teachers": [
                "Jo Eun-San",
                "Niederau Susanne"
            ]
        }
        ...
    ]
}
```

### Get a list of the timegrid for each day

```bash
$ GET /v1/timegrid
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "List of all 63 subjects",
    "data": [
        {
            "day": 0,
            "mame": "MONDAY",
            "time": [
                {
                    "name": "1",
                    "startTime": 830,
                    "endTime": 915
                },
                {
                    "name": "2",
                    "startTime": 915,
                    "endTime": 1000
                },
                {
                    "name": "3",
                    "startTime": 1020,
                    "endTime": 1105
                },
                {
                    "name": "4",
                    "startTime": 1105,
                    "endTime": 1150
                },
                {
                    "name": "5",
                    "startTime": 1250,
                    "endTime": 1335
                },
                {
                    "name": "6",
                    "startTime": 1335,
                    "endTime": 1420
                },
                {
                    "name": "7",
                    "startTime": 1430,
                    "endTime": 1515
                },
                {
                    "name": "8",
                    "startTime": 1515,
                    "endTime": 1600
                },
                {
                    "name": "9",
                    "startTime": 1610,
                    "endTime": 1655
                },
                {
                    "name": "10",
                    "startTime": 1655,
                    "endTime": 1740
                }
                ...
            ]
        }
    ]
}
```

### Get a full timetable object from class id

```bash
$ GET /v1/timetable/:classid/:year/:month/:day
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "List of all 63 subjects",
    "data": [
        {
            "id": 30703,
            "rayid": 271643,
            "date": {
                "year": "2021",
                "month": "10",
                "day": "25"
            },
            "start": {
                "hour": "10",
                "minute": "20"
            },
            "end": {
                "hour": "11",
                "minute": "05"
            },
            "class": {
                "id": 242,
                "short": "Q2",
                "name": "Q2"
            },
            "teacher": {
                "id": 89,
                "short": "Bo",
                "lastname": "Bongartz",
                "firstname": " Alexander"
            },
            "subject": {
                "id": 64,
                "short": "B-L1",
                "name": "Biologie LK"
            },
            "room": {
                "id": 19,
                "short": "Bio2",
                "name": "Biologie 2"
            },
            "status": {
                "type": "CANCELED",
                "message": "eigenverantwortliches Arbeiten"
            }
        }
        ...
    ]
}
```


### Get a full timetable object from class id

```bash
$ POST /v1/timetable/:class/:year/:month/:day
```

#### Request Body, these are the ids of class object
```json
{
    "filter": [11, 232, 525, 123]
}
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "List of all 63 subjects",
    "data": [
        {
            "id": 30703,
            "rayid": 271643,
            "date": {
                "year": "2021",
                "month": "10",
                "day": "25"
            },
            "start": {
                "hour": "10",
                "minute": "20"
            },
            "end": {
                "hour": "11",
                "minute": "05"
            },
            "class": {
                "id": 242,
                "short": "Q2",
                "name": "Q2"
            },
            "teacher": {
                "id": 89,
                "short": "Bo",
                "lastname": "Bongartz",
                "firstname": " Alexander"
            },
            "subject": {
                "id": 64,
                "short": "B-L1",
                "name": "Biologie LK"
            },
            "room": {
                "id": 19,
                "short": "Bio2",
                "name": "Biologie 2"
            },
            "status": {
                "type": "CANCELED",
                "message": "eigenverantwortliches Arbeiten"
            }
        }
        ...
    ]
}
```

### Get a full list of all subjects of a class

```bash
$ GET /v1/subjects/:classid
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "List of all 63 subjects",
    "data": [
        {
            "id": 1,
            "short": "M",
            "name": "Mathematik",
            "class": {
                "id": 182,
                "short": "7c",
                "name": "Klasse 7c"
            },
            "teacher": {
                "id": 274,
                "short": "No",
                "lastname": "Nowicka",
                "firstname": " Wioletta"
            }
        }
        ...
    ]
}
```

### Get a full list of all subjects of a class in order

```bash
$ GET /v1/subjectsList/:classid
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "List of all 63 subjects",
    "data": {
        "Biologie": [
            {
                "id": 39,
                "short": "B-G1",
                "name": "Biologie GK",
                "class": {
                    "id": 242,
                    "short": "Q2",
                    "name": "Q2"
                },
                "teacher": {
                    "id": 239,
                    "short": "Lü",
                    "lastname": "Lückerath",
                    "firstname": " Eike Juliane"
                }
            }
            ...
        ]
    }
}
```