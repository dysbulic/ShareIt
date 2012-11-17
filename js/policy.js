// Show a dialog with the usage policy of the webapp and checks if it's accepted
function policy(onaccept)
{
    // Exec 'onaccept' callback automatically if policy was accepted previously
    if(onaccept && false)
    {
        onaccept();
        return
    }

    // Policy was not accepted previously
    // or we are showing it (callback was not defined)
    $("#dialog-policy").dialog(
    {
        modal: true,
        resizable: false,
        width: 800,

        buttons:
        {
            Cancel: function()
            {
                $(this).dialog("close");
            },
            Accept: function()
            {
                $(this).dialog("close");

                if(onaccept)
                    onaccept();
            }
        }
    });
}