function FilesTable(tbody, updateFiles, noFilesCaption)
{
    this.update = function(fileslist)
    {
        // Remove old table and add new empty one
        while(tbody.firstChild)
            tbody.removeChild(tbody.firstChild);

        if(fileslist.length)
            updateFiles(updateFiles)
        else
        {
            var tr = document.createElement('TR')
                tr.appendChild(noFilesCaption)

            tbody.appendChild(tr)
        }
    }
}