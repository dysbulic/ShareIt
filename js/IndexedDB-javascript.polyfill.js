// Polyfill to add full support for JavaScript objects with an IndexedDB
// interface. This is primary purpose because a bug storing files on Chromium
// implementation (http://code.google.com/p/chromium/issues/detail?id=108012).
// The drawback is that since it's implemented using pure JavaScript objects,
// well... the data persistence lacks about some functionality... :-P

window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;


function testIDBBlobSupport(callback)
{
  var dbname = "detect-blob-support";
  indexedDB.deleteDatabase(dbname).onsuccess = function()
  {
    var request = indexedDB.open(dbname, 1);
    request.onupgradeneeded = function()
    {
      request.result.createObjectStore("store");
    };
    request.onsuccess = function()
    {
      var db = request.result;
      try
      {
        db.transaction("store", "readwrite").objectStore("store").put(new Blob(), "key");
        callback(true);
      }
      catch(e)
      {
        callback(false);
      }
      finally
      {
        db.close();
        indexedDB.deleteDatabase(dbname);
      }
    };
  };
}


// Check for IndexedDB support and if it store File objects
testIDBBlobSupport(function(supported){if(!supported){

console.warn("Your IndexedDB implementation doesn't support storing File or "+
             "Blob objects (maybe are you using Chrome?), required to this app"+
             " work correctly. I'm going to insert a custom implementation "+
             "using JavaScript objects but, unluckily, they will not persists.")


function IDBRequest()
{
  this.target = {}

  set this.onsuccess(func)
  {
    var event = {target: target}
    func.call(this, event)
  }
}

function IDBOpenRequest()
{
  IDRequest.call(this)
}


function IDBCursor()
{
  this.continue = function()
  {
  }
}

function IDBObjectStore()
{
  var objects: {},

  this.add = function(value, key)
  {
    objects[key] = value

    var request = new IDBRequest()
        request.result = objects[key]
    return request
  }
  this.get = function(key)
  {
    var request = new IDBRequest()
        request.result = objects[key]
    return request
  }
  this.openCursor = function(range)
  {
    var request = new IDBRequest()
        request.target.result = new IDBCursor()
    return request
  }
  this.put = function(value, key)
  {
    objects[key] = value

    var request = new IDBRequest()
        request.result = objects[key]
    return request
  }
}

function IDBTransaction()
{
  this.objectStore = function(name)
  {
    return db._stores[name]
  }
}

function IDBDatabase()
{
  this._stores = {}

  this.transaction = function(storeNames, mode)
  {
    var result = new IDBTransaction()
        result.db = this

    return result
  }
}


window.indexedDB =
{
  _dbs: {},

  open: function(name, version)
  {
    _dbs[name] = _dbs[name] || new IDBDatabase()

    var request = new IDBOpenRequest()
        request.result = _dbs[name]
    return request
  }
}

}})