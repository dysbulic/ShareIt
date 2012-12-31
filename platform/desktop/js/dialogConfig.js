function DialogConfig(dialogId, options)
{
    var dialog = $("#"+dialogId)

    dialog.dialog(options);
    dialog.tabs({active: 0})

    this.open = function(tabIndex)
    {
        dialog.tabs("option", "active", tabIndex)
        dialog.dialog("open");
    }
}