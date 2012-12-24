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
                    {
                        var tablePeer = new TabPeer(peersManager, db)

                        // Get notified when this channel files list is updated
                        // and update the UI peer files table
                        channel.addEventListener("fileslist._updated",
                        function(event)
                        {
                            var fileslist = event.data[0]

                            tablePeer.update(fileslist)
                        })

                        // Request the peer's files list
                        channel.fileslist_query();
                    }
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
    }
}