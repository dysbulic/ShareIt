// Show an alert about the compatibility issues for the webapp on the browser
function CompatibilityManager()
{
    var errors
    var warnings

    this.addError = function(component, msg)
    {
        errors = errors || {}
        errors[component] = msg
    }

    this.addWarning = function(component, msg)
    {
        warnings = warnings || {}
        warnings[component] = msg
    }

    this.show = function()
    {
        var msg = "ShareIt! will not work "

        if(errors)
        {
            msg += "on your browser because it doesn't meet the following requeriments:\n\n"
            for(var key in errors)
                msg += key+': '+errors[key]+'\n';

            if(warnings)
            {
                msg += "\nAlso, it wouldn't work optimally because the following issues:\n\n"
                for(var key in warnings)
                    msg += key+': '+warnings[key]+'\n';
            }
        }
        else if(warnings)
            msg += "optimally on your browser because the following issues:\n\n"
            for(var key in warnings)
                msg += key+': '+warnings[key]+'\n';

        if(errors || warnings)
        {
            msg += "\nPlease upgrade to the latest version of Chrome/Chromium or Firefox."
            alert(msg);
        }
    }
}