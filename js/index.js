function load()
{
    // Init database
    DB_init(function(db)
    {
        // Init user interface
        var ui = new UI(db)

        var hasher = new Hasher(db)
            hasher.onhashed = function(fileentry)
            {
                db.files_put(fileentry)

	            db.files_getAll(null, function(files)
	            {
	                ui.update_fileslist_sharing(files)
	            })
            }

        ui.setHasher(hasher, db)

        // Connect a signaling channel to the handshake server and get an ID
//        var signaling = new WebSocket('ws://localhost:8001')
        var signaling = new WebSocket('wss://shareit.nodejitsu.com')
	    signaling.onopen = function()
	    {
            Transport_init(signaling)

            var peersManager = new PeersManager(signaling, db)

            // Apply signaling "interface" events and functions to transport
            Transport_Signaling_init(signaling, peersManager)

            ui.setPeersManager(peersManager)

            db.files_getAll(null, function(filelist)
            {
                ui.update_fileslist_sharing(filelist)

//                // Restart downloads
//                for(var i=0, fileentry; fileentry=filelist[i]; i++)
//                    if(fileentry.bitmap)
//                    {
//                        var channel = peersManager.getChannel(fileentry)
//                        channel.emit('transfer.query', fileentry.hash,
//                                                       getRandom(fileentry.bitmap))
//                    }
            })

            ui.setSignaling(signaling)
        }
    })
}


window.addEventListener("DOMContentLoaded", function()
//window.addEventListener("load", function()
{
	// Check for IndexedDB support and if it store File objects
	testIDBBlobSupport(function(supported)
	{
	    if(!supported)
	    {
	    	alert("Your IndexedDB implementation doesn't support storing File or "+
		          "Blob objects (maybe are you using Chrome?), required by this app"+
		          " to work correctly. I'm going to insert a custom implementation "+
		          "using JavaScript objects but, unluckily, data will not persists.")

	       IdbJS_install();
	    }

        load()
	})
})