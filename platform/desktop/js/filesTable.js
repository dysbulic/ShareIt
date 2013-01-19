function filetype2className(filetype)
{
    filetype = filetype.split('/')

    switch(filetype[0])
    {
        case 'image': return "image"
        case 'video': return "video"
    }

    // Unknown file type, return generic file
    return "file"
}

function spanedCell(table)
//Creates a cell that span over all the columns of a table
{
 var td = document.createElement('TD');
     td.colSpan = table.getElementsByTagName("thead")[0].rows[0].cells.length
     td.align = 'center'

 return td
}

function classEscape(text)
{
    return text.replace(/ /g,'_').replace(/\//g,'__')
}


var FilesTable =
{
    update: function(fileslist)
    {
        // Remove old table and add new empty one
        while(this.tbody.firstChild)
            this.tbody.removeChild(this.tbody.firstChild);

        if(fileslist.length)
        {
            fileslist.sort(function(a, b)
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

            this.updateFiles(fileslist)

            $(this.tbody.parentNode).treeTable({initialState: "expanded"});
        }
        else
        {
            var tr = document.createElement('TR')
                tr.appendChild(this.noFilesCaption)

            this.tbody.appendChild(tr)
        }
    }
}