var ToolTemplate = function() {
	/* Here in the constructor you initialize your whole class
	and append your tools elements to the display */
	
	return {
		// The id of the element that contains all tool elements
		containerId:			"jr_results",
		
		// Determines whether the website should be moved down to offer a space for the tool
		shouldMovePageContent:	true,
		
		// will be executed after the tool got loaded
		onload: function() {},
		
		/* This is the destructor, implement it!
		It should remove:
		- the container for your tool
		- further elements you appended to the website
		- style tags you added to the document
		- visual styles you appended to elements on the website
		*/
		onclose: function() {}
	};
};