<a href="https://fcg-app.de"><p align="center">
    <img height=250 src="https://raw.githubusercontent.com/rjks-us/fcg-webuntis-backend-api/main/assets/fcg_logo_black.jpg"/>
</p></a>

# fcg-webuntis-backend-api

This application is the backend for the mobile FCG-Timetable-App

## Installation

1. Navvigate into the `rest folder`
```bash
$ cd ./rest/
```

2. Install all npm packages
```bash
$ npm install
```

3. Locate the `config.json` in `backend/config.json` and add your credentials

4. Run
```bash
$ npm run backend
```

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

## API Endpoints

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
    ]
}
```

### Get a list of all holidays of today

```bash
$ GET /v1/today
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635182869875,
    "message": "List of todays activities",
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
        ]
    }
}
```

## Authenticated user format

```bash
$ POST /v1/devices/create-device
```

#### Request Body
```json
{
    "name": "Timo Werner",
    "platform": "IOS/15.0.2",
    "device": {
        "model": "IPhone 11",
        "IOS": "15.0.2",
        "id": "37612t687xdt167854zq8118z243875zr78zwe87rztcc67t278z78cz32c87zn7843z5b"
    },
    "courses": [1,2,3,4],
    "class": 242,
    "push": "1212uwsdzu28z341b1swqtz67dct761te762t671t2671tc672t37612t687xdt167854zq87zu9hidsblifdgjaoiuzr"
}
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "Device successfully registered",
    "data": {
        "token": "TOKEN",
        "refresh": "REFRESHTOKEN"
    }
}
```

## User Profile

```bash
$ GET /v1/devices/me
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "Userprofile for Timo Werner",
    "data": {
        "name": "Timo Werner",
        "courses": [1, 3, 123],
        "iat": 1635181066761,
        "notification": []
    }
}
```

## Update Courses

```bash
$ POST /v1/update/course
```

#### Request Body
```json
{
    "courses": [200, 145, 123]
}
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "Your updated your profile",
    "data": [
        200,
        145,
        123
    ]
}
```

## Update Class

```bash
$ POST /v1/update/class
```

#### Request Body
```json
{
    "class": 242
}
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "Your updated your profile",
    "data": {
        "class": 242
    }
}
```

## Update Token

```bash
$ POST /v1/update/token
```

#### Request Body
```json
{
    "token": "PUSH-NOTIFICATION-TOKEN-HERE"
}
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "Your updated the push token",
    "data": {
        "token": "PUSH-NOTIFICATION-TOKEN-HERE"
    }
}
```

## Update Name

```bash
$ POST /v1/update/token
```

#### Request Body
```json
{
    "name": "Hans Wurst"
}
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "Your updated your name",
    "data": {
        "name": "Hans Wurst"
    }
}
```

## Refresh Tokens

```bash
$ POST /v1/update/token
```

#### Request Body
```json
{
    "token": "Token",
    "refresh": "Refreshtoken"
}
```

#### Response:
```json
{
    "status": 200,
    "timestamp": 1635181064311,
    "message": "Your identity has been approved, a new token family was created",
    "data": {
        "token": "New Token",
        "refresh": "New Refresh Token"
    }
}
```
