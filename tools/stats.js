/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function (performanceApi, toolContainer) {
	/* SCALE performance tool IO functions */
		this.destructor = function() {
			window.clearInterval(interval);
		};
	
	var height = 70;
	var padding = 3;
	var width = 200;
	//var bars = window.innerWidth;
	var bars = width;
	
	// performance of this is really bad
	//var bars = Math.max(screen.availWidth, screen.availHeight); // height cause of mobile screens that can be turned
	
	var startTime = Date.now(), prevTime = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var fps = 0, fpsMin = Infinity, fpsMax = 0;
	var frames = 0, mode = 0;
	
	var container = document.createElement( 'div' );
	container.id = 'stats';
	container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ) }, false );
	container.style.cursor = "pointer";
	container.style.opacity = "0.9";
	container.style.width = width + "px";
	container.style.position = "relative";
	container.style.left = "50%";
	container.style["margin-left"] = -Math.round(width / 2) + "px";
	toolContainer.appendChild(container);
	
	var fpsDiv = document.createElement( 'div' );
	fpsDiv.id = 'fps';
	fpsDiv.style.backgroundColor = "#002";
	fpsDiv.style.textAlign = "left";
	fpsDiv.style.padding = "0px 0px 3px 3px";
	container.appendChild( fpsDiv );
	
	var fpsMinLine = document.createElement( 'div' );
	fpsMinLine.style.position = 'absolute';
	fpsMinLine.style.height = '16px';
	fpsMinLine.style.bottom = (30 + padding - 16) + 'px';
	fpsMinLine.style.left = fpsMinLine.style.right = '3px';
	fpsMinLine.style["z-index"] = '10';
	fpsMinLine.style["border-top"] = '1px solid red';
	fpsMinLine.style.lineHeight = '15px';
	fpsMinLine.style.fontWeight = 'bold';
	fpsMinLine.style.fontSize = '9px';
	fpsMinLine.style.fontFamily = "Helvetica,Arial,sans-serif";
	fpsMinLine.style.color = "red";
	fpsMinLine.innerHTML = '30 FPS';
	fpsDiv.appendChild( fpsMinLine );
	
	var fpsMaxLine = document.createElement( 'div' );
	fpsMaxLine.style.position = 'absolute';
	fpsMaxLine.style.height = '16px';
	fpsMaxLine.style.bottom = (60 + padding - 16) + 'px';
	fpsMaxLine.style.left = fpsMaxLine.style.right = '3px';
	fpsMaxLine.style["z-index"] = '10';
	fpsMaxLine.style["border-top"] = '1px solid green';
	fpsMaxLine.style.lineHeight = '15px';
	fpsMaxLine.style.fontWeight = 'bold';
	fpsMaxLine.style.fontSize = '9px';
	fpsMaxLine.style.fontFamily = "Helvetica,Arial,sans-serif";
	fpsMaxLine.style.color = "green";
	fpsMaxLine.innerHTML = '60 FPS';
	fpsDiv.appendChild( fpsMaxLine );
	
	var fpsText = document.createElement( 'div' );
	fpsText.id = 'fpsText';
	fpsText.style.lineHeight = '15px';
	fpsText.style.fontWeight = 'bold';
	fpsText.style.fontSize = '12px';
	fpsText.style.fontFamily = "Helvetica,Arial,sans-serif";
	fpsText.style.color = "#0ff";
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild( fpsText );
	
	fpsDiv.style.height = (fpsText.offsetHeight + height + padding) + "px";
	
	var fpsGraph = document.createElement( 'div' );
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.backgroundColor = '#0ff';
	fpsGraph.style.position = 'absolute';
	fpsGraph.style.left = fpsGraph.style.right = '3px';
	fpsGraph.style.overflow = 'hidden';
	fpsGraph.style["white-space"] = 'nowrap';
	fpsGraph.style.height = height + "px";
	fpsDiv.appendChild( fpsGraph );

	while ( fpsGraph.children.length < bars ) {

		var barContainer = document.createElement( 'div' );
		barContainer.style.cssFloat = 'right';
		barContainer.style.width = '1px';
		barContainer.style.height = height + "px";
		fpsGraph.appendChild( barContainer );
		
		var bar = document.createElement( 'div' );
		bar.style.backgroundColor = '#113';
		bar.style.width = '1px';
		bar.style.height = height + "px";
		barContainer.appendChild( bar );

	}

	var msDiv = document.createElement( 'div' );
	msDiv.id = 'ms';
	msDiv.style.backgroundColor = "#020";
	msDiv.style.display = 'none';
	msDiv.style.textAlign = 'left';
	msDiv.style.padding = '0px 0px 3px 3px';
	container.appendChild( msDiv );
	
	var msMinLine = document.createElement( 'div' );
	msMinLine.style.position = 'absolute';
	msMinLine.style.height = '16px';
	msMinLine.style.bottom = (padding + 33 - 16) + 'px';
	msMinLine.style.left = msMinLine.style.right = '3px';
	msMinLine.style["z-index"] = '10';
	msMinLine.style["border-top"] = '1px solid red';
	msMinLine.style.lineHeight = '15px';
	msMinLine.style.fontWeight = 'bold';
	msMinLine.style.fontSize = '9px';
	msMinLine.style.fontFamily = "Helvetica,Arial,sans-serif";
	msMinLine.style.color = "red";
	msMinLine.innerHTML = '30 FPS';
	msDiv.appendChild( msMinLine );
	
	var msMaxLine = document.createElement( 'div' );
	msMaxLine.style.position = 'absolute';
	msMaxLine.style.height = '16px';
	msMaxLine.style.bottom = (padding + 16 - 16) + 'px';
	msMaxLine.style.left = msMaxLine.style.right = '3px';
	msMaxLine.style["z-index"] = '10';
	msMaxLine.style["border-top"] = '1px solid green';
	msMaxLine.style.lineHeight = '15px';
	msMaxLine.style.fontWeight = 'bold';
	msMaxLine.style.fontSize = '9px';
	msMaxLine.style.fontFamily = "Helvetica,Arial,sans-serif";
	msMaxLine.style.color = "green";
	msMaxLine.innerHTML = '60 FPS';
	msDiv.appendChild( msMaxLine );

	var msText = document.createElement( 'div' );
	msText.id = 'msText';
	msText.style.lineHeight = '15px';
	msText.style.color = '#0f0';
	msText.style.fontFamily = 'Helvetica,Arial,sans-serif';
	msText.style.fontSize = "12px";
	msText.style.fontWeight = 'bold';
	msText.innerHTML = 'MS';
	msDiv.appendChild( msText );
	
	msDiv.style.height = (fpsText.offsetHeight + height + padding) + "px";

	var msGraph = document.createElement( 'div' );
	msGraph.id = 'msGraph';
	msGraph.style.position = 'absolute';
	msGraph.style.left = msGraph.style.right = '3px';
	msGraph.style.overflow = 'hidden';
	msGraph.style["white-space"] = 'nowrap';
	msGraph.style.backgroundColor = '#0f0';
	msGraph.style.height = height + "px";
	msDiv.appendChild( msGraph );

	while ( msGraph.children.length < bars ) {

		var barContainer = document.createElement( 'div' );
		barContainer.style.cssFloat = 'right';
		barContainer.style.width = '1px';
		barContainer.style.height = height + "px";
		msGraph.appendChild( barContainer );
		
		var bar = document.createElement( 'div' );
		bar.style.backgroundColor = '#131';
		bar.style.width = '1px';
		bar.style.height = height + "px";
		barContainer.appendChild( bar );

	}

	var setMode = function(value) {
		mode = value;

		switch ( mode ) {

			case 0:
				fpsDiv.style.display = 'block';
				msDiv.style.display = 'none';
				break;
			case 1:
				fpsDiv.style.display = 'none';
				msDiv.style.display = 'block';
				break;
		}
	};

	var updateGraph = function ( dom, value ) {
		// Move the element on the very left to the very right
		var barContainer = dom.insertBefore( dom.lastChild, dom.firstChild );
		
		// update the height of this bar
		barContainer.firstChild.style.height = value + 'px';
	};
	
	var interval = window.setInterval(function(){ update(); }, 1000/60);
	
	var end = function () {
		var time = Date.now();
		
		ms = time - startTime;
		msMin = Math.min( msMin, ms );
		msMax = Math.max( msMax, ms );

		msText.textContent = ms + ' ms (min ' + msMin + ', max ' + msMax + ')';
		//var msBarHeight = Math.min( height, height - ( ms / 200 ) * height );
		var msBarHeight = height - ms;
		updateGraph( msGraph, msBarHeight );
		
		// Increment the frames counter by one
		frames++;
		
		// Only update if the new update is at least one second from the last update
		if(time > prevTime + 1000)
		{
			/* The frames counter may not be exact enough cause the last measurement
			was maybe more than one second ago. So better calculate it */
			fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
			
			// Determine new FPS min and max values
			fpsMin = Math.min( fpsMin, fps );
			fpsMax = Math.max( fpsMax, fps );
			
			// Set new text
			fpsText.textContent = fps + ' FPS (min ' + fpsMin + ', max ' + fpsMax + ')';
			
			// draw the graph bar
			//var fsBarHeight = Math.min( height, height - ( fps / 100 ) * height );
			var fsBarHeight = height - fps;
			updateGraph( fpsGraph, fsBarHeight );
			
			// Remember current time
			prevTime = time;
			
			// Reset farmes counter
			frames = 0;
		}

		return time;

	};
	
	var update = function () {
		startTime = end();
	};
};

if(typeof module === 'object') {

	module.exports = Stats;

}