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
	    var msg = "<p>ShareIt! will not work "
		var icon

		if(errors)
		{
			icon = "images/smiley-sad.svg"

			msg += "on your browser because it doesn't meet the following requeriments:</p>"

	        msg += '<ul style="list-style: none;">'
			for(var key in errors)
            	msg += '<li><b>'+key+'</b>: '+errors[key]+'</li>';
	        msg += '</ul>'

	        if(warnings)
	        {
	            msg += "<p>Also, it wouldn't work optimally because the following issues:</p>"

    	        msg += '<ul style="list-style: none;">'
	            for(var key in warnings)
	            	msg += '<li><b>'+key+'</b>: '+warnings[key]+'</li>';
		        msg += '</ul>'
	        }
		}
		else if(warnings)
		{
			icon = "images/smiley-quiet.svg"

	        msg += "optimally on your browser because the following issues:</p>"

	        msg += '<ul style="list-style: none;">'
        	for(var key in warnings)
            	msg += '<li><b>'+key+'</b>: '+warnings[key]+'</li>';
	        msg += '</ul>'
		}

		function showDialog(icon, msg)
		{
            var alert = $("#dialog-compatibility")
                alert.find("#icon")[0].src = icon
                alert.find("#msg").html(msg)

            alert.dialog(
            {
                modal: true,
                resizable: false,
                width: 800,

                buttons:
                {
                    Ok: function()
                    {
                        $(this).remove()
    //                  $(this).dialog("destroy");
                    }
                }
            });
		}

		// Browser is not fully compatible, show why if compatibility changed
		if(errors || warnings)
		{
		    // Prepare an object with the warnings and the errors to be inserted
            var newCompatibility = {}
            if(errors) newCompatibility.errors = errors
            if(warnings) newCompatibility.warnings = warnings
            newCompatibility = JSON.stringify(newCompatibility)

	        console.debug(localStorage.compatibility)
	        console.debug(newCompatibility)

	        // Check if compatibility status has changed and notify to user
	        if(localStorage.compatibility != newCompatibility)
		    {
	            msg += "<p>Please upgrade to the latest version of Chrome/Chromium or Firefox.</p>"

                showDialog(icon, msg)

                localStorage.compatibility = newCompatibility
		    }
		}

		// Browser have been upgraded and now it's fully compatible
		else if(localStorage.compatibility)
		{
		    showDialog("images/smiley-happy.svg",
		               "Congratulations! Your browser is now fully compatible.")

            localStorage.removeItem('compatibility')
		}
	}
}