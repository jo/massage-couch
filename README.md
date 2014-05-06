# massage-couch
[![Build Status](https://travis-ci.org/jo/massage-couch.svg?branch=master)](https://travis-ci.org/jo/massage-couch)

Take a break and let me massage your CouchDB documents.  
I am an os_daemon under the control of your couch.

## Installation
```shell
npm install massage-couch -g
```

## Daemon Configuration
Add massage-couch to `os_daemons` config section:

```ini
[os_daemons]
massage-couch = massage-couch-daemon
```

Now CouchDB takes care of the massage-couch process.

```ini
[massage-couch]
; Optional username and password, used by the workers to access the database
username = mein-user
password = secure
; Number of simultaneous changes feeds in parallel. Default is 20.
; Increase it to at least  the number of your databases, to get best performance.
; If streams is less than the number of databases, all databases will still be queried
; but in intervals of the changes_feed_timeout (see below). You should keep the 
; streams parameter equal to or larger than the number of databases in the server
; usually.
streams = 20
; Timeout for changes feed in ms. Default is 60000. See the 'streams' parameter above
; if you have a really large number of databases in your server and cannot afford to
; have a changes feed open to each of them.
timeout = 60000
```

## Massage Definition
Add a `massage-couch` property to a design document.
massage-couch will process all databases which have a design document with such
property.

```json
{
  "_id": "_design/my-massage-couch-config",
  "_rev": "1-ef6f87ae96babf982648268a7e5c5112",
  "massage-couch": {
    "my-masseur": "function(doc, db, done) { /* do it! */ }"
  }
}
```

As you see you can define different masseurs under a `massage-couch` property.
Each masseur will be run, but there is no special order in which they are
executed.

A masseur function receives three arguments:
* `doc`: the document received from the changes feed (the changes feed runs with `include_docs`)
* `db`: a [nano](https://github.com/dscape/nano) adapter, pointing to the db where the doc comes from
* `done`: MUST be called after completion
  (the masseur function is run through [event-stream map]https://github.com/dominictarr/event-stream#map-asyncfunction)

## Client
Instead of installing massage-couch as daemon it can be run standalone:
```
massage-couch-client
```

### Options
* `--version`: Return massage-couch npm version
* `--username`: Username used to access the database
* `--password`: Password
* `--streams`: Number of simultaneous changes feeds in parallel
* `--timeout`: Timeout for changes feed in ms

## Contributing
Test your code with `npm test` and lint the code via `npm run jshint`.

You can set a different CouchDB url (and authentication credentials) via `COUCH` environment variable:
```shell
COUCH=http://user:password@localhost:5984 npm test
```

## License
Copyright (c) 2014 Johannes J. Schmidt, null2 GmbH  
Licensed under the MIT license.
