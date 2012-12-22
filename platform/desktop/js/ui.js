function No_FileReader()
{
	$('#Sharedpoints').html('Your browser is not modern enough to serve as a host. :(<br /><br />(Try Chrome or Firefox!)');
}


function spanedCell(table)
// Creates a cell that span over all the columns of a table
{
    var td = document.createElement('TD');
        td.colSpan = table.getElementsByTagName("thead")[0].rows[0].cells.length
        td.align = 'center'

    return td
}


function UI(db)
{
    $("#tabs").tabs(
    {
        activate: function(event, ui)
        {
            $("#StartHere").remove()
        },

        active: false,
        collapsible: true,
        disabled: true
    })

    // close icon: removing the tab on click
    $("#tabs span.ui-icon-closethick").live("click", function()
    {
        var index = $("#ui-corner-top", $("#tabs")).index($(this).parent());

        // Remove the tab
        var tab = $("#tabs").find(".ui-tabs-nav li:eq("+index+")").remove();
        // Find the id of the associated panel
        var panelId = tab.attr("aria-controls");
        // Remove the panel
        $("#"+panelId).remove();

        // Refresh the tabs widget
        $("tabs").tabs("refresh");
    });

    var dialog_options =
    {
        autoOpen: false,
        resizable: false,
        width: 800,
        height: 600,
        modal: true,

        /* This effects would fail on Firefox */
        show: "fold",
        hide: "fold",

        buttons:
        {
            Accept: function()
            {
                $(this).dialog("close");
            }
        }
    }

    $("#dialog-about").dialog(dialog_options);
    $("#dialog-config").dialog(dialog_options);

    $("#Downloading").treeTable();
//    $("#Sharing").treeTable();
    $("#Sharedpoints").treeTable();

    // Main menu
    var submenu_active = false;

    var menu = $("#tools-menu")
    menu.mouseenter(function()
    {
        submenu_active = true;
    });

    function toolsMenu_open()
    {
        var submenu = $("#tools-menu-submenu")

        if(submenu.is(":hidden"))
        {
            function timeout(ms)
            {
                setTimeout(function()
                {
                    if(submenu_active === false)
                        submenu.slideUp();
                }, ms);
            }

            submenu.mouseenter(function()
            {
                submenu_active = true;
            });
            submenu.mouseleave(function()
            {
                submenu_active = false;
                timeout(1000)
            });

            menu.mouseleave(function()
            {
                submenu_active = false;
                timeout(1000)
            });

            submenu.slideDown();
            timeout(3000)
        }
        else
            submenu.slideUp();
    }

    menu.click(toolsMenu_open)
    $("#tools-menu2").click(toolsMenu_open)
    $("#tools-menu3").click(toolsMenu_open)

    var self = this

    this.preferencesDialogOpen = function()
    {
        // Get shared points and init them
        db.sharepoints_getAll(null, function(sharedpoints)
        {
            self.update_fileslist_sharedpoints(sharedpoints, db)
        })

        $("#dialog-config").dialog("open")
    }

    $("#Preferences").click(self.preferencesDialogOpen)
    $("#Preferences2").click(self.preferencesDialogOpen)

    function aboutDialogOpen()
    {
        $("#dialog-about").dialog("open")
    }

    $("#About").click(aboutDialogOpen)
    $("#About").click(aboutDialogOpen)
}

