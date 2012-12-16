function load()
{
    // Init database
    DB_init(function(db)
    {
        // Init user interface
        var ui = new UI(db)

        // Init PeersManager
        var peersManager = new PeersManager(db)

        function update_sharing_files(fileentry)
        {
            // Update sharing files tab
            db.files_getAll(null, function(files)
            {
                ui.update_fileslist_sharing(files)
            })

            // Update fileentry sharedpoint size
            db.sharepoints_get(fileentry.sharedpoint.name,
            function(sharedpoint)
            {
                // Increase sharedpoint shared size
                sharedpoint.size += fileentry.file.size
                db.sharepoints_put(sharedpoint, function()
                {
                    // Update sharedpoints list
                    db.sharepoints_getAll(null, function(sharepoints)
                    {
                        ui.update_fileslist_sharedpoints(sharepoints, db)
                    })
                })
            })
        }

        // Init hasher
        var hasher = new Hasher(db, policy)
            hasher.onhashed  = function(fileentry)
            {
                // Notify the other peers about the new hashed file
                peersManager._send_file_added(fileentry)

                update_sharing_files(fileentry)
            }
            hasher.ondeleted = function(fileentry)
            {
                // Notify the other peers about the deleted file
                peersManager._send_file_deleted(fileentry)

                // File have been removed, so we set file size as negative
                fileentry.file.size *= -1

                update_sharing_files(fileentry)
            }

        ui.setHasher(hasher, db)

        ui.setPeersManager(peersManager, db)

        // Show files being shared on Sharing tab
        db.files_getAll(null, function(filelist)
        {
            ui.update_fileslist_sharing(filelist)
        })

        var signaling = new SignalingManager('../../json/signaling.json')

        peersManager.setSignaling(signaling)
        ui.setSignaling(signaling)

        signaling.onoffer = function(uid, sdp)
        {
            // Search the peer between the list of currently connected peers
            var pc = peersManager.getPeer(uid)

            // Peer is not connected, create a new channel
            if(!pc)
                pc = peersManager.createPeer(uid);

            // Process offer
            pc.setRemoteDescription(new RTCSessionDescription({sdp:  sdp,
                                                               type: 'offer'}));

            // Send answer
            pc.createAnswer(function(answer)
            {
                signaling.sendAnswer(uid, answer.sdp)

                pc.setLocalDescription(new RTCSessionDescription({sdp:  answer.sdp,
                                                                  type: 'answer'}))
            });
        }

        signaling.onanswer = function(uid, sdp)
        {
            // Search the peer on the list of currently connected peers
            var pc = peersManager.getPeer(uid)
            if(pc)
                pc.setRemoteDescription(new RTCSessionDescription({sdp:  sdp,
                                                                   type: 'answer'}))
            else
                console.error("[signaling.answer] PeerConnection '" + uid +
                              "' not found");
        }

//        signaling.onopen = function()
//        {
//            // Restart downloads
//            db.files_getAll(null, function(filelist)
//            {
    //            if(filelist.length)
        //            policy(function()
        //            {
        //                for(var i=0, fileentry; fileentry=filelist[i]; i++)
        //                    if(fileentry.bitmap)
        //                        peersManager.transfer_query(fileentry)
        //            })
//            })
//        }
    })
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

	    // Start loading the webapp
		load()
	})
})
