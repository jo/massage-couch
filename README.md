# massage-couch
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
changes_feed_timeout = 60000
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
    "my-masseur": "function(doc) { /* do it! */ }"
  }
}
```

## Contributing
Test your code with `npm test` and lint the code via `npm run jshint`.

## License
Copyright (c) 2014 Johannes J. Schmidt, null2 GmbH  
Licensed under the MIT license.
