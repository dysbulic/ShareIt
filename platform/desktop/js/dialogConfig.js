function DialogConfig(dialogId, options)
{
    EventTarget.call(this)

    var dialog = $("#"+dialogId)

    dialog.dialog(options);
    dialog.tabs({active: 0})


    /**
     * Open the config dialog on the selected tab
     * @param {Number|undefined} tabIndex The index of the tab to be open. If
     * not defined, it open the first one.
     */
    this.open = function(tabIndex)
    {
        dialog.tabs("option", "active", tabIndex)
        dialog.dialog("open");
    }


    // Sharedpoints tab
    this.setHasher = function(hasher)
    {
        var self = this

        var input = dialog.find('#files')

        input.change(function(event)
        {
            var files = event.target.files

            policy(function()
            {
                hasher.hash(files)

                self.dispatchEvent({type: "sharedpoints.update"})

                // Reset the input after send the files to hash
                input.val("")
            },
            function()
            {
                // Reset the input after NOT accepting the policy
                input.val("")
            })
        });
    }


    // Backup tab
    this.setCacheBackup = function(cacheBackup)
    {
        // Export
        dialog.find("#Export").click(function()
        {
            policy(function()
            {
                cacheBackup.export(function(blob)
                {
                    if(blob)
                    {
                        var date = new Date()
                        var name = 'WebP2P-CacheBackup_'+date.toISOString()+'.zip'

                        savetodisk(blob, name)
                    }
                    else
                        alert("Cache has no files")
                },
                undefined,
                function()
                {
                    console.error("There was an error exporting the cache")
                })
            })
        })

        // Import
        var input = dialog.find('#import-backup')

        input.change(function(event)
        {
            var file = event.target.files[0]

            policy(function()
            {
                cacheBackup.import(file)

                // Reset the input after got the backup file
                input.val("")
            },
            function()
            {
                // Reset the input after NOT accepting the policy
                input.val("")
            })
        });

        dialog.find("#Import").click(function()
        {
            input.click()
        })
    }
}