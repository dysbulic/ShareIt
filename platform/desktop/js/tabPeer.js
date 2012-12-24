function noFilesCaption()
{
    // Compose no files shared content (fail-back)
    var captionCell = spanedCell(table)
        captionCell.appendChild(document.createTextNode("Remote peer is not sharing files."))

//    var anchor = document.createElement('A')
//        anchor.id = 'ConnectUser'
//        anchor.style.cursor = 'pointer'
//    captionCell.appendChild(anchor)
//
//    $(anchor).click(self.preferencesDialogOpen)
//
//    var span = document.createElement('SPAN')
//        span.setAttribute("class", "user")
//        span.appendChild(document.createTextNode("Connect to a user"))
//    anchor.appendChild(span)

    captionCell.appendChild(document.createTextNode(" Why don't ask him about doing it?"))

    return captionCell
}

function TabPeer(peersManager, db)
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


    function buttonFactory(fileentry)
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

    function rowFactory(fileentry)
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
            td.appendChild(buttonFactory(fileentry));
        tr.appendChild(td)

        return tr
    }

    function updatefiles(fileslist)
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
            var tr = rowFactory(fileentry)

            if(prevFolder != undefined)
                tr.setAttribute('class', "child-of-" + prevFolder)

            tbody.appendChild(tr)
        }
    }

    FilesTable.call(this, tbody, updateFiles, noFilesCaption())
}
TabPeer.prototype = new FilesTable