function DialogConfig(dialogId, options)
{
    var dialog = $("#"+dialogId)

    dialog.dialog(options);
    dialog.tabs({active: 0})

    this.open(tabIndex)
    {
        dialog.tabs("option", "active", tabIndex)
        dialog.dialog("open");
    }
}