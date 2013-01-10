/**
 * Show a dialog with the usage policy of the webapp and checks if it's accepted
 * @param {Function} onaccept Callback if policy was previously accepted
 */
function policy(onaccept)
{
    // Exec 'onaccept' callback automatically if policy was accepted previously
    if(onaccept && localStorage.policy_acepted)
    {
        onaccept();
        return
    }

    // Policy was not accepted previously
    // or we are showing it (callback was not defined)
    var http_request = new XMLHttpRequest();
        http_request.open("GET", "policy.html");
        http_request.onload = function()
        {
            if(this.status == 200)
            {
                var policy = $("#dialog-policy")
                    policy.html(http_request.response)

                policy.dialog(
                {
                    modal: true,
                    resizable: false,
                    width: 800,

                    buttons:
                    {
                        Cancel: function()
                        {
                            $(this).dialog("close");

                            // Policy not acepted, remove it
                            localStorage.removeItem('policy_acepted')

                            console.warn("Policy was not accepted")
                        },
                        Accept: function()
                        {
                            $(this).dialog("close");

                            // Policy acepted, set date and exec 'onaccept'
                            localStorage.policy_acepted = (new Date()).getTime()

                            console.warn("Policy was accepted")

                            if(onaccept)
                                onaccept();
                        }
                    }
                });
            }

            else
                console.error("There was an error loading the Usage Policy")
        };
        http_request.onerror = function()
        {
            console.error("There was an error loading the Usage Policy")
        }
        http_request.send();
}