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
        signaling.onerror = function(error)
        {
            console.error(error)
        }
    })
}


// Show an alert about the compatibility issues for the webapp on the browser
function CompatibilityManager()
{
	var errors
	var warnings

	this.addError = function(component, msg)
	{
		errors = errors || {}
		errors[component] = msg
	}

	this.addWarning = function(component, msg)
	{
		warnings = warnings || {}
		warnings[component] = msg
	}

	this.show = function()
	{
		var msg = "ShareIt! will not work "

		if(errors)
		{
	        msg += "on your browser because it doesn't meet the following requeriments:\n\n"
            for(var key in errors)
            	msg += key+': '+errors[key]+'\n';

	        if(warnings)
	        {
	            msg += "\nAlso, it wouldn't work optimally because the following issues:\n\n"
	            for(var key in warnings)
	            	msg += key+': '+warnings[key]+'\n';
	        }
		}
		else if(warnings)
	        msg += "optimally on your browser because the following issues:\n\n"
            for(var key in warnings)
            	msg += key+': '+warnings[key]+'\n';

		if(errors || warnings)
		{
			msg += "\nPlease upgrade to the latest version of Chrome/Chromium or Firefox."
			alert(msg);
		}
	}
}


window.addEventListener("DOMContentLoaded", function()
//window.addEventListener("load", function()
{
	var cm = new CompatibilityManager()

	// DataChannel polyfill
    switch(DCPF_install("wss://datachannel-polyfill.nodejitsu.com"))
    {
		case "old browser":
			cm.addError("DataChannel", "Your browser doesn't support PeerConnection"+
									   " so ShareIt! can't work.")
	        break

		case "polyfill":
	        cm.addWarning("DataChannel", "Your browser doesn't support DataChannels"+
	        						  	 " natively, so file transfers performance "+
	        						  	 "would be affected or not work at all.")
    }

	// Filereader support (be able to host files from the filesystem)
	if(typeof FileReader == "undefined")
		cm.addWarning("FileReader", "Your browser doesn't support FileReader "+
									"so it can't work as a host.")

    // Check for IndexedDB support and if it store File objects
	testIDBBlobSupport(function(supported)
	{
	    if(!supported)
	    {
	    	cm.addWarning("IndexedDB", "Your browser doesn't support storing "+
	    							   "File or Blob objects. Data will not "+
	    							   "persists between each time you run the"+
	    							   " webapp.")

	       IdbJS_install();
	    }


		// Show alert if browser requeriments are not meet
	    cm.show()

		load()
	})
})