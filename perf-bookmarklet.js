var body = document.getElementsByTagName("body")[0];

var style = document.createElement("style");
style.innerText = "#PerfBar > div a { display: inline-block; cursor: pointer; text-decoration: none !important; color: #fff !important; display: inline-block; padding: 5px; }";
style.innerText += "#PerfBar > div a:hover { background-color: red !important; }";
style.innerText += "#PerfBar .perfClose { position: absolute; width: 50; text-align: right; top: 0; right: 0; }";
body.appendChild(style);

var topBarContainer = document.createElement("div");
topBarContainer.id = "PerfBar";
topBarContainer.style.color = "#fff";
topBarContainer.style.position = "absolute";
topBarContainer.style.top = 0;
topBarContainer.style.left = 0;
topBarContainer.style.width = "100%";
topBarContainer.style.backgroundColor = "#000";
topBarContainer.style.boxShadow = "0 0 5px #000";
body.appendChild(topBarContainer);

var topBar = document.createElement("div");
topBar.style.paddingRight = 50;
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

var close = document.createElement("a");
close.className = "perfClose";
close.innerText = "close";
close.onclick = function(){
	body.removeChild(topBarContainer);
};
topBar.appendChild(close);

var maxIndex = (scripts.length - 1);

for(var f in scripts)
{
	var script = scripts[f];
	
	var link = document.createElement("a");
	link.innerText = script.name;
	link.href = 'javascript:(function(){';
		link.href += 'var jselem = document.createElement("script");';
		link.href += 'jselem.type = "text/javascript";';
		link.href += 'jselem.src = "' + script.href + '?' + Math.floor((+new Date)/(864e5)) + '";';
		link.href += 'body.appendChild(jselem);';
	link.href += '})()';
	
	if(typeof(script.onclick) != null)
	{
		link.onclick = script.onclick;
	}
	
	topBar.appendChild(link);
	
	if(f < maxIndex)
	{
		var separatorElem = document.createElement("span");
		separatorElem.innerHTML = "&middot;";
		topBar.appendChild(separatorElem);
	}
}