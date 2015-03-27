var body = document.getElementsByTagName("body")[0];

var style = document.createElement("style");
style.innerText = "#PerfBar { z-index: 999999; color: #fff; position: fixed; top: 0; left: 0; width: 100%; background-color: #000; box-shadow: 0px 0px 5px #000; }";
style.innerText += "#PerfBar > div { padding-right: 50px; }";
style.innerText += "#PerfBar > div a { display: inline-block; cursor: pointer; text-decoration: none !important; color: #fff !important; display: inline-block; padding: 5px; }";
style.innerText += "#PerfBar > div a:hover { background-color: red !important; }";
style.innerText += "#PerfBar .perfCloseSeparator { display: none; }";
style.innerText += "@media (max-width: 768px) {";
	style.innerText += "#PerfBar { height: auto !important; }";
	style.innerText += "#PerfBar >div { padding: 0px; }";
	style.innerText += "#PerfBar > div a { width:	100%; }";
	style.innerText += "#PerfBar .perfSeparator { display: none; }";
	style.innerText += "#PerfBar .perfClose { display: block; width: 100% !important; text-align: left !important; position: static !important; }";
	style.innerText += "#PerfBar .perfCloseSeparator { display: block; }";
style.innerText += "}";
style.innerText += "#PerfBar .perfClose { position: absolute; width: 50px; text-align: right; top: 0px; right: 0px; }";
body.appendChild(style);

var topBarContainer = document.createElement("div");
topBarContainer.id = "PerfBar";

/*
topBarContainer.style.height = 28;
var oldBodyPaddingTop = body.offsetTop * 1.0;
body.style.paddingTop = oldBodyPaddingTop + topBarContainer.style.height;
//*/

body.appendChild(topBarContainer);

var topBar = document.createElement("div");
topBarContainer.appendChild(topBar);

var scripts = [
	/*
	{
		name:	"Original",
		href:	"//stevesouders.com/mobileperf/mobileperfbkm.js"
	},
	//*/
	{
		name:	"Performance Bookmarklet",
		href:	"https://micmro.github.io/performance-bookmarklet/dist/performanceBookmarklet.min.js"
	},
	{
		name:	"Waterfall",
		href:	"https://andydavies.github.io/waterfall/bookmarklet/waterfall.js"
	},
	{
		name:	"Perf Map",
		href:	"https://zeman.github.io/perfmap/perfmap.js"
	},
	{
		name:	"DOM Monster",
		href:	"https://mir.aculo.us/dom-monster/dommonster.js"
	},
	{
		name:	"Display Stats",
		href:	"https://rawgit.com/mrdoob/stats.js/master/build/stats.min.js",
		onclick:	function(){
			var displayStatsInterval = setInterval(function(){
				if(typeof Stats == "function")
				{
					clearInterval(displayStatsInterval);
					
					var stats = new Stats();
					stats.domElement.style.position = "fixed";
					stats.domElement.style.left = "0px";
					stats.domElement.style.top = "0px";
					stats.domElement.style.zIndex = "10000";
					document.body.appendChild(stats.domElement);
					
					setInterval(function(){ stats.update(); }, 1000/60);
				}
			}, 100);
		}
	},
];

var maxIndex = (scripts.length - 1);

for(var i in scripts)
{
	var script = scripts[i];
	
	var link = document.createElement("a");
	link.innerText = script.name;
	link.href = 'javascript:(function(){';
		link.href += 'var jselem = document.createElement("script");';
		link.href += 'jselem.type = "text/javascript";';
		link.href += 'jselem.src = "' + script.href + '?' + Math.floor((+new Date)/(864e5)) + '";';
		link.href += 'body.appendChild(jselem);';
	link.href += '})()';
	
	link.onclick = function(){
		topBarContainer.style.display = "none";
		
		if(typeof(script.onclick) != null)
		{
			script.onclick();
		}
	};
	
	topBar.appendChild(link);
	
	if(i < maxIndex)
	{
		var separatorElem = document.createElement("span");
		separatorElem.className = "perfSeparator";
		separatorElem.innerHTML = "&middot;";
		topBar.appendChild(separatorElem);
	}
}

var separatorElem = document.createElement("hr");
separatorElem.className = "perfCloseSeparator";
topBar.appendChild(separatorElem);

// Add close button
var close = document.createElement("a");
close.className = "perfClose";
close.innerText = "close";
close.onclick = function(){
	//body.style.paddingTop = oldBodyPaddingTop;
	topBarContainer.style.display = "none";
};
topBar.appendChild(close);