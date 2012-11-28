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

			msg += "on your browser because it doesn't meet the following requeriments:\n\n"

	        msg += '<ul>'
			for(var key in errors)
            	msg += '<li><b>'+key+'</b>: '+errors[key]+'</li>';
	        msg += '</ul>'

	        msg += '</p>'

	        if(warnings)
	        {
	            msg += "<p>Also, it wouldn't work optimally because the following issues:\n\n"

    	        msg += '<ul>'
	            for(var key in warnings)
	            	msg += '<li><b>'+key+'</b>: '+warnings[key]+'</li>';
		        msg += '</ul>'

		        msg += '</p>'
	        }
		}
		else if(warnings)
		{
			icon = "images/smiley-quiet.svg"

	        msg += "optimally on your browser because the following issues:"

	        msg += '<ul>'
        	for(var key in warnings)
            	msg += '<li><b>'+key+'</b>: '+warnings[key]+'</li>';
	        msg += '</ul>'

	        msg += '</p>'
		}

		if(errors || warnings)
		{
			msg += "<p>Please upgrade to the latest version of Chrome/Chromium or Firefox.</p>"

			var alert = $("#dialog-compatibility")
				alert.find("#icon")[0].src = icon
				alert.find("#msg").html(msg)

			alert.dialog({
	            modal: true,
	            resizable: false,
	            width: 800,

	            buttons:
	            {
	                Ok: function()
	                {
	                    $(this).remove()
//	                    $(this).dialog("destroy");
	                }
	            }
	        });
		}
	}
}