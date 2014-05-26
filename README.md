# massage-couch
Take a break and let me massage your CouchDB documents.  
I am a streaming [os_daemon](http://docs.couchdb.org/en/latest/config/externals.html#os_daemons) under the control of your couch.  

## Installation
```shell
npm install massage-couch -g
```

## Commandline Client
You can run massage-couch from the commandline:
```shell
massage-couch
```

The options explained above can be given as commandline parameters (prefixed with
`--`) or environment variables (UPPERCASED).

```shell
massage-couch --username bernd --password secure --whitelist projects
```

## Daemon Configuration
Add massage-couch to the `os_daemons` config section (eg. in local.ini):

```ini
[os_daemons]
massage-couch = massage-couch
```

Now CouchDB takes care of the massage-couch process.

```ini
[massage-couch]
; Optional username and password, used by the workers to access the database
username = mein-user
password = secure
; Only documents in the databases above are processed (seperate with comma)
; whitelist = mydb,otherdb
; Ignore the following databases (again comma seperated list)
blacklist = _users,_replicator
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
* `doc`: the document received from the changes feed (the changes feed runs with `include_docs = true`)
* `db`: a [nano](https://github.com/dscape/nano) adapter, pointing to the db where the doc comes from
* `done`: MUST be called after completion
  (the masseur function is run through [event-stream map](https://github.com/dominictarr/event-stream#map-asyncfunction))

## Contributing
Test your code with `npm test`.

You can set a different CouchDB url (and authentication credentials) via `COUCH` environment variable:
```shell
COUCH=http://user:password@localhost:5984 npm test
```

## License
Copyright (c) 2014 Johannes J. Schmidt, null2 GmbH  
Licensed under the MIT license.
