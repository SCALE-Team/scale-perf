var DomMonster = function() {
	return {
		/* SCALE performance tool IO functions */
			// The id of the element that contains all tool elements
			containerId:			"jr_results",
			
			// Determines whether the website should be moved down to offer a space for the tool
			shouldMovePageContent:	true,
			
			// will be executed after the tool got loaded
			onload: function() {},
			
			// This is the destructor, implement it!
			onclose: function() {}
	};
};