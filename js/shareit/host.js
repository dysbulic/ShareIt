Blob.slice = Blob.slice || Blob.webkitSlice || Blob.mozSlice
if(Blob.slice != undefined)
	alert("It won't work in your browser. Please use Chrome or Firefox.");

// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();


var chunksize = 65536


function Bitmap(size)
{
  var bitmap = new Array(size)
  for(var i=0; i<size; i++)
    bitmap[i] = i;
  return bitmap
}

function getRandom(bitmap)
{
  return bitmap[Math.floor(Math.random() * bitmap.length)]
}

function remove(bitmap, item)
{
  bitmap.splice(bitmap.indexOf(item), 1)
}


function Host_init(db, onsuccess)
{
	var host = {}

    EventTarget.call(host)

	if(onsuccess)
		onsuccess(host);

    // Get the channel of one of the peers that have the file from its hash.
    // Since the hash and the tracker system are currently not implemented we'll
    // get just the channel of the peer where we got the file that we added
    // ad-hoc before
    function getChannel(file)
    {
        return file.channel
    }

    host._transferbegin = function(file)
    {
        // Calc number of necesary chunks to download
        var chunks = file.size/chunksize;
        if(chunks % 1 != 0)
            chunks = Math.floor(chunks) + 1;

        // Add a blob container and a bitmap to our file stub
        file.blob = new Blob([''], {"type": file.type})
        file.bitmap = Bitmap(chunks)

        // Insert new "file" inside IndexedDB
        db.sharepoints_add(file,
        function()
        {
            host.dispatchEvent({type:"transfer.begin", data:file})
            console.log("Transfer begin: '"+file.name+"' = "+JSON.stringify(file))

            // Demand data from the begining of the file
            getChannel(file).emit('transfer.query', file.name,
                                                    getRandom(file.bitmap))
        },
        function(errorCode)
        {
            console.error("Transfer begin: '"+file.name+"' is already in database.")
        })
    }

    host.connectTo = function(uid, onsuccess)
    {
        // Search the peer between the list of currently connected peers
        var peer = host._peers[uid]
        if(!peer)
            Protocol_init(new WebSocket('wss://localhost:8001'),
            function(protocol)
            {
                host._peers[uid] = protocol

                Peer_init(protocol, db, host)

                if(onsuccess)
                    onsuccess(protocol)
            })

        else if(onsuccess)
	        onsuccess(peer)
    }
}