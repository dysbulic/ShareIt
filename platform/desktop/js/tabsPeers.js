function TabsPeers(tabsId)
{
    var tabs = $("#"+tabsId)

    tabs.tabs(
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
    $("#"+tabsId+" span.ui-icon-closethick").live("click", function()
    {
        var index = $("#ui-corner-top", tabs).index($(this).parent());

        // Remove the tab
        var tab = tabs.find(".ui-tabs-nav li:eq("+index+")").remove();
        // Find the id of the associated panel
        var panelId = tab.attr("aria-controls");
        // Remove the panel
        $("#"+panelId).remove();

        // Refresh the tabs widget
        tabs.tabs("refresh");
    });

    this.openOrCreate = function(uid, preferencesDialogOpen, peersManager, channel)
    {
        // Get index of the peer tab
        var index = tabs.find('table').index($('#'+tabsId+'-'+uid))

        // Peer tab exists, open it
        if(index != -1)
            tabs.tabs("option", "active", index);

        // Peer tab don't exists, create it
        else
        {
            var tabPeer = new TabPeer(uid, preferencesDialogOpen,
            function(fileentry)
            {
                return function()
                {
                    policy(function()
                    {
                        // Begin transfer of file
                        peersManager._transferbegin(fileentry)

                        // Don't buble click event
                        return false;
                    })
                }
            })

            peersManager.addEventListener("transfer.begin", function(event)
            {
                var fileentry = event.data[0]

                tabPeer.dispatchEvent({type: fileentry.hash+".begin"})
            })
            peersManager.addEventListener("transfer.update", function(event)
            {
                var fileentry = event.data[0]
                var value = event.data[1]

                tabPeer.dispatchEvent({type: fileentry.hash+".update",
                                       data: [value]})
            })
            peersManager.addEventListener("transfer.end", function(event)
            {
                var fileentry = event.data[0]

                tabPeer.dispatchEvent({type: fileentry.hash+".end"})
            })

            // Get notified when this channel files list is updated
            // and update the UI peer files table
            channel.addEventListener("fileslist._updated", function(event)
            {
                var fileslist = event.data[0]

                tabPeer.update(fileslist)
            })

            // Request the peer's files list
            channel.fileslist_query();
        }
    }
}