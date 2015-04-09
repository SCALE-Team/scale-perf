/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {
	var height = 60;
	var width = 160;
	var bars = width - 6;
	
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

	var fpsDiv = document.createElement( 'div' );
	fpsDiv.id = 'fps';
	fpsDiv.style.backgroundColor = "#002";
	fpsDiv.style.textAlign = "left";
	fpsDiv.style.padding = "0px 0px 3px 3px";
	container.appendChild( fpsDiv );

	var fpsText = document.createElement( 'div' );
	fpsText.id = 'fpsText';
	fpsText.style.lineHeight = '15px';
	fpsText.style.fontWeight = 'bold';
	fpsText.style.fontSize = '9px';
	fpsText.style.fontFamily = "Helvetica,Arial,sans-serif";
	fpsText.style.color = "#0ff";
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild( fpsText );

	var fpsGraph = document.createElement( 'div' );
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.backgroundColor = '#0ff';
	fpsGraph.style.position = 'relative';
	fpsGraph.style.width = bars + "px";
	fpsGraph.style.height = height + "px";
	fpsDiv.appendChild( fpsGraph );

	while ( fpsGraph.children.length < bars ) {

		var bar = document.createElement( 'span' );
		bar.style.cssFloat = 'left';
		bar.style.backgroundColor = '#113';
		bar.style.width = '1px';
		bar.style.height = height + "px";
		fpsGraph.appendChild( bar );

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

	var msGraph = document.createElement( 'div' );
	msGraph.id = 'msGraph';
	msGraph.style.position = 'relative';
	msGraph.style.backgroundColor = '#0f0';
	msGraph.style.width = bars + "px";
	msGraph.style.height = height + "px";
	msDiv.appendChild( msGraph );

	while ( msGraph.children.length < bars ) {

		var bar = document.createElement( 'span' );
		bar.style.width = "1px";
		bar.style.cssFloat = 'left';
		bar.style.backgroundColor = '#131';
		bar.style.height = height + "px";
		msGraph.appendChild( bar );

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

		var child = dom.appendChild( dom.firstChild );
		child.style.height = value + 'px';

	};

	return {
		/* SCALE performance tool IO functions */
			containerId:		"stats",
			isContainerFixed:	true,
			onload: function() {
				var stats = this;
				stats.domElement.style.position = "fixed";
				stats.domElement.style.left = "0px";
				stats.domElement.style.visibility = "hidden";
				stats.domElement.style.zIndex = "10000";
				
				var body = document.getElementsByTagName("body")[0];
				body.appendChild(stats.domElement);
				
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