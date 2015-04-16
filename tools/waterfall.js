function Waterfall(conf) {
	// Check for Navigation Timing and Resource Timing APIs
	if(window.performance == null || (window.performance.getEntriesByType == null && window.performance.webkitGetEntriesByType == null))
	{
		alert("Resource Timing API not supported");
		return;
	}
	
	conf = conf||{};
	
	// Remember configs
	this.getPageLoadTime = conf.getPageLoadTime;
	
	// look for erros
	if(typeof(this.getPageLoadTime) != "function")
	{
		alert("Waterfall.js: config.getPageLoadTime must be set in constructor!");
		return;
	}
	
	// do preparations
	this.convertBarColorsToMap();
	
	// add all CSS styles
	this.addStyles();
	
	// get timings
	var timings = this.getTimings();
	
	// display all
	this.drawWaterfall(timings);
};

Waterfall.prototype = {
	chartContainer:		null,
	toolContainer:		null,
	
	/* SCALE performance tool IO functions */
		containerId: 			"PerfWaterfallDiv",
		shouldMovePageContent:	true,
		onclose: function() {
			var waterfall = document.getElementById(this.containerId);
			if(waterfall != null) waterfall.parentNode.removeChild(waterfall);
			
			this.cssElem.parentNode.removeChild(this.cssElem);
		},
	
	barColors: [
		{
			text:	"blocked",
			color:	"rgb(204, 204, 204)",
			showInLegend:	false
		},
		{
			text:	"thirdParty",
			isDark:	true,
			color:	"rgb(  0,   0,   0)",
			showInLegend:	false
		},
		{
			text:	"redirect",
			color:	"rgb(255, 221,   0)",
			showInLegend:	false
		},
		{
			text:	"appCache",
			isDark:	true,
			color:	"rgb(161, 103,  38)",
			showInLegend:	false
		},
		{
			text:	"dns",
			isDark:	true,
			color:	"rgb( 48, 150, 158)",
			showInLegend:	false
		},
		{
			text:	"tcp",
			color:	"rgb(255, 157,  66)",
			showInLegend:	false
		},
		{
			text:	"ssl",
			isDark:	true,
			color:	"rgb(213, 102, 223)",
			showInLegend:	false
		},
		{
			text:	"request",
			color:	"rgb( 64, 255,  64)",
			showInLegend:	false
		},
		{
			text:	"response",
			isDark:	true,
			color:	"rgb( 52, 150, 255)",
			showInLegend:	false
		}
	],
	
	barColorsMap: {},
	
	convertBarColorsToMap: function() {
		for(var f in this.barColors)
		{
			var barColor = this.barColors[f];
			
			this.barColorsMap[barColor.text] = barColor;
		}
	},
	
	buildLegend: function() {
		var legendId = "WaterfallLegend";
		var eventLegendId = "WaterfallEventLegend";
		
		var existingLegend = document.getElementById(legendId);
		if(existingLegend != null) existingLegend.parentNode.removeChild(existingLegend);
		existingLegend = document.getElementById(eventLegendId);
		if(existingLegend != null) existingLegend.parentNode.removeChild(existingLegend);
		
		// Resource legend
		var legend = document.createElement("div");
		legend.id = legendId;
		this.toolContainer.appendChild(legend);
		
		for(var f in this.barColors)
		{
			var barColor = this.barColors[f];
			
			if(!barColor.showInLegend) continue;
			
			var captionElem = document.createElement("div");
			captionElem.innerHTML = barColor.text;
			captionElem.style.background = barColor.color;
			legend.appendChild(captionElem);
			
			if(barColor.isDark) captionElem.className = "dark";
		}
		
		// Event legend
		var eventLegend = document.createElement("div");
		eventLegend.id = eventLegendId;
		this.toolContainer.appendChild(eventLegend);
		
		var mainEvents = this.getMainPageEvents();
		for(var f in mainEvents)
		{
			var event = mainEvents[f];
			
			var captionElem = document.createElement("div");
			captionElem.innerHTML = event.name;
			captionElem.style.backgroundColor = event.fill;
			captionElem.style.borderColor = event.line;
			eventLegend.appendChild(captionElem);
		}
	},
	
	addStyles: function() {
		var head = document.head || document.getElementsByTagName('head')[0];

		this.cssElem = document.createElement("style");
		this.cssElem.id = "ScaleWaterfallStyle";
		var style = "#" + this.containerId + " { background: #fff; border-bottom: 2px solid #000; margin: 5px; position: absolute; visibility: hidden; left: 0px; z-index: 99999; margin: 0px; padding: 5px 0px 10px 0px; }";
		style += "#" + this.containerId + " input, #" + this.containerId + " button { outline: none; border-radius: 5px; padding: 5px; border: 1px solid #ccc; }";
		style += "#" + this.containerId + " button { background-color: #ddd; padding: 5px 10px; }";
		style += "#" + this.containerId + " .timeSpanInput { width: 70px; }";
		
		style += "#" + this.containerId + " .filterContainer { height: 40px; position: relative; }";
		
		style += "#" + this.containerId + " .filterContainer > div:first-child { position: absolute; left: 0px; top: 0px; right: 200px; padding:5px; }";
		style += "#" + this.containerId + " .filterContainer > div:last-child { position: absolute; right: 0px; width: 450px; top: 0px; text-align: right; padding:5px; }";
		
		style += "#" + this.containerId + " .filterContainer > div:last-child > :first-child { display: inline-block; }";
		style += "#" + this.containerId + " .filterContainer > div:last-child > :first-child input { width: 100%; }";
		
		style += "@media (max-width: 768px) {";
			style += "#" + this.containerId + " .filterContainer { height: auto; }";
			style += "#" + this.containerId + " .filterContainer > div { position: relative !important; width:100% !important; top: 0px !important; right: 0px !important; left: 0px !important; display: block !important; text-align: left !important; }";
			style += "#" + this.containerId + " .filterContainer > div:last-child > :first-child { position: absolute; left: 0px; top: 0px; right: 240px; }";
			style += "#" + this.containerId + " .filterContainer > div:last-child > :last-child { position: absolute; right: 0px; top: 0px; width: 240px; text-align: right; }";
			
			style += "#" + this.containerId + " .chart_svg .hideMobile { display: none; }";
		style += "}";
		
		style += "#" + this.containerId + " #ChartContainer { position: relative; }";
		style += "#" + this.containerId + " #ChartContainer rect { fill: transparent; stroke-width: 1px; }";
		style += "#" + this.containerId + " #ChartContainer rect:hover { stroke: #000; }";
		style += "#" + this.containerId + " .chart_svg { position: absolute; top: 0px; left: 200px; right: 5px; }";
		
		//style += "#" + this.containerId + " .svg_labels { z-index: 10; position: absolute; top: 0px; left: 0px; overflow: visible; }";
		//style += "#" + this.containerId + " .svg_labels text { background:red; }";
		
		style += "#" + this.containerId + " .button-group { display: inline-block; }";
		style += "#" + this.containerId + " .button-group button { border-radius: 0px 0px 0px 0px; border-right: none; cursor: pointer; }";
		style += "#" + this.containerId + " .button-group button:hover { background-color: #eee; }";
		style += "#" + this.containerId + " .button-group button:active { background-color: #ccc; }";
		style += "#" + this.containerId + " .button-group button[disabled] { background-color: #ccc !important; cursor: default; }";
		style += "#" + this.containerId + " .button-group :first-child { border-radius: 5px 0px 0px 5px; }";
		style += "#" + this.containerId + " .button-group :last-child { border-radius: 0px 5px 5px 0px; border-right: 1px solid #ccc; }";
		
		style += "#" + this.containerId + " #WaterfallLegend, #WaterfallEventLegend { float:left; display: inline-block; }";
		style += "#" + this.containerId + " #WaterfallEventLegend { float: right; }";
		style += "#" + this.containerId + " #WaterfallLegend > div, #WaterfallEventLegend > div { display: inline-block; padding: 3px; border-radius: 3px; margin: 10px 3px 0px; }";
		style += "#" + this.containerId + " #WaterfallEventLegend > div { border-radius:0px; border: 2px solid transparent; border-top: 0px; border-bottom: 0px; margin: 10px 3px 0px; }";
		style += "#" + this.containerId + " #WaterfallLegend > div.dark { color: #fff; }";
		
		this.cssElem.innerHTML = style;
		head.appendChild(this.cssElem);
	},
	
	/**
	 * Draw waterfall
	 * @param {object[]} entries
	 */
	drawWaterfall: function(entries) {
		var superClass = this;
		
		superClass.toolContainer = document.getElementById(superClass.containerId);
		
		// If container doesn't exist yet, create it
		if (superClass.toolContainer === null) {
			superClass.toolContainer = document.createElement('div');
			superClass.toolContainer.id = superClass.containerId;
		}
		
		document.body.appendChild(superClass.toolContainer);
		
		/* Filters */ {
			var filterContainer = document.createElement("div");
			filterContainer.className = "filterContainer";
			filterContainer.style.padding = "5px";
			superClass.toolContainer.appendChild(filterContainer);
			
			var leftContainer = document.createElement("div");
			filterContainer.appendChild(leftContainer);
			
			var rightContainer = document.createElement("div");
			filterContainer.appendChild(rightContainer);
			
			var span = document.createElement("span");
			span.innerHTML = "Show from ";
			
			var timeSpanFromInput = document.createElement("input");
			timeSpanFromInput.className = "timeSpanInput";
			timeSpanFromInput.id = "timeSpanFromInput";
			timeSpanFromInput.type = "number";
			span.appendChild(timeSpanFromInput);
			
			span.innerHTML += " ms until ";
			
			var timeSpanUntilInput = document.createElement("input");
			timeSpanUntilInput.className = "timeSpanInput";
			timeSpanUntilInput.id = "timeSpanUntilInput";
			timeSpanUntilInput.type = "number";
			timeSpanUntilInput.timeout = null;
			span.appendChild(timeSpanUntilInput);
			
			span.innerHTML += " ms";
			
			leftContainer.appendChild(span);
			
			// Has to be appended with small delay. Element has to exist on screen
			window.setTimeout(function(){
				var timeSpanUntilInput = document.getElementById("timeSpanUntilInput");
				timeSpanUntilInput.value = superClass.chartContainer.data.timeSpanUntil;
				
				var timeSpanFromInput = document.getElementById("timeSpanFromInput");
				timeSpanFromInput.value = 0;
				
				var change = function(e, isFrom){
					if(isFrom)
					{
						superClass.chartContainer.data.timeSpanFrom = e.target.value.trim() * 1.0;
					}
					else
					{
						superClass.chartContainer.data.timeSpanUntil = e.target.value.trim() * 1.0;
					}
					
					if(e.target.timeout != null)
					{
						window.clearTimeout(e.target.timeout);
					}
					
					var isEnter = (e.keyCode == 13);
					
					if(isEnter)
					{
						superClass.drawAllBars(entries);
					}
					else
					{
						e.target.timeout = window.setTimeout(function(){
							superClass.drawAllBars(entries);
						}, 50);
					}
				};
				
				timeSpanFromInput.addEventListener("change", function(e){change(e, true)}, true);
				timeSpanFromInput.addEventListener("keyup", function(e){change(e, true)}, true);
				timeSpanUntilInput.addEventListener("change", function(e){change(e, false)}, true);
				timeSpanUntilInput.addEventListener("keyup", function(e){change(e, false)}, true);
			}, 500);
			
			var searchFieldContainer = document.createElement("div");
			var searchField = document.createElement("input");
			searchField.id = "PerfSearchField";
			searchField.placeholder = "Search for...";
			searchField.timeout = null;
			//searchFieldContainer.innerHTML+='<input onkeydown=\'alert("123")\' />';
			searchFieldContainer.appendChild(searchField);
			rightContainer.appendChild(searchFieldContainer);
			
			// Has to be appended with small delay. Element has to exist on screen
			window.setTimeout(function(){
				var searchField = document.getElementById("PerfSearchField");
				
				searchField.addEventListener("keyup", function(e){
					superClass.chartContainer.data.searchText = e.target.value.trim().toLowerCase();
					
					if(e.target.timeout != null)
					{
						window.clearTimeout(e.target.timeout);
					}
					
					var isEnter = (e.keyCode == 13);
					
					if(isEnter)
					{
						superClass.drawAllBars(entries);
					}
					else
					{
						e.target.timeout = window.setTimeout(function(){
							superClass.drawAllBars(entries);
						}, 50);
					}
				},true);
			}, 500);
			
			rightContainer.innerHTML += "&nbsp;";
			
			/* Button Group */ {
				var filterByType = function(elem) {
					var btn = elem.target;
					
					var childs = btn.parentNode.children;
					for(var i=0; i<childs.length; i++)
					{
						childs[i].disabled = false;
					}
					
					btn.disabled = true;
					
					
					superClass.chartContainer.data.allowed = (btn.data!=null ? btn.data.allowed : null);
					superClass.chartContainer.data.notAllowed = (btn.data!=null ? btn.data.notAllowed : null);
					superClass.chartContainer.data.allowedInitiatorType = (btn.data!=null ? btn.data.allowedInitiatorType : null);
					superClass.chartContainer.data.notAllowedInitiatorType = (btn.data!=null ? btn.data.notAllowedInitiatorType : null);
					
					superClass.drawAllBars(entries);
				};
				
				var buttonGroup = document.createElement("div");
				buttonGroup.className = "button-group";
				
				var allBtn = document.createElement("button");
				allBtn.innerHTML = "All";
				allBtn.disabled = true;
				allBtn.onclick = filterByType;
				buttonGroup.appendChild(allBtn);
				
				var jsBtn = document.createElement("button");
				jsBtn.innerHTML = "JS";
				jsBtn.data = {
					allowed:				[ "js" ],
					allowedInitiatorType:	[ "script" ]
				};
				jsBtn.onclick = filterByType;
				buttonGroup.appendChild(jsBtn);
				
				var cssBtn = document.createElement("button");
				cssBtn.innerHTML = "CSS";
				cssBtn.data = {
					allowed: 				[ "css" ],
					allowedInitiatorType:	[ "link" ]
				};
				cssBtn.onclick = filterByType;
				buttonGroup.appendChild(cssBtn);
				
				var imgBtn = document.createElement("button");
				imgBtn.innerHTML = "Images";
				imgBtn.data = {
					allowed:				[ "png", "jpg", "jpeg", "gif", "bmp", "svg", "tif" ],
					allowedInitiatorType:	[ "img", "css" ]
				};
				imgBtn.onclick = filterByType;
				buttonGroup.appendChild(imgBtn);
				
				var elseBtn = document.createElement("button");
				elseBtn.innerHTML = "Else";
				elseBtn.data = {
					notAllowed:					jsBtn.data.allowed.concat(cssBtn.data.allowed).concat(imgBtn.data.allowed),
					notAllowedInitiatorType:	jsBtn.data.allowedInitiatorType.concat(cssBtn.data.allowedInitiatorType).concat(imgBtn.data.allowedInitiatorType)
				};
				elseBtn.onclick = filterByType;
				buttonGroup.appendChild(elseBtn);
				
				rightContainer.appendChild(buttonGroup);
			}
		}
		
		superClass.chartContainer = document.createElement("div");
		superClass.chartContainer.id = "ChartContainer";
		superClass.chartContainer.data = {
			allowed:		[],
			nowAllowed:		[],
			searchText:		"",
			timeSpanUntil:	superClass.getPageLoadTime(entries)
		};
		superClass.toolContainer.appendChild(superClass.chartContainer);
		
		superClass.drawAllBars(entries);
	},
	
	// Function to draw all the waterfall bars
	drawAllBars: function(entries) {
		/* Prepare some attributes */ {
			// Height of the bars
			var rowHeight = 20;
			
			// space between the bars
			var rowPadding = 2;
			
			// The width of the labels
			var barOffset = 200;
			
			// Get the entries to show
			var entriesToShow = this.filterEntries(entries);
			//var entriesToShow = entries;
			
			// Find the latest time
			var minTime = this.chartContainer.data.timeSpanFrom || 0;
			var maxTime = this.chartContainer.data.timeSpanUntil || 0;
			var timeSpan = maxTime - minTime;
			
			//calculate size of chart
			// - max time
			// - number of entries
			var height = (entriesToShow.length + 1) * (rowHeight + rowPadding); // +1 for axis
			
			this.toolContainer.style.width = "100%";
			
			this.chartContainer.style.width = "100%";
			this.chartContainer.style.height = height;
			
			var svgLabels = this.svg.createSVG(barOffset, height);
			var svgChart = this.svg.createSVG("100%", height);
		}
		
		// draw x-axis
		if(maxTime != 0)
		{
			// Size of one interval in ms
			var numberOfLines = 10;
			var intervalSize = timeSpan / (numberOfLines - 1);
			
			// %-space between the seconds on the x-axis
			var interval = (100 * intervalSize) / timeSpan; // original: 1 / (maxTime / intervalSize) * 100
			
			// coordinates for the seconds-lines
			var x1_percentage = 0,
				y1 = rowHeight + rowPadding,
				y2 = height;

			for(var i = 0; i < numberOfLines; i++)
			{
				// Determine the anchor for the line labels to be always visible
				var anchor = "middle";
				if(i == 0) anchor = "start";
				else if(i == (numberOfLines - 1)) anchor = "end";
				
				// Determine the format of the time depending on the time span
				var timeMs = minTime + i * intervalSize;
				
				if(maxTime < 1000) var text = Math.round(timeMs) + "ms";
				else if(maxTime < 10000) var text = (Math.round(timeMs / 100) / 10.0) + "s";
				else if(maxTime < 100000) var text = Math.round(timeMs / 1000) + "s";
				else var text = Math.round(timeMs / 10000) * 10 + "s";
				
				var text = this.svg.createSVGText(x1_percentage + "%", 0, 0, rowHeight - 5, "font: 10px sans-serif;", anchor, text);
				var line = this.svg.createSVGLine(x1_percentage + "%", y1, x1_percentage + "%", y2, "stroke: #ccc;");
				
				// hide odd lines on small screens
				var hideMobileFlag = (i%2 == 1 ? " hideMobile" : "");
				text.setAttribute("class", hideMobileFlag);
				line.setAttribute("class", hideMobileFlag);
				
				svgChart.appendChild(text);
				svgChart.appendChild(line);
				x1_percentage += interval;
			}
		}
			
		// draw main page events
			var mainEvents = this.getMainPageEvents();
			for(var f in mainEvents)
			{
				var event = mainEvents[f];
				
				// time or timeStart line
				var startX = this.toPercentage((event.timeStart||event.time) - minTime, timeSpan);
				var lineStart = this.svg.createSVGLine(startX, y1, startX, y2, "stroke-width: 2px; stroke: " + event.line + ";");
				
				if(event.timeEnd != null)
				{
					var endX = this.toPercentage(event.timeEnd - minTime, timeSpan);
					var lineEnd = this.svg.createSVGLine(endX, y1, endX, y2, "stroke-width: 2px; stroke: " + event.line + ";");
					
					var duration = event.timeEnd - event.timeStart;
					var rectX = this.toPercentage(duration, timeSpan);
					var rectY2 = y2 - y1;
					var rectEnd = this.svg.createSVGRect(startX, y1, rectX, rectY2, "fill: " + event.fill + ";");
					rectEnd.appendChild(this.buildDurationTitle(duration, event.name));
					
					svgChart.appendChild(rectEnd);
					svgChart.appendChild(lineEnd);
				}
				
				// Do it after the time end line, else the rect will overlap half of the line
				svgChart.appendChild(lineStart);
			}
			
		// draw resource entries
		var n = 0;
		for(var i = 0; i < entriesToShow.length; i++)
		{
			var entry = entriesToShow[i]; 
			
			var isDisplayed = true;
			if(entry.start > this.chartContainer.data.timeSpanUntil) isDisplayed = false;
			else if((entry.start + entry.duration) < this.chartContainer.data.timeSpanFrom) isDisplayed = false;
			
			var dy = 13;
			
			/* Label of the row */ {
				//var background = this.svg.createSVGRect(0, 0, 300, rowHeight);
				//rowLabel.appendChild(background);
				
				var rowLabel = this.svg.createSVGGroup("translate(0," + (n + 1) * (rowHeight + rowPadding) + ")");
				var style = "font: 10px sans-serif;";
				if(!isDisplayed) style += "fill:#ddd;";
				rowLabel.appendChild(this.svg.createSVGText(5, 0, 0, dy, style, "start", this.shortenURL(entry.url), entry.url));
				svgLabels.appendChild(rowLabel);
			}
			
			/* The chart */ {
				var rowChart = this.svg.createSVGGroup("translate(0," + (n + 1) * (rowHeight + rowPadding) + ")");
				rowChart.appendChild(this.drawBar(entry, 0, rowHeight, minTime, maxTime));
				svgChart.appendChild(rowChart);
			}
			
			/* The time */ {
				var latestTime = (entry.start + entry.duration);
				
				// Check if the distance to the right border is big enough to fit the text
				var distToRightBorder = (maxTime - latestTime) / maxTime * 260;	// 260px is the width of the chart on mobile device
				if(distToRightBorder > 30)
				{
					var dx = "5px";
					var anchor = "start";
				}
				else
				{
					var dx = "-5px";
					var anchor = "end";
				}
				
				var positionX = this.toPercentage((latestTime - minTime), timeSpan);
				
				rowChart.appendChild(this.svg.createSVGText(positionX, 0, dx, dy, "font: 10px sans-serif;", anchor, Math.round(entry.duration) + "ms", ""));
			}
			
			n++;
		}
		
		/* Append the chart to page */ {
			var div = document.createElement("div");
			div.className = "chart_svg";
			div.appendChild(svgChart);
			
			this.chartContainer.appendChild(svgLabels);
			this.chartContainer.appendChild(div);
			
			this.buildLegend();
		}
	},
	
	// Calculates the percentage relation of part to max
	toPercentage: function(part, max) {
		var p = Math.round(part / max * 10000) / 100.0;
		
		return p + "%";
	},
	
	buildDurationTitle: function(duration, label) {
		duration = Math.round(duration * 10) / 10.0;
		
		var title = document.createElementNS(this.svg.xmlns, "title");
		title.innerHTML = duration + "ms";
		
		if(label != null) title.innerHTML = label + ": " + title.innerHTML;
		
		return title;
	},
	
	/**
	 * Draw bar for resource 
	 * @param {object} entry Details of URL, and timings for individual resource
	 * @param {int} barOffset Offset of the start of the bar along  x axis
	 * @param {int} rowHeight 
	 * @param {double} the latest point of time of all bars
	 */
	drawBar: function(entry, barOffset, rowHeight, minTime, maxTime) {
		var bar = this.svg.createSVGGroup();
		var span = maxTime - minTime;
		
		var start = entry.start - minTime;
		var rect = this.svg.createSVGRect(this.toPercentage(start, span), 0, this.toPercentage(entry.duration, span), rowHeight, "fill:" + this.barColorsMap.blocked.color);
		rect.appendChild(this.buildDurationTitle(entry.duration));
		bar.appendChild(rect);
			
		this.barColorsMap.blocked.showInLegend = true;
		
		if(entry.redirectDuration > 0) {
			var redirectStart = entry.redirectStart - minTime;
			var rect = this.svg.createSVGRect(this.toPercentage(redirectStart, span), 0, this.toPercentage(entry.redirectDuration, span), rowHeight, "fill:" + this.barColorsMap.redirect.color);
			rect.appendChild(this.buildDurationTitle(entry.redirectDuration, "redirect"));
			bar.appendChild(rect);
			
			this.barColorsMap.redirect.showInLegend = true;
		}

		if(entry.appCacheDuration > 0) {
			var appCacheStart = entry.appCacheStart - minTime;
			var rect = this.svg.createSVGRect(this.toPercentage(appCacheStart, span), 0, this.toPercentage(entry.appCacheDuration, span) , rowHeight, "fill:" + this.barColorsMap.appCache.color);
			rect.appendChild(this.buildDurationTitle(entry.appCacheDuration, "cache"));
			bar.appendChild(rect);
			
			this.barColorsMap.appCache.showInLegend = true;
		}

		if(entry.dnsDuration > 0) {
			var dnsStart = entry.dnsStart - minTime;
			var rect = this.svg.createSVGRect(this.toPercentage(dnsStart, span) , 0, this.toPercentage(entry.dnsDuration, span), rowHeight, "fill:" + this.barColorsMap.dns.color);
			bar.appendChild(rect);
			rect.appendChild(this.buildDurationTitle(entry.dnsDuration, "dns"));
			
			this.barColorsMap.dns.showInLegend = true;
		}

		if(entry.tcpDuration > 0) {
			var tcpStart = entry.tcpStart - minTime;
			var rect = this.svg.createSVGRect(this.toPercentage(tcpStart, span) , 0, this.toPercentage(entry.tcpDuration, span), rowHeight, "fill:" + this.barColorsMap.tcp.color);
			rect.appendChild(this.buildDurationTitle(entry.tcpDuration, "tcp"));
			bar.appendChild(rect);
			
			this.barColorsMap.tcp.showInLegend = true;
		}

		if(entry.sslDuration > 0) {
			var sslStart = entry.sslStart - minTime;
			var rect = this.svg.createSVGRect(this.toPercentage(sslStart, span) , 0, this.toPercentage(entry.sslDuration, span), rowHeight, "fill:" + this.barColorsMap.ssl.color);
			rect.appendChild(this.buildDurationTitle(entry.sslDuration, "ssl"));
			bar.appendChild(rect);
			
			this.barColorsMap.ssl.showInLegend = true;
		}

		if(entry.requestDuration > 0) {
			var requestStart = entry.requestStart - minTime;
			var rect = this.svg.createSVGRect(this.toPercentage(requestStart, span) , 0, this.toPercentage(entry.requestDuration, span), rowHeight, "fill:" + this.barColorsMap.request.color);
			rect.appendChild(this.buildDurationTitle(entry.requestDuration, "request"));
			bar.appendChild(rect);
			
			this.barColorsMap.request.showInLegend = true;
		}

		if(entry.responseDuration > 0) {
			var responseStart = entry.responseStart - minTime;
			var rect = this.svg.createSVGRect(this.toPercentage(responseStart, span) , 0, this.toPercentage(entry.responseDuration, span), rowHeight, "fill:" + this.barColorsMap.response.color);
			rect.appendChild(this.buildDurationTitle(entry.responseDuration, "response"));
			bar.appendChild(rect);
			
			this.barColorsMap.response.showInLegend = true;
		}

		return bar;
	},
	
	filterEntries: function(entries) {
		//this.chartContainer = document.getElementById("ChartContainer");
		this.chartContainer.innerHTML = "";
		
		var notAllowedInitiatorType = this.chartContainer.data.notAllowedInitiatorType;
		var allowedInitiatorType = this.chartContainer.data.allowedInitiatorType;
		var allowed = this.chartContainer.data.allowed;
		var notAllowed = this.chartContainer.data.notAllowed;
		var searchText = this.chartContainer.data.searchText;
		var timeSpanUntil = this.chartContainer.data.timeSpanUntil;
		var timeSpanFrom = this.chartContainer.data.timeSpanFrom;
		
		// Filter entries
		var filteredEntries = [];
		for(var f in entries)
		{
			var entry = entries[f];
			var url = entry.url.toLowerCase().split("?")[0].toLowerCase();
			var file = url.split("/").pop();
			var ending = file.split(".").pop();
			
			if(allowedInitiatorType != null && allowedInitiatorType.length > 0 && allowedInitiatorType.indexOf(entry.initiatorType) == -1)
			{
				if(allowed != null && allowed.length > 0 && allowed.indexOf(ending) == -1) continue;
			}
			
			if(notAllowed != null && notAllowed.length > 0 && notAllowed.indexOf(ending) != -1) continue;
			if(notAllowedInitiatorType != null && notAllowedInitiatorType.length > 0 && notAllowedInitiatorType.indexOf(entry.initiatorType) != -1) continue;
			
			if(searchText.length > 0 && url.indexOf(searchText) == -1) continue;
			
			filteredEntries.push(entry);
		}
		
		return filteredEntries;
	},
	
	/**
	 * Creates array of timing entries from Navigation and Resource Timing Interfaces
	 * @returns {object[]}
	 */
	getTimings: function() {

		var entries = [];
	
		// Page times come from Navigation Timing API
		entries.push(this.createEntryFromNavigationTiming());

		// Other entries come from Resource Timing API
		var resources = [];
		
		if(window.performance.getEntriesByType !== undefined) {
			resources = window.performance.getEntriesByType("resource");
		}
		else if(window.performance.webkitGetEntriesByType !== undefined) {
			resources = window.performance.webkitGetEntriesByType("resource");
		}
		
		/* SCALE bookmarklet extension */ {
			resources = scalePerformanceBar.helpers.removeOwnSourcesFromResources(resources);
		}
		
		for(var n = 0; n < resources.length; n++) {
			entries.push(this.createEntryFromResourceTiming(resources[n]));
		}

		return entries;
	},

	/**
	 * Creates an entry from a PerformanceResourceTiming object 
	 * @param {object} resource
	 * @returns {object}
	 */
	createEntryFromNavigationTiming: function() {
		var timing = window.performance.timing;
		
		return {
			url:				document.URL,
			initiatorType:		"",
			start:				0,
			duration:			timing.responseEnd - timing.navigationStart,
			redirectStart:		timing.redirectStart === 0 ? 0 : timing.redirectStart - timing.navigationStart,
			redirectDuration:	timing.redirectEnd - timing.redirectStart,
			appCacheStart:		0,													// TODO
			appCacheDuration:	0,													// TODO
			dnsStart:			timing.domainLookupStart - timing.navigationStart,
			dnsDuration:		timing.domainLookupEnd - timing.domainLookupStart,
			tcpStart:			timing.connectStart - timing.navigationStart,
			tcpDuration:		timing.connectEnd - timing.connectStart,			// TODO
			sslStart:			0,													// TODO
			sslDuration:		0,													// TODO
			requestStart:		timing.requestStart - timing.navigationStart,
			requestDuration:	timing.responseStart - timing.requestStart,
			responseStart:		timing.responseStart - timing.navigationStart,
			responseDuration:	timing.responseEnd - timing.responseStart
		}
	},
	
	getMainPageEvents: function() {
		var timing = window.performance.timing;
		console.log(timing);
		return [
			{
				name:			"DOM Content loaded",
				timeStart:		(timing.domContentLoadedEventStart - timing.navigationStart),
				timeEnd:		(timing.domContentLoadedEventEnd - timing.navigationStart),
				line:			"#c141cd",
				fill:			"#D888DF"
			},
			{
				name:			"On load",
				timeStart:		(timing.loadEventStart - timing.navigationStart),
				timeEnd:		(timing.loadEventEnd - timing.navigationStart),
				line:			"#0000FF",
				fill:			"#C0C0FF"
			},
			/*
			{
				name:			"DOM interactive",
				time:			(timing.domInteractive - timing.navigationStart),
				line:			"#FF6A00"
			}
			//*/
		];
	},

	/**
	 * Creates an entry from a PerformanceResourceTiming object 
	 * @param {object} resource
	 * @returns {object}
	 */
	createEntryFromResourceTiming: function(resource) {
		// NB
		// AppCache: start = fetchStart, end = domainLookupStart, connectStart or requestStart
		// TCP: start = connectStart, end = secureConnectionStart or connectEnd
		// SSL: secureConnectionStart can be undefined
		
		return {
			url:				resource.name,
			initiatorType:		resource.initiatorType,
			start:				resource.startTime,
			duration:			resource.duration,
			redirectStart:		resource.redirectStart,
			redirectDuration:	resource.redirectEnd - resource.redirectStart,
			appCacheStart:		0,														// TODO
			appCacheDuration:	0,														// TODO
			dnsStart:			resource.domainLookupStart,
			dnsDuration:		resource.domainLookupEnd - resource.domainLookupStart,
			tcpStart:			resource.connectStart,
			tcpDuration:		resource.connectEnd - resource.connectStart,		 	// TODO
			sslStart:			0,														// TODO
			sslDuration:		0,														// TODO
			requestStart:		resource.requestStart,
			requestDuration:	resource.responseStart - resource.requestStart,
			responseStart:		resource.responseStart,
			// ??? - Chromium returns zero for responseEnd for 3rd party URLs, bug?
			responseDuration:	resource.responseStart == 0 ? 0 : resource.responseEnd - resource.responseStart
		};
	},
	
	/**
	 * Shorten URLs over 40 characters
	 * @param {string} url URL to be shortened
	 * @returns {string} Truncated URL
	 */
	shortenURL: function(url) {
		// Strip off any query string and fragment
		var strippedURL = url.match("[^?#]*")

		var shorterURL = strippedURL[0];
		if(shorterURL.length > 40) {
			shorterURL = shorterURL.slice(0, 25) + " ... " + shorterURL.slice(-10);
		}

		return shorterURL;
	},
	
	svg: {
		xmlns: "http://www.w3.org/2000/svg",
		
		/**
		 * Create SVG element
		 * @param {int} width
		 * @param {int} height
		 * @returns {element} SVG element
		 */
		createSVG: function(width, height) {
			var el = document.createElementNS(this.xmlns, "svg");
	 
			el.setAttribute("width", width);
			el.setAttribute("height", height);
		
			return el;
		},

		/**
		 * Create SVG Group element
		 * @param {string} transform SVG tranformation to apply to group element
		 * @returns {element} SVG Group element
		 */
		createSVGGroup: function(transform) {		
			var el = document.createElementNS(this.xmlns, "g");
			
			if(transform != null)
			{
				el.setAttribute("transform", transform);
			}
		
			return el;
		},

		/**
		 * Create SVG Rect element
		 * @param {int} x
		 * @param {int} y
		 * @param {int} width
		 * @param {int} height
		 * @param {string} style
		 * @returns {element} SVG Rect element
		 */
		createSVGRect: function(x, y, width, height, style) {
			var el = document.createElementNS(this.xmlns, "rect");
	 
			el.setAttribute("x", x);
			el.setAttribute("y", y);
			el.setAttribute("width", width);
			el.setAttribute("height", height);
			el.setAttribute("style", style);

			return el;
		},

		/**
		 * Create SVG Rect element
		 * @param {int} x1
		 * @param {int} y1
		 * @param {int} x2
		 * @param {int} y2
		 * @param {string} style
		 * @returns {element} SVG Line element
		 */
		createSVGLine: function(x1, y1, x2, y2, style) {
			var el = document.createElementNS(this.xmlns, "line");

			el.setAttribute("x1", x1);
			el.setAttribute("y1", y1);
			el.setAttribute("x2", x2);
			el.setAttribute("y2", y2);
			el.setAttribute("style", style);

			return el;
		},

		/**
		 * Create SVG Text element
		 * @param {int} x
		 * @param {int} y
		 * @param {int} dx
		 * @param {int} dy
		 * @param {string} style
		 * @param {string} anchor
		 * @param {string} text
		 * @returns {element} SVG Text element
		 */
		createSVGText: function(x, y, dx, dy, style, anchor, text, title) {
			var el = document.createElementNS(this.xmlns, "text");

			el.setAttribute("x", x);
			el.setAttribute("y", y);
			el.setAttribute("dx", dx);
			el.setAttribute("dy", dy);
			el.setAttribute("style", style);
			el.setAttribute("text-anchor", anchor);
			if(title != null) el.setAttribute("title", title);

			el.appendChild(document.createTextNode(text));

			return el;
		}
	}
};