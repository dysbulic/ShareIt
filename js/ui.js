function oldBrowser()
{
	$('#Sharedpoints').html('Your browser is not modern enough to serve as a host. :(<br /><br />(Try Chrome or Firefox!)');
}

function ui_ready_fileschange(func)
{
	document.getElementById('files').addEventListener('change', function(event)
	{
		func(event.target.files); // FileList object
    }, false);
}

function _ui_filetype2className(filetype)
{
    filetype = filetype.split('/')

    switch(filetype[0])
    {
        case 'image':   return "image"
        case 'video':   return "video"
    }

    // Unknown file type, return generic file
    return "file"
}

function _ui_row_downloading(file)
{
    var tr = document.createElement('TR');

    var td = document.createElement('TD');
    tr.appendChild(td)

    // Name & icon
    var span = document.createElement('SPAN');
        span.className = _ui_filetype2className(file.type)
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
}

function _ui_row_sharedpoints(file)
{
    var tr = document.createElement('TR');

    var td = document.createElement('TD');
    tr.appendChild(td)

    // Name & icon
    var span = document.createElement('SPAN');
        span.className = _ui_filetype2className(file.type)
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
}

function _ui_updatefiles(area, files, row_factory, button_factory)
{
    // Remove old table and add new empty one
    while(area.firstChild)
        area.removeChild(area.firstChild);

    for(var filename in files)
        if(files.hasOwnProperty(filename))
        {
            var file = files[filename]
            var path = ""
            if(file.path)
                path = file.path + '/';

            var tr = row_factory(file, button_factory)
                tr.id = path + file.name
                if(path)
                    tr.class = "child-of-" + path

            area.appendChild(tr)
        }
}


function ui_update_fileslist_downloading(files)
{
    var area = document.getElementById('Downloading').getElementsByTagName("tbody")[0]
    _ui_updatefiles(area, files, _ui_row_downloading)
}

function ui_update_fileslist_sharedpoints(sharedpoints)
{
    var area = document.getElementById('Sharedpoints').getElementsByTagName("tbody")[0]
    _ui_updatefiles(area, sharedpoints, _ui_row_sharedpoints)
}


function UI_init()
{
    $("#tabs").tabs(
    {
        tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>",
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
    }).find(".ui-tabs-nav").sortable({axis: "x"});

    // close icon: removing the tab on click
    // note: closable tabs gonna be an option in the future - see http://dev.jqueryui.com/ticket/3924
    $("#tabs span.ui-icon-close").live("click", function()
    {
        var index = $("li", $("#tabs")).index($(this).parent());
        $("#tabs").tabs("remove", index);
    });

    $("#dialog-config").dialog(
    {
        autoOpen: false,
        resizable: false,
        width: 800,
        height: 600,
        modal: true,
//        show: "fold",
//        hide: "fold"
    });

    $("#Downloading").treeTable();
    $("#Sharing").treeTable();
    $("#Sharedpoints").treeTable();

    var menu = $("#tools-menu")
    menu.click(function()
    {
        // [Hack] Enable tabs when menu is clicked. It's necesary to find how to
        // do it only when there're downloads or sharing files
	    $("#tabs").tabs("option", "disabled", [])

        var submenu = $("#tools-menu-submenu")

        if(submenu.is(":hidden"))
        {
            var submenu_active = false;

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
                timeout(400)
            });

            menu.mouseleave(function()
            {
                submenu_active = false;
                timeout(400)
            });

            submenu.slideDown();
//            timeout(1000)
        }
        else
            submenu.slideUp();
    });
}

function _ui_row_sharing(file, button_factory)
{
    var tr = document.createElement('TR');

    var td = document.createElement('TD');
    tr.appendChild(td)

    // Name & icon
    var span = document.createElement('SPAN');
        span.className = _ui_filetype2className(file.type)
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
}


var _ui_button_peer

function UI_setPeersManager(peersManager)
{
	function _button_sharing(file)
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
	}


	_ui_button_peer = function(file)
	{
	    var div = document.createElement("DIV");
	        div.id = file.name

	    div.transfer = function()
	    {
	        var transfer = document.createElement("A");
	            transfer.onclick = function()
	            {
	                peersManager._transferbegin(file);
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
	        div.transfer()

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

                    _ui_updatefiles(tbody, fileslist, _ui_row_sharing, _ui_button_peer)
                })

                channel.fileslist_query();
            })
        }
    }

    $("#ConnectUser").unbind('click')
    $("#ConnectUser").click(ConnectUser)

    $("#ConnectUser2").unbind('click')
    $("#ConnectUser2").click(ConnectUser)

    var ui = {}

	ui.update_fileslist_sharing = function(files)
	{
	    var area = document.getElementById('Sharing').getElementsByTagName("tbody")[0]
	    _ui_updatefiles(area, files, _ui_row_sharing, _button_sharing)
	}

    return ui
}


function UI_setSignaling(signaling)
{
    // Set UID
//    signaling.removeEventListener('sessionId')
    signaling.addEventListener('sessionId', function(event)
    {
        var uid = event.data[0]

	    var span = document.getElementById("UID")

	    while(span.firstChild)
	        span.removeChild(span.firstChild);
	    span.appendChild(document.createTextNode("UID: "+uid))
    })
}