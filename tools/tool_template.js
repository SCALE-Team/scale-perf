var ToolTemplate = function(conf) {
	// This is the container you can put your tool contents to
	this.container = conf.container;
	
	// If you want to sue the performance API of the browser, please use this instead
	this.performanceApi = conf.performanceApi;
	
	/* Here in the constructor you initialize your whole class
	and append your tools elements to the display */
	
	return {
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