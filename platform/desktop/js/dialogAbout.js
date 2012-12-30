function DialogAbout(dialogId, options)
{
    var dialog = $("#"+dialogId)

    dialog.dialog(options);

    this.open()
    {
        dialog.dialog("open");
    }
}