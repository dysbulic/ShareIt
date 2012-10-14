function load()
{
    // Init database
    DB_init(function(db)
    {
        var worker = new Worker('js/webp2p/hasher_worker.js');
            worker.onmessage = function(event)
            {
                db.files_add(event.data)

	            db.files_getAll(null, function(files)
	            {
	                ui.update_fileslist_sharing(files)
	            })
            }

        // Init user interface
        var ui = new UI()

        // Get shared points and init them
        db.sharepoints_getAll(null, function(sharedpoints)
        {
            ui.update_fileslist_sharedpoints(sharedpoints)

            // [To-Do] Start hashing new files on the shared points
        })

        ui.ready_fileschange(function(sharedpoints)
        {
            // Hash files on the worker
            worker.postMessage(sharedpoints)

            // Loop through the FileList and add sharedpoints to list.
            for(var i = 0, sp; sp = sharedpoints[i]; i++)
                db.sharepoints_add(sp)

            db.sharepoints_getAll(null, function(sharedpoints)
            {
                ui.update_fileslist_sharedpoints(sharedpoints)
            })
        })

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

            db.sharepoints_getAll(null, function(filelist)
            {
                ui.update_fileslist_sharing(filelist)

//                // Restart downloads
//                for(var i = 0, file; file = filelist[i]; i++)
//                    if(file.bitmap)
//                        signaling.emit('transfer.query', file.name,
//                                                        getRandom(file.bitmap))
            })

            ui.setSignaling(signaling)
        }
    })
}


window.addEventListener("load", function()
{
	// Check for IndexedDB support and if it store File objects
	testIDBBlobSupport(function(supported)
	{
	    if(!supported)
	       IdbJS_install();

        load()
	})
})
