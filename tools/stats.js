/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {
	var height = 60;
	var padding = 3;
	var bars = screen.availWidth;
	
	var startTime = Date.now(), prevTime = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var fps = 0, fpsMin = Infinity, fpsMax = 0;
	var frames = 0, mode = 0;

	var container = document.createElement( 'div' );
	container.id = 'stats';
	container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ) }, false );
	container.style.cursor = "pointer";
	container.style.opacity = "0.9";
	container.style.width = "100%";
	
	var fpsDiv = document.createElement( 'div' );
	fpsDiv.id = 'fps';
	fpsDiv.style.backgroundColor = "#002";
	fpsDiv.style.textAlign = "left";
	fpsDiv.style.padding = "0px 0px 3px 3px";
	container.appendChild( fpsDiv );
	
	var body = document.getElementsByTagName("body")[0];
	body.appendChild(container);

	var fpsText = document.createElement( 'div' );
	fpsText.id = 'fpsText';
	fpsText.style.lineHeight = '15px';
	fpsText.style.fontWeight = 'bold';
	fpsText.style.fontSize = '9px';
	fpsText.style.fontFamily = "Helvetica,Arial,sans-serif";
	fpsText.style.color = "#0ff";
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild( fpsText );
	
	fpsDiv.style.height = fpsText.offsetHeight + height + padding;

	var fpsGraph = document.createElement( 'div' );
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.backgroundColor = '#0ff';
	fpsGraph.style.position = 'absolute';
	fpsGraph.style.left = fpsGraph.style.right = '3px';
	fpsGraph.style.overflow = 'hidden';
	fpsGraph.style["white-space"] = 'nowrap';
	//fpsGraph.style.width = bars + "px";
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

	var msText = document.createElement( 'div' );
	msText.id = 'msText';
	msText.style.lineHeight = '15px';
	msText.style.color = '#0f0';
	msText.style.fontFamily = 'Helvetica,Arial,sans-serif';
	msText.style.fontSize = "9px";
	msText.style.fontWeight = 'bold';
	msText.innerHTML = 'MS';
	msDiv.appendChild( msText );
	
	msDiv.style.height = fpsText.offsetHeight + height + padding;

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

	var setMode = function ( value ) {

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

	return {
		/* SCALE performance tool IO functions */
			containerId:			container.id,
			shouldMovePageContent:	true,
			onload: function() {
				var stats = this;
				stats.domElement.style.position = "fixed";
				stats.domElement.style.left = "0px";
				stats.domElement.style.visibility = "hidden";
				stats.domElement.style.zIndex = "10000";
				
				stats.interval = window.setInterval(function(){ stats.update(); }, 1000/60);
			},
			onclose: function() {
				this.domElement.parentNode.removeChild(this.domElement);
				
				window.clearInterval(this.interval);
			},
		
		REVISION: 12,

		domElement: container,

		setMode: setMode,

		begin: function () {

			startTime = Date.now();

		},

		end: function () {

			var time = Date.now();

			ms = time - startTime;
			msMin = Math.min( msMin, ms );
			msMax = Math.max( msMax, ms );

			msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
			updateGraph( msGraph, Math.min( 30, 30 - ( ms / 200 ) * 30 ) );

			frames ++;

			if ( time > prevTime + 1000 ) {

				fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
				fpsMin = Math.min( fpsMin, fps );
				fpsMax = Math.max( fpsMax, fps );

				fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
				updateGraph( fpsGraph, Math.min( 30, 30 - ( fps / 100 ) * 30 ) );

				prevTime = time;
				frames = 0;

			}

			return time;

		},

		update: function () {

			startTime = this.end();

		}

	}

};

if ( typeof module === 'object' ) {

	module.exports = Stats;

}