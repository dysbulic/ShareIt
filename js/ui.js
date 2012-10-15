function No_FileReader()
{
	$('#Sharedpoints').html('Your browser is not modern enough to serve as a host. :(<br /><br />(Try Chrome or Firefox!)');
}

function UI(db)
{
    $("#tabs").tabs(
    {
        tabTemplate: "<li><a href='#{href}'>#{label}</a><span class='ui-icon ui-icon-closethick'>Remove Tab</span></li>",
        add: function(event, ui)
        {
            $("#tabs").tabs('select', '#' + ui.panel.id);
        },
        show: function(event, ui)
        {
            $("#StartHere").remove()
        },
        disabled: [0, 1],
        selected: -1
    })

    // close icon: removing the tab on click
    // note: closable tabs gonna be an option in the future - see http://dev.jqueryui.com/ticket/3924
    $("#tabs span.ui-icon-closethick").live("click", function()
    {
        var index = $("#ui-corner-top", $("#tabs")).index($(this).parent());
        $("#tabs").tabs("remove", index);
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
        hide: "fold"
    }

    $("#dialog-about").dialog(dialog_options);
    $("#dialog-config").dialog(dialog_options);

    $("#Downloading").treeTable();
    $("#Sharing").treeTable();
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
        // [Hack] Enable tabs when menu is clicked. It's necesary to find how to
        // do it only when there're downloads or sharing files
        $("#tabs").tabs("option", "disabled", [])

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

    function dialogOpen()
    {
        // Get shared points and init them
        db.sharepoints_getAll(null, function(sharedpoints)
        {
            self.update_fileslist_sharedpoints(sharedpoints)
        })

        $("#dialog-config").dialog("open")
    }

    $("#Preferences").click(dialogOpen)
    $("#Preferences2").click(dialogOpen)

    $("#About").click(function()
    {
        $("#dialog-about").dialog("open")
    })
}

UI.prototype =
{
	update_fileslist_downloading: function(files)
	{
	    var area = document.getElementById('Downloading').getElementsByTagName("tbody")[0]
	    this._updatefiles(area, files, function(file)
        {
            var tr = document.createElement('TR');

            var td = document.createElement('TD');
            tr.appendChild(td)

            // Name & icon
            var span = document.createElement('SPAN');
                span.className = this._filetype2className(file.type)
                span.appendChild(document.createTextNode(file.name));
            td.appendChild(span)

            // Type
            var td = document.createElement('TD');
                td.appendChild(document.createTextNode(file.type));
            tr.appendChild(td)

            // Downloaded
            var td = document.createElement('TD');
                td.className="filesize"
                td.appendChild(document.createTextNode(humanize.filesize(0)));
            tr.appendChild(td)

            // Size
            var td = document.createElement('TD');
                td.className="filesize"
                td.appendChild(document.createTextNode(humanize.filesize(file.size)));
            tr.appendChild(td)

            // Percentage
            var td = document.createElement('TD');
                td.appendChild(document.createTextNode("0%"));
            tr.appendChild(td)

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
	},

	update_fileslist_sharedpoints: function(sharedpoints)
	{
	    var self = this

	    var area = document.getElementById('Sharedpoints').getElementsByTagName("tbody")[0]
	    this._updatefiles(area, sharedpoints, function(file)
		{
		    var tr = document.createElement('TR');

		    var td = document.createElement('TD');
		    tr.appendChild(td)

		    // Name & icon
		    var span = document.createElement('SPAN');
		        span.className = self._filetype2className(file.type)
		        span.appendChild(document.createTextNode(file.name));
		    td.appendChild(span)

		    // Shared size
		    var td = document.createElement('TD');
		        td.className="filesize"
		        td.appendChild(document.createTextNode(humanize.filesize(0)));
		    tr.appendChild(td)

		    var td = document.createElement('TD');
		        td.class = "end"
		    tr.appendChild(td)

		    var a = document.createElement("A");
		//        a.onclick = function()
		//        {
		//        }
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
            hasher.hash(event.target.files)

	        // Get shared points and init them with the new ones
	        db.sharepoints_getAll(null, function(sharedpoints)
	        {
	            self.update_fileslist_sharedpoints(sharedpoints)
	        })
        }, false);
    },

	setSignaling: function(signaling)
	{
	    // Set UID
	//    signaling.removeEventListener('sessionId')
	    signaling.addEventListener('sessionId', function(event)
	    {
	        document.getElementById("UID").value = event.data[0]
	    })
	},

	setPeersManager: function(peersManager)
	{
        var self = this

	    this.update_fileslist_sharing = function(files)
	    {
	        var area = document.getElementById('Sharing').getElementsByTagName("tbody")[0]
	        self._updatefiles(area, files, function(fileentry)
	        {
	            return self._row_sharing(fileentry.file, function(file)
		        {
		            var div = document.createElement("DIV");
		                div.id = file.name

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
		            if(file.bitmap)
		            {
		                var chunks = file.size/chunksize;
		                if(chunks % 1 != 0)
		                    chunks = Math.floor(chunks) + 1;

		                var value = chunks - file.bitmap.length

		                div.progressbar(value/chunks)
		            }
		            else if(file.blob)
		                div.open(file.blob)
		            else
		                div.open(file)

		            peersManager.addEventListener("transfer.begin", function(event)
		            {
		                var f = event.data[0]

		                if(file.name == f.name)
		                    div.progressbar()
		            })
		            peersManager.addEventListener("transfer.update", function(event)
		            {
		                var f = event.data[0]
		                var value = event.data[1]

		                if(file.name == f.name)
		                    div.progressbar(value)
		            })
		            peersManager.addEventListener("transfer.end", function(event)
		            {
		                var f = event.data[0]

		                if(file.name == f.name)
		                    div.open(f.blob)
		            })

		            return div
		        })
		    })
	    }

	    function ConnectUser()
	    {
	        var uid = prompt("UID to connect")
	        if(uid != null && uid != '')
	        {
	            // Create connection with the other peer
	            peersManager.connectTo(uid, function(channel)
	            {
	                $("#tabs").tabs("add", "#tabs-"+uid, "UID: "+uid);

	                var tab = document.getElementById("tabs-"+uid)

	                var table = document.createElement("TABLE");
	                    table.id = 'Peer'
	                tab.appendChild(table);

	                var thead = document.createElement("THEAD");
	                table.appendChild(thead);

	                var tr = document.createElement("TR");
	                thead.appendChild(tr);

	                var th = document.createElement("TH");
	                    th.scope='col'
	                    th.abbr='Filename'
	                    th.class='nobg'
	                    th.width='100%'
	                    th.appendChild(document.createTextNode("Filename"))
	                tr.appendChild(th);

	                var th = document.createElement("TH");
	                    th.scope='col'
	                    th.abbr='Type'
	                    th.class='nobg'
	                    th.appendChild(document.createTextNode("Type"))
	                tr.appendChild(th);

	                var th = document.createElement("TH");
	                    th.scope='col'
	                    th.abbr='Size'
	                    th.class='nobg'
	                    th.appendChild(document.createTextNode("Size"))
	                tr.appendChild(th);

	                var th = document.createElement("TH");
	                    th.scope='col'
	                    th.abbr='Action'
	                    th.class='nobg'
	                    th.appendChild(document.createTextNode("Action"))
	                tr.appendChild(th);

	                var tbody = document.createElement("TBODY");
	                table.appendChild(tbody);

	                var tr = document.createElement("TR");
	                tbody.appendChild(tr);

	                var td = document.createElement("TD");
	                    td.colspan='4'
	                    td.align='center'
	                    td.appendChild(document.createTextNode("Waiting for the peer data"))
	                tr.appendChild(td);


	                channel.addEventListener("fileslist.send.filtered",
	                function(event)
	                {
	                    var fileslist = event.data[0]

	                    self._updatefiles(tbody, fileslist, function(fileentry)
	                    {
	                        return self._row_sharing(fileentry, function()
	                        {
	                            var div = document.createElement("DIV");
	                                div.id = fileentry.name

	                            div.transfer = function()
	                            {
	                                var transfer = document.createElement("A");
	                                    transfer.onclick = function()
	                                    {
	                                        peersManager._transferbegin(fileentry)
	                                        return false;
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

	                                var value = chunks - fileentry.bitmap.length

	                                div.progressbar(value/chunks)
	                            }
	                            else if(fileentry.blob)
	                                div.open(fileentry.blob)
	                            else
	                                div.transfer()

	                            peersManager.addEventListener("transfer.begin", function(event)
	                            {
	                                var f = event.data[0]

	                                if(fileentry.name == f.name)
	                                    div.progressbar()
	                            })
	                            peersManager.addEventListener("transfer.update", function(event)
	                            {
	                                var f = event.data[0]
	                                var value = event.data[1]

	                                if(fileentry.name == f.name)
	                                    div.progressbar(value)
	                            })
	                            peersManager.addEventListener("transfer.end", function(event)
	                            {
	                                var f = event.data[0]

	                                if(fileentry.name == f.name)
	                                    div.open(f.blob)
	                            })

	                            return div
	                        })
	                    })
	                })

	                channel.fileslist_query();
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

	_row_sharing: function(file, button_factory)
	{
	    var tr = document.createElement('TR');

	    var td = document.createElement('TD');
	    tr.appendChild(td)

	    // Name & icon
	    var span = document.createElement('SPAN');
	        span.className = this._filetype2className(file.type)
	        span.appendChild(document.createTextNode(file.name));
	    td.appendChild(span)

	    // Type
	    var td = document.createElement('TD');
	        td.appendChild(document.createTextNode(file.type));
	    tr.appendChild(td)

	    // Size
	    var td = document.createElement('TD');
	        td.className="filesize"
	        td.appendChild(document.createTextNode(humanize.filesize(file.size)));
	    tr.appendChild(td)

	    // Action
	    var td = document.createElement('TD');
	        td.class = "end"
	        td.appendChild(button_factory(file));
	    tr.appendChild(td)

	    return tr
	},

    _updatefiles: function(area, fileslist, row_factory)
    {
        // Remove old table and add new empty one
        while(area.firstChild)
            area.removeChild(area.firstChild);

        for(var i=0, fileentry; fileentry=fileslist[i]; i++)
        {
            var path = ""
            if(fileentry.path)
                path = fileentry.path + '/';

            var tr = row_factory(fileentry)
                tr.id = path + fileentry.name
                if(path)
                    tr.class = "child-of-" + path

            area.appendChild(tr)
        }
    }
}