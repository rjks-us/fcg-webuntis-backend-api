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
$ /version
```

### Get the current signature

```bash
$ /signature
```

### Get a list of all holidays

```bash
$ /v1/holidays
```

### Get a list of all classes

```bash
$ /v1/classes
```

### Get a full timetable object from class id

```bash
$ /v1/timetable/:classid/:year/:month/:day
```

### Get a full list of all subjects of a class

```bash
$ /v1/subjects/:classid
```