UI.prototype =
{
	update_fileslist_sharedpoints: function(sharedpoints, db)
	{
	    var self = this

        var table = document.getElementById('Sharedpoints')

        // Compose no files shared content (fail-back)
        var noFilesCaption = spanedCell(table)
            noFilesCaption.appendChild(document.createTextNode("There are no shared points. "))

        var anchor = document.createElement('A')
            anchor.style.cursor = 'pointer'
        noFilesCaption.appendChild(anchor)

        $(anchor).click(function()
        {
            $('#files').click()
        })

        var span = document.createElement('SPAN')
            span.setAttribute("class", "add-sharedpoint")
            span.appendChild(document.createTextNode("Please add some folders"))
        anchor.appendChild(span)

        noFilesCaption.appendChild(document.createTextNode(" to be shared."))

        // Fill the table
	    this._updatefiles(table, sharedpoints, noFilesCaption, function(fileentry)
		{
		    var tr = document.createElement('TR');

		    var td = document.createElement('TD');
		    tr.appendChild(td)

		    // Name & icon
		    var span = document.createElement('SPAN');
		        span.className = fileentry.type
		        span.appendChild(document.createTextNode(fileentry.name));
		    td.appendChild(span)

		    // Shared size
		    var td = document.createElement('TD');
		        td.className="filesize"
		        td.appendChild(document.createTextNode(humanize.filesize(fileentry.size)));
		    tr.appendChild(td)

		    var td = document.createElement('TD');
		        td.class = "end"
		    tr.appendChild(td)

		    var a = document.createElement("A");
		        a.onclick = function()
		        {
		            db.sharepoints_delete(fileentry.name, function()
		            {
		                // Update the sharedpoints without the removed one
		                db.sharepoints_getAll(null, function(sharedpoints)
		                {
		                    self.update_fileslist_sharedpoints(sharedpoints, db)
		                })
		            })
		        }
		        a.appendChild(document.createTextNode("Delete"));
		    td.appendChild(a);

		    return tr
		})
	},


    setHasher: function(hasher, db)
    {
        var self = this

        document.getElementById('files').addEventListener('change', function(event)
        {
            policy(function()
            {
                hasher.hash(event.target.files)

                // Get shared points and init them with the new ones
                db.sharepoints_getAll(null, function(sharedpoints)
                {
                    self.update_fileslist_sharedpoints(sharedpoints, db)
                })
            })

            // Reset the input
            this.value = ""
        }, false);
    },

	setSignaling: function(signaling)
	{
        var self = this

	    // Set UID on user interface
	    signaling.onopen = function(uid)
	    {
	        document.getElementById("UID").value = uid

	        // Allow to the user to search peers
	        self.signalingReady = true

            console.info("Connected to a signaling channel")
	    }
        signaling.onerror = function()
        {
            console.error("Unable to connect to a signaling channel")

            // Allow backup of cache if there are items
        }
	},

	setPeersManager: function(peersManager, db)
	{
        var self = this

    	this.update_fileslist_downloading = function(files)
    	{
            var self = this

            // Enable the tab if at least one file is being shared. This will only
    	    // happen the first time, others the tab will be already enabled and the
    	    // no files shared content will be shown
            if(files.length)
            {
                $("#tabs").tabs('enable', 0)
                $("#tabs").tabs("option", "collapsible", false);
            }

            var table = document.getElementById('Downloading')

            // Compose no files shared content (fail-back)
            var noFilesCaption = spanedCell(table)
                noFilesCaption.appendChild(document.createTextNode("There are no downloads, "))

            var anchor = document.createElement('A')
                anchor.id = 'ConnectUser'
                anchor.style.cursor = 'pointer'
            noFilesCaption.appendChild(anchor)

            $(anchor).click(self.preferencesDialogOpen)

            var span = document.createElement('SPAN')
                span.setAttribute("class", "user")
                span.appendChild(document.createTextNode("Connect to a user"))
            anchor.appendChild(span)

            noFilesCaption.appendChild(document.createTextNode(" and get one!"))

    	    // Fill the table
    	    this._updatefiles(table, files, noFilesCaption, function(fileentry)
            {
                var tr = document.createElement('TR');

                var td = document.createElement('TD');
                tr.appendChild(td)

                // Name & icon
                var span = document.createElement('SPAN');
                    span.className = self._filetype2className(fileentry.type)
                    span.appendChild(document.createTextNode(fileentry.name));
                td.appendChild(span)

                // Type
                var td = document.createElement('TD');
                    td.appendChild(document.createTextNode(fileentry.type));
                tr.appendChild(td)

                // Size
                var td = document.createElement('TD');
                    td.className="filesize"
                    td.appendChild(document.createTextNode(humanize.filesize(fileentry.size)));
                tr.appendChild(td)

                // Downloaded
                var td = document.createElement('TD');
                    td.className="filesize"
                    td.appendChild(document.createTextNode(humanize.filesize(0)));
                tr.appendChild(td)

                // Progress
                var td_progress = document.createElement('TD');
                    td_progress.appendChild(document.createTextNode("0%"));

                peersManager.addEventListener("transfer.update", function(event)
                {
                    var f = event.data[0]
                    var value = event.data[1]

                    if(fileentry.hash == f.hash)
                    {
                         var progress = document.createTextNode(Math.floor(value*100)+"%")

                         while(td_progress.firstChild)
                             td_progress.removeChild(td_progress.firstChild);
                         td_progress.appendChild(progress);
                    }
                })
                peersManager.addEventListener("transfer.end", function(event)
                {
                    var f = event.data[0]

                    if(fileentry.hash == f.hash)
                        db.files_getAll(null, function(filelist)
                        {
                            var downloading = []

                            for(var i=0, fileentry; fileentry=filelist[i]; i++)
                                if(fileentry.bitmap)
                                    downloading.push(fileentry)

                            // Update Downloading files list
                            self.update_fileslist_downloading(downloading)
                        })
                })

                tr.appendChild(td_progress)

                // Status
                var td = document.createElement('TD');
                    td.appendChild(document.createTextNode("Paused"));
                tr.appendChild(td)

                // Time remaining
                var td = document.createElement('TD');
                    td.appendChild(document.createTextNode("Unknown"));
                tr.appendChild(td)

                // Speed
                var td = document.createElement('TD');
                    td.className="filesize"
                    td.appendChild(document.createTextNode(humanize.filesize(0)+"/s"));
                tr.appendChild(td)

                // Peers
                var td = document.createElement('TD');
                    td.appendChild(document.createTextNode("0"));
                tr.appendChild(td)

                // Inclusion date
                var td = document.createElement('TD');
                    td.class = "end"
                    td.appendChild(document.createTextNode("0-0-0000"));
                tr.appendChild(td)

                return tr
            })
    	}

    	this.update_fileslist_sharing = function(files)
	    {
            // Enable the tab if at least one file is being shared. This will
            // only happen the first time, others the tab will be already
            // enabled and the no files shared content will be shown
            if(files.length)
            {
                $("#tabs").tabs('enable', 1)
                $("#tabs").tabs("option", "collapsible", false);
	        }

            var table = document.getElementById('Sharing')

            // Compose no files shared content (fail-back)
            var noFilesCaption = spanedCell(table)
                noFilesCaption.appendChild(document.createTextNode(
                                           "You are not sharing any file, "+
                                           "please add a shared point on the "))

            var anchor = document.createElement('A')
                anchor.id = 'Preferences'
                anchor.style.cursor = 'pointer'
            noFilesCaption.appendChild(anchor)

            $(anchor).click(self.preferencesDialogOpen)

            var span = document.createElement('SPAN')
                span.setAttribute("class", "preferences")
                span.appendChild(document.createTextNode("preferences"))
            anchor.appendChild(span)

            noFilesCaption.appendChild(document.createTextNode("."))

            files.sort(function(a, b)
            {
                function strcmp(str1, str2)
                {
                    return ((str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1));
                }

                var result = strcmp(a.sharedpoint, b.sharedpoint);
                if(result) return result;

                var result = strcmp(a.path, b.path);
                if(result) return result;

                var result = strcmp(a.file ? a.file.name : a.name,
                                    b.file ? b.file.name : b.name);
                if(result) return result;
            })

            // Fill the table
	        self._updatefiles_tree_sharing(table, files, noFilesCaption,
	        function(fileentry)
	        {
                var tr = document.createElement('TR');

                var td = document.createElement('TD');
                tr.appendChild(td)

                var type = (fileentry.type != undefined)? fileentry.type: fileentry.file.type

                // Name & icon
                var blob = fileentry.blob || fileentry.file || fileentry

                var a = document.createElement("A");
                    a.href = window.URL.createObjectURL(blob)
                    a.target = "_blank"
                td.appendChild(a)

                // [ToDo] ObjectURL should be destroyed somewhere...
                //window.URL.revokeObjectURL(div.firstChild.href);

                var span = document.createElement('SPAN');
                    span.className = self._filetype2className(type)
                    span.appendChild(document.createTextNode(fileentry.name || fileentry.file.name));
                a.appendChild(span)

                // Type
                var td = document.createElement('TD');
                    td.appendChild(document.createTextNode(type || "(unknown type)"));
                tr.appendChild(td)

                // Size
                var size = (fileentry.size != undefined) ? fileentry.size : fileentry.file.size
                var td = document.createElement('TD');
                    td.className="filesize"
                    td.appendChild(document.createTextNode(humanize.filesize(size)));
                tr.appendChild(td)

                return tr
		    })

            peersManager.addEventListener("transfer.end", function(event)
            {
                var f = event.data[0]

                db.files_getAll(null, function(filelist)
                {
                    var sharing = []

                    for(var i=0, fileentry; fileentry=filelist[i]; i++)
                        if(!fileentry.bitmap)
                            sharing.push(fileentry)

                    // Update Sharing files list
                    self.update_fileslist_sharing(sharing)
                })
            })
	    }

	    function ConnectUser()
	    {
	        if(!self.signalingReady)
	        {
	            alert("There's no signaling channel available, wait some more seconds")
                return 
	        }

	        var uid = prompt("UID to connect")
	        if(uid != null && uid != '')
	        {
	            function createPeerTab(channel)
	            {
	                // Add a new tab for the remote peer files list
	                $("<li>"+
	                    "<a href='#tabs-"+uid+"'>UID: "+uid+"</a>"+
	                    "<span class='ui-icon ui-icon-closethick'>Remove Tab</span>"+
	                "</li>").appendTo("#tabs .ui-tabs-nav");

                    var table = document.createElement("TABLE");
                        table.id = "tabs-"+uid
                    $(table).appendTo("#tabs");

	                $("#tabs").tabs("refresh");
	                $("#tabs").tabs("option", "active", -1);

	                var thead = document.createElement("THEAD");
	                table.appendChild(thead);

	                var tr = document.createElement("TR");
	                thead.appendChild(tr);

	                var th = document.createElement("TH");
	                    th.scope='col'
	                    th.abbr='Filename'
	                    th.width='100%'
	                    th.appendChild(document.createTextNode("Filename"))
	                tr.appendChild(th);

	                var th = document.createElement("TH");
	                    th.scope='col'
	                    th.abbr='Type'
	                    th.appendChild(document.createTextNode("Type"))
	                tr.appendChild(th);

	                var th = document.createElement("TH");
	                    th.scope='col'
	                    th.abbr='Size'
	                    th.appendChild(document.createTextNode("Size"))
	                tr.appendChild(th);

	                var th = document.createElement("TH");
	                    th.scope='col'
	                    th.abbr='Action'
	                    th.appendChild(document.createTextNode("Action"))
	                tr.appendChild(th);

	                var tbody = document.createElement("TBODY");
	                table.appendChild(tbody);

	                var tr = document.createElement("TR");
	                tbody.appendChild(tr);

	                var td = document.createElement("TD");
	                    td.colSpan = 4
	                    td.align='center'
	                    td.appendChild(document.createTextNode("Waiting for the peer data"))
	                tr.appendChild(td);


                    function noFilesCaption()
                    {
                        // Compose no files shared content (fail-back)
                        var captionCell = spanedCell(table)
                            captionCell.appendChild(document.createTextNode("Remote peer is not sharing files."))

//	                      var anchor = document.createElement('A')
//	                          anchor.id = 'ConnectUser'
//	                          anchor.style.cursor = 'pointer'
//	                      captionCell.appendChild(anchor)
//
//	                      $(anchor).click(self.preferencesDialogOpen)
//
//	                      var span = document.createElement('SPAN')
//	                          span.setAttribute("class", "user")
//	                          span.appendChild(document.createTextNode("Connect to a user"))
//	                      anchor.appendChild(span)

                        captionCell.appendChild(document.createTextNode(" Why don't ask him about doing it?"))

                        return captionCell
                    }

                    function row_peer_buttonFactory(fileentry)
                    {
                        var div = document.createElement("DIV");
                            div.id = fileentry.hash

                        div.transfer = function()
                        {
                            var transfer = document.createElement("A");
                                transfer.onclick = function()
                                {
                                    policy(function()
                                    {
                                        // Begin transfer of file
                                        peersManager._transferbegin(fileentry)

                                        // Don't buble click event
                                        return false;
                                    })
                                }
                                transfer.appendChild(document.createTextNode("Transfer"));

                            while(div.firstChild)
                                div.removeChild(div.firstChild);
                            div.appendChild(transfer);
                        }

                        div.progressbar = function(value)
                        {
                            if(value == undefined)
                               value = 0;

                            var progress = document.createTextNode(Math.floor(value*100)+"%")

                            while(div.firstChild)
                                div.removeChild(div.firstChild);
                            div.appendChild(progress);
                        }

                        div.open = function(blob)
                        {
                            var open = document.createElement("A");
                                open.href = window.URL.createObjectURL(blob)
                                open.target = "_blank"
                                open.appendChild(document.createTextNode("Open"));

                            while(div.firstChild)
                            {
                                window.URL.revokeObjectURL(div.firstChild.href);
                                div.removeChild(div.firstChild);
                            }
                            div.appendChild(open);
                        }

                        // Show if file have been downloaded previously or if we can transfer it
                        if(fileentry.bitmap)
                        {
                            var chunks = fileentry.size/chunksize;
                            if(chunks % 1 != 0)
                                chunks = Math.floor(chunks) + 1;

                            div.progressbar(fileentry.bitmap.indexes(true).length/chunks)
                        }
                        else if(fileentry.blob)
                            div.open(fileentry.blob)
                        else
                            div.transfer()

                        peersManager.addEventListener("transfer.begin", function(event)
                        {
                            var f = event.data[0]

                            if(fileentry.hash == f.hash)
                                div.progressbar()

                            // Update downloading files list
                            db.files_getAll(null, function(filelist)
                            {
                                self.update_fileslist_downloading(filelist)
                            })
                        })
                        peersManager.addEventListener("transfer.update", function(event)
                        {
                            var f = event.data[0]
                            var value = event.data[1]

                            if(fileentry.hash == f.hash)
                                div.progressbar(value)
                        })
                        peersManager.addEventListener("transfer.end", function(event)
                        {
                            var f = event.data[0]

                            if(fileentry.hash == f.hash)
                                div.open(f.blob)
                        })

                        return div
                    }

                    function row_peer(fileentry)
                    {
                        var tr = document.createElement('TR');

                        var td = document.createElement('TD');
                        tr.appendChild(td)

                        var type = (fileentry.type != undefined)? fileentry.type: fileentry.file.type

                        // Name & icon
                        var span = document.createElement('SPAN');
                            span.className = self._filetype2className(type)
                            span.appendChild(document.createTextNode(fileentry.name || fileentry.file.name));
                        td.appendChild(span)

                        // Type
                        var td = document.createElement('TD');
                            td.appendChild(document.createTextNode(type || "(unknown type)"));
                        tr.appendChild(td)

                        // Size
                        var size = (fileentry.size != undefined) ? fileentry.size : fileentry.file.size
                        var td = document.createElement('TD');
                            td.className="filesize"
                            td.appendChild(document.createTextNode(humanize.filesize(size)));
                        tr.appendChild(td)

                        // Action
                        var td = document.createElement('TD');
                            td.class = "end"
                            td.appendChild(row_peer_buttonFactory(fileentry));
                        tr.appendChild(td)

                        return tr
                    }

                    channel.addEventListener("fileslist._updated",
                    function(event)
                    {
                        var fileslist = event.data[0]

                        self._updatefiles_tree_peer(table, fileslist,
                                                    noFilesCaption(), row_peer)
                    })

                    // Request the peer's files list
	                channel.fileslist_query();
	            }

	            // Create connection with the other peer
                peersManager.connectTo(uid, function(channel)
                {
                    var tabs = $("#tabs")

                    // Get index of the peer tab
                    var index = tabs.find('table').index($('#tabs-'+uid))

                    // Peer tab exists, open it
                    if(index != -1)
                        tabs.tabs("option", "active", index);

                    // Peer tab don't exists, create it
                    else
                        createPeerTab(channel)
                },
	            function(uid, peer, channel)
	            {
	                console.error(uid, peer, channel)
	            })
	        }
	    }

	    $("#ConnectUser").unbind('click')
	    $("#ConnectUser").click(ConnectUser)

	    $("#ConnectUser2").unbind('click')
	    $("#ConnectUser2").click(ConnectUser)
	},


    _filetype2className: function(filetype)
    {
        filetype = filetype.split('/')
    
        switch(filetype[0])
        {
            case 'image':   return "image"
            case 'video':   return "video"
        }
    
        // Unknown file type, return generic file
        return "file"
    },

    _updatefiles: function(table, fileslist, noFilesCaption, row_factory)
    {
        var tbody = table.getElementsByTagName("tbody")[0]

        // Remove old table and add new empty one
        while(tbody.firstChild)
            tbody.removeChild(tbody.firstChild);

        if(fileslist.length)
        {
            for(var i=0, fileentry; fileentry=fileslist[i]; i++)
            {
                // Calc path
                var path = ""
                if(fileentry.sharedpoint)
                    path += fileentry.sharedpoint + '/';
                if(fileentry.path)
                    path += fileentry.path + '/';

                var name = ""
                if(fileentry.file)
                    name = fileentry.file.name
                else
                    name = fileentry.name

                var child = path.split('/').slice(0,-1).join('/').replace(' ','')

                // Add file row
                var tr = row_factory(fileentry)
//                    tr.id = path + name
                if(child)
                    tr.setAttribute('class', "child-of-" + child)

                tbody.appendChild(tr)
            }

            $(table).treeTable({initialState: "expanded"});
        }
        else
        {
            var tr = document.createElement('TR')
                tr.appendChild(noFilesCaption)

            tbody.appendChild(tr)
        }
    },

    _updatefiles_tree_sharing: function(table, fileslist, noFilesCaption,
                                        row_factory)
    {
        var tbody = table.getElementsByTagName("tbody")[0]

        // Remove old table and add new empty one
        while(tbody.firstChild)
            tbody.removeChild(tbody.firstChild);

        if(fileslist.length)
        {
            var prevSharedpoint = null
            var prevFolder = ""

            for(var i=0, fileentry; fileentry=fileslist[i]; i++)
            {
                // Add sharedpoint row
                var sharedpoint = fileentry.sharedpoint
                if(sharedpoint)
                    sharedpoint = sharedpoint.name.replace(' ','')

                if(prevSharedpoint != sharedpoint)
                {
                    prevSharedpoint = sharedpoint
                    prevFolder = ""

                    if(sharedpoint)
                    {
                        var tr = document.createElement('TR');
                            tr.id = sharedpoint

                        var td = document.createElement('TD');
                            td.colSpan = 2
                        tr.appendChild(td)

                        // Name & icon
                        var span = document.createElement('SPAN');
                            span.className = fileentry.sharedpoint.type
                            span.appendChild(document.createTextNode(fileentry.sharedpoint.name));
                        td.appendChild(span)

                        tbody.appendChild(tr)
                    }
                }

                // Add folder row
                if(prevSharedpoint)
                {
                    var folder = fileentry.path.replace(' ','').replace('/','__')
                    if(prevFolder != folder)
                    {
                        prevFolder = folder

                        folder = prevSharedpoint+'__'+folder

                        var tr = document.createElement('TR');
                            tr.id = folder

                        var td = document.createElement('TD');
                            td.colSpan = 2
                        tr.appendChild(td)

                        folder = folder.split('__')

                        // Name & icon
                        var span = document.createElement('SPAN');
                            span.className = 'folder'
                            span.appendChild(document.createTextNode(folder.slice(-1)));
                        td.appendChild(span)

                        folder = folder.slice(0,-1)
                        if(folder)
                            tr.setAttribute('class', "child-of-" + folder.join('__'))

                        tbody.appendChild(tr)
                    }
                }

                // Add file row
                if(prevFolder)
                    sharedpoint += '__' + prevFolder

                var tr = row_factory(fileentry)

                if(sharedpoint != undefined)
                    tr.setAttribute('class', "child-of-" + sharedpoint)

                tbody.appendChild(tr)
            }

            $(table).treeTable({initialState: "expanded"});
        }
        else
        {
            var tr = document.createElement('TR')
                tr.appendChild(noFilesCaption)

            tbody.appendChild(tr)
        }
    },

    _updatefiles_tree_peer: function(table, fileslist, noFilesCaption,
                                     row_factory)
    {
        var tbody = table.getElementsByTagName("tbody")[0]

        // Remove old table and add new empty one
        while(tbody.firstChild)
            tbody.removeChild(tbody.firstChild);

        if(fileslist.length)
        {
            var prevFolder = ""

            for(var i=0, fileentry; fileentry=fileslist[i]; i++)
            {
                // Add folder row
                var folder = fileentry.path.replace(' ','').replace('/','__')
                if(prevFolder != folder)
                {
                    prevFolder = folder

                    var tr = document.createElement('TR');
                        tr.id = folder

                    var td = document.createElement('TD');
                        td.colSpan = 2
                    tr.appendChild(td)

                    folder = folder.split('__')

                    // Name & icon
                    var span = document.createElement('SPAN');
                        span.className = 'folder'
                        span.appendChild(document.createTextNode(folder.slice(-1)));
                    td.appendChild(span)

                    folder = folder.slice(0,-1)
                    if(folder != "")
                        tr.setAttribute('class', "child-of-" + folder.join('__'))

                    tbody.appendChild(tr)
                }

                // Add file row
                var tr = row_factory(fileentry)

                if(prevFolder != undefined)
                    tr.setAttribute('class', "child-of-" + prevFolder)

                tbody.appendChild(tr)
            }

            $(table).treeTable({initialState: "expanded"});
        }
        else
        {
            var tr = document.createElement('TR')
                tr.appendChild(noFilesCaption)

            tbody.appendChild(tr)
        }
    }
}