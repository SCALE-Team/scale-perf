var body = document.getElementsByTagName("body")[0];

var topBarContainer = document.createElement("div");
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
	{
		name:	"Original",
		href:	"//stevesouders.com/mobileperf/mobileperfbkm.js"
	},
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
		href:	"http://mir.aculo.us/dom-monster/dommonster.js?" + Math.floor((+new Date)/(864e5))
	},
	{
		name:	"Display Stats",
		href:	"https://rawgit.com/mrdoob/stats.js/master/build/stats.min.js",
		onclick:	function(){
			var displayStatsInterval = setInterval(function(){
				console.log("hii :)");
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
close.innerText = "close";
close.style.position = "absolute";
close.style.width = 50;
close.style.textAlign = "right";
close.style.top = 0;
close.style.right = 0;
close.style.display = "inline-block";
close.style.padding = 5;
close.style.cursor = "pointer";
close.style.color = "#fff";
close.onclick = function(){
	body.removeChild(topBarContainer);
};
topBar.appendChild(close);

for(var f in scripts)
{
	var script = scripts[f];
	
	var link = document.createElement("a");
	link.innerText = script.name;
		link.href = 'javascript:(function(){';
			link.href += 'var jselem = document.createElement("script");';
			link.href += 'jselem.type = "text/javascript";';
			link.href += 'jselem.src = "' + script.href + '";';
			link.href += 'body.appendChild(jselem);';
		link.href += '})()';
	link.style.display = "inline-block";
	link.style.padding = 5;
	link.style.color = "#fff";
	
	if(typeof(script.onclick) != null)
	{
		link.onclick = script.onclick;
	}
	
	topBar.appendChild(link);
}