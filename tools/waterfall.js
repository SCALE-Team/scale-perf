function Waterfall(performanceApi, toolContainer, popup) {
	// Check for Navigation Timing and Resource Timing APIs
	if(window.performance == null || (window.performance.getEntriesByType == null && window.performance.webkitGetEntriesByType == null))
	{
		alert("Resource Timing API not supported");
		return;
	}
	
	// Remember configs
	this.performanceApi = performanceApi;
	this.toolContainer = toolContainer;
	this.popup = popup;
	
	this.toolContainer.className = "waterfall_container";
	
	// look for erros
	if(typeof(this.performanceApi) != "object")
	{
		alert("Waterfall.js: Parameter performanceApi is required!");
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
	
	barColors: [
		{
			text:	"blocked",
			color:	"#BDC3C7"
		},
		{
			text:	"thirdParty",
			isDark:	true,
			color:	"#2B2B2B"
		},
		{
			text:	"redirect",
			color:	"#E74C3C"
		},
		{
			text:	"appCache",
			color:	"#A38671"
		},
		{
			text:	"dns",
			color:	"#47C9AF"
		},
		{
			text:	"tcp",
			color:	"#EB974E"
		},
		{
			text:	"ssl",
			color:	"#AF7AC4"
		},
		{
			text:	"request",
			color:	"#2ECC71"
		},
		{
			text:	"response",
			color:	"#5CACE2"
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
		
		this.legendContainer.innerHTML = "";
		
		// Resource legend
		var legend = document.createElement("div");
		legend.id = legendId;
		this.legendContainer.appendChild(legend);
		
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
		this.legendContainer.appendChild(eventLegend);
		
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
		
		var clearBoth = document.createElement("div");
		clearBoth.style.clear = "both";
		this.legendContainer.appendChild(clearBoth);
	},
	
	addStyles: function() {
		var cssElem = document.createElement("style");
		cssElem.id = "ScaleWaterfallStyle";
		
		var style = ".waterfall_container { color: #2B2B2B; background: #fff; border-bottom: 2px solid #000; margin: 0px; padding: 5px 0px 10px 0px; }";
		style += ".waterfall_container input, .waterfall_container button { outline: none; border-radius: 5px; padding: 5px; border: 1px solid #BDC3C7; }";
		style += ".waterfall_container button { background-color: #ECF0F1; padding: 5px 10px; }";
		style += ".waterfall_container .timeSpanInput { width: 70px; }";
		
		style += ".waterfall_container .filterContainer { height: 40px; position: relative; }";
		
		style += ".waterfall_container .filterContainer > div:first-child { position: absolute; left: 0px; top: 0px; right: 200px; padding:5px; }";
		style += ".waterfall_container .filterContainer > div:last-child { position: absolute; right: 0px; width: 450px; top: 0px; text-align: right; padding:5px; }";
		
		style += ".waterfall_container .filterContainer > div:last-child > :first-child { display: inline-block; }";
		style += ".waterfall_container .filterContainer > div:last-child > :first-child input { width: 100%; }";
		
		style += "@media (max-width: 768px) {";
			style += ".waterfall_container .filterContainer { height: auto; }";
			style += ".waterfall_container .filterContainer > div { position: relative !important; width:100% !important; top: 0px !important; right: 0px !important; left: 0px !important; display: block !important; text-align: left !important; }";
			style += ".waterfall_container .filterContainer > div:last-child > :first-child { position: absolute; left: 0px; top: 0px; right: 240px; }";
			style += ".waterfall_container .filterContainer > div:last-child > :last-child { position: absolute; right: 0px; top: 0px; width: 240px; text-align: right; }";
			
			style += ".waterfall_container .chart_svg .hideMobile { display: none; }";
		style += "}";
		
		style += ".waterfall_container #ChartContainer { position: relative; }";
		style += ".waterfall_container #ChartContainer rect { fill: transparent; stroke-width: 1px; }";
		style += ".waterfall_container #ChartContainer rect:hover { stroke: #000; }";
		style += ".waterfall_container #ChartContainer .waterfall_label { cursor: pointer; }";
		style += ".waterfall_container .chart_svg { position: absolute; top: 0px; left: 200px; right: 5px; }";
		
		//style += ".waterfall_container .svg_labels { z-index: 10; position: absolute; top: 0px; left: 0px; overflow: visible; }";
		//style += ".waterfall_container .svg_labels text { background:red; }";
		
		style += ".waterfall_container .button-group { display: inline-block; }";
		style += ".waterfall_container .button-group button { border-radius: 0px 0px 0px 0px; border-right: none; cursor: pointer; }";
		style += ".waterfall_container .button-group button:hover { background-color: #eee; }";
		style += ".waterfall_container .button-group button:active { background-color: #BDC3C7; }";
		style += ".waterfall_container .button-group button[disabled] { background-color: #BDC3C7 !important; cursor: default; }";
		style += ".waterfall_container .button-group :first-child { border-radius: 5px 0px 0px 5px; }";
		style += ".waterfall_container .button-group :last-child { border-radius: 0px 5px 5px 0px; border-right: 1px solid #BDC3C7; }";
		
		style += ".waterfall_container #WaterfallLegendContainer { margin-bottom: 10px; }";
		style += ".waterfall_container #WaterfallLegend, #WaterfallEventLegend { float:left; display: inline-block; }";
		style += ".waterfall_container #WaterfallEventLegend { float: right; }";
		style += ".waterfall_container #WaterfallLegend > div, #WaterfallEventLegend > div { display: inline-block; padding: 3px; border-radius: 3px; margin: 10px 3px 0px; }";
		style += ".waterfall_container #WaterfallEventLegend > div { border-radius:0px; border: 2px solid transparent; border-top: 0px; border-bottom: 0px; margin: 10px 3px 0px; }";
		style += ".waterfall_container #WaterfallLegend > div.dark { color: #fff; }";
		
		cssElem.innerHTML = style;
		this.toolContainer.appendChild(cssElem);
	},
	
	/**
	 * Draw waterfall
	 * @param {object[]} entries
	 */
	drawWaterfall: function(entries) {
		var superClass = this;
		
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
		superClass.legendContainer = document.createElement("div");
		superClass.legendContainer.id = "WaterfallLegendContainer";
		superClass.toolContainer.appendChild(superClass.legendContainer);
		
		superClass.chartContainer = document.createElement("div");
		superClass.chartContainer.id = "ChartContainer";
		superClass.chartContainer.data = {
			allowed:		[],
			nowAllowed:		[],
			searchText:		"",
			timeSpanUntil:	superClass.performanceApi.getPageLoadTime()
		};
		superClass.toolContainer.appendChild(superClass.chartContainer);
		
		superClass.drawAllBars(entries);
	},
	
	// Function to draw all the waterfall bars
	drawAllBars: function(entries) {
		var superClass = this;
		/* Prepare some attributes */ {
			// Height of the bars
			var rowHeight = 15;
			
			// space between the bars
			var rowPadding = 2;
			
			// The width of the labels
			var barOffset = 200;
			
			// Get the entries to show
			var entriesToShow = this.filterEntries(entries);
			
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
			
			var dy = 11;
			
			/* Label of the row */ {
				var rowLabel = this.svg.createSVGGroup("translate(0," + (n + 1) * (rowHeight + rowPadding) + ")");
				
				var style = "font: 10px sans-serif;";
				if(!isDisplayed) style += "fill:#ddd;";
				var shortUrl = this.svg.createSVGText(5, 0, 0, dy, style, "start", this.shortenURL(entry.url), entry.url);
				rowLabel.appendChild(shortUrl);
				svgLabels.appendChild(rowLabel);
				
				var background = this.svg.createSVGRect(0, 0, 300, rowHeight);
				background.setAttribute("class", "waterfall_label");
				background.appendChild(this.buildTitle(entry.url));
				background.info = [
					{
						name:	"URL",
						value:	entry.url
					},
					{
						name:	"Initiator type",
						value:	entry.initiatorType
					},
					{
						name:	"Start",
						value:	Math.round(entry.start) + "ms"
					},
					{
						name:	"Duration",
						value:	Math.round(entry.duration) + "ms"
					},
				];
				background.onclick = function(e) {
					var text = "<h1>Details</h1>";
					
					for(var f in e.target.info)
					{
						var info = e.target.info[f];
						text += "<h3>" + info.name + "</h3>";
						text += info.value + "<br />";
					}
					
					superClass.popup.show(text, true);
				};
				rowLabel.appendChild(background);
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
		
		var text = duration + "ms";
		
		if(label != null) text = label + ": " + text;
		
		return this.buildTitle(text);
	},
	
	buildTitle: function(text) {
		var title = document.createElementNS(this.svg.xmlns, "title");
		title.innerHTML = text;
		
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
		
		resources = this.performanceApi.getEntriesByType("resource");
		
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
		
		return [
			{
				name:			"DOM Content loaded",
				timeStart:		(timing.domContentLoadedEventStart - timing.navigationStart),
				timeEnd:		(timing.domContentLoadedEventEnd - timing.navigationStart),
				line:			"#8E44AD",
				fill:			"#AF7AC4"
			},
			{
				name:			"On load",
				timeStart:		(timing.loadEventStart - timing.navigationStart),
				timeEnd:		(timing.loadEventEnd - timing.navigationStart),
				line:			"#99ABD5",
				fill:			"#B8C9F1"
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