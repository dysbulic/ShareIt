function TabSharing(tableId, preferencesDialogOpen)
{
    var self = this

    var table = document.getElementById(tableId)
    this.tbody = table.getElementsByTagName("tbody")[0]


    function noFilesCaption()
    {
        // Compose no files shared content (fail-back)
        var cell = spanedCell(table)
            cell.appendChild(document.createTextNode("You are not sharing any file, "+
                                                     "please add a shared point on the "))

        var anchor = document.createElement('A')
            anchor.id = 'Preferences'
            anchor.style.cursor = 'pointer'
        cell.appendChild(anchor)

        $(anchor).click(preferencesDialogOpen)

        var span = document.createElement('SPAN')
            span.setAttribute("class", "preferences")
            span.appendChild(document.createTextNode("preferences"))
        anchor.appendChild(span)

        cell.appendChild(document.createTextNode("."))

        return cell
    }
    this.noFilesCaption = noFilesCaption()


    function rowFactory(fileentry)
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
            span.className = filetype2className(type)
            span.appendChild(document.createTextNode(fileentry.name || fileentry.file.name));
        a.appendChild(span)

        // Type
        var td = document.createElement('TD');
            td.appendChild(document.createTextNode(type || "(unknown)"));
        tr.appendChild(td)

        // Size
        var size = (fileentry.size != undefined) ? fileentry.size : fileentry.file.size
        var td = document.createElement('TD');
            td.className="filesize"
            td.appendChild(document.createTextNode(humanize.filesize(size)));
        tr.appendChild(td)

        return tr
    }

    this.updateFiles = function(fileslist)
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

                    this.tbody.appendChild(tr)
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

                    this.tbody.appendChild(tr)
                }
            }

            // Add file row
            if(prevFolder)
                sharedpoint += '__' + prevFolder

            var tr = rowFactory(fileentry)

            if(sharedpoint != undefined)
                tr.setAttribute('class', "child-of-" + sharedpoint)

            this.tbody.appendChild(tr)
        }
    }


    this.update = function(fileslist)
    {
        // Enable the tab if at least one file is being shared. This will
        // only happen the first time, others the tab will be already
        // enabled and the no files shared content will be shown
        if(fileslist.length)
        {
            $("#tabs").tabs('enable', 1)
            $("#tabs").tabs("option", "collapsible", false);
        }

        // Fill the table
        FilesTable.update.call(this, fileslist)
    }
}
TabSharing.prototype = FilesTable