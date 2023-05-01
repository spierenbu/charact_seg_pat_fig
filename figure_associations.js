const   container = d3.select("#figure-associations"),
        minRadius = 0.5,
        strokeWidthSelect = 3;

let width = container.node().clientWidth,
    height = width/1.6,
    marginTop = 10,
    marginBottom = 20,
    marginLeft = 35,
    marginRight = 0.1*width,
    maxRadius = 0.02*width,
    legendX = (width > 725? width - marginRight:width - marginRight-20),
    legendWidth = marginRight,
    barWidth = legendWidth/6,
    heightColorbarBody = (width > 725? 0.7 * (height - marginBottom):0.5 * (height - marginBottom)),
    heightColorbar = (width > 725? 0.7 * (height - marginBottom):0.5 * (height - marginBottom)),
    ticksColor = heightColorbar / 64,
    tickSizeColor = barWidth/2,
    heightSizeLegend = 0.3 * (height - marginBottom),
    tickValuesColor = (width > 725? [0,5,10,15,20,25,30,35,40]:[0,10,20,30,40]),
    tickValuesSize = (width > 725? [10000,200000,600000]:[10000,400000]);

window.addEventListener("resize", updateFigure);

let selectedVariableX = d3.select("#selectVariableX").property("value"),
    selectedVariableY = d3.select("#selectVariableY").property("value");

// append the svg object to the body of the page
let figureBody = d3.select("#figure-associations")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Body of the scatter plot, containing the axes and the observations.
let scatterPlot =  figureBody.append("g");


// SCALES IN THE FIGURE.
const colorScale = d3
    .scaleLinear()
    .domain([0,4,8,12,16,20,24,28,32,36,40])
    .range(["#f7d500","#f2bb00","#e48300","#d65800","#c63700","#b42003","#a11096","#8b07f3","#7202f3","#500093","black"]);

const n = Math.min(colorScale.domain().length, colorScale.range().length);

const cScale = colorScale
    .copy()
    .rangeRound(d3.quantize(d3.interpolate(heightColorbar,0), n)); // colorscale for the colorbar.
const xScale = d3.scaleLinear(); 
const yScale = d3.scaleLinear();
const scaleRadius = d3.scaleSqrt();


// AXES IN THE FIGURE.
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);
const cAxis = d3.axisRight(cScale);

// Graphical object containing the x-axis.
const xAxisG = scatterPlot.append("g")
    .attr("class", "axis");

const xAxisLabel = xAxisG.append("text")
    .attr("class", "figure-title figure-axis-label-x")
    .attr("dy", "-0.5em")
    .text("Population [inh]");
 
// Graphical object containing the y-axis.
const yAxisG = scatterPlot.append("g")
    .attr("class", "axis");

const yAxisLabel = yAxisG.append("text")
    .attr("class", "figure-title figure-axis-label-y")
    .attr("y", marginTop)
    .attr("dx", "0.5em")
    .attr("dy", "0.5em")
    .text("Intensity [%]");


// LEGEND ON THE SIZE OF THE OBSERVATIONS.
const sizeLegendBody = figureBody.append("g")
    .attr("class","figure-legend");

const sizeLegendTitle = sizeLegendBody
    .append("text")
    .attr("class", "figure-title figure-title-right-axis")
    .text("Population");

const sizeLegendItems = sizeLegendBody
    .append("g"); 


// LEGEND FOR THE COLORBAR.
const colorbarBody = figureBody.append("g")
    .attr("class","figure-legend");

const colorbarBar = colorbarBody.append("g");
const colorbarImg = colorbarBar.append("image");
const colorbarTicks = colorbarBody.append("g");
const colorbarTitle = colorbarBody.append("text")
   .attr("class","figure-title figure-title-right-axis")
   .attr("dy", "-1em")
   .attr("dx", "-1em")
   .text("Social mix [%]");


// TOOLTIP
const toolTip = d3.select("body").append("div")
    .attr("class", "toolTip");

const toolTipTitle = toolTip
    .append("span")
    .append("text")
    .attr("class", "tooltip-title");

const toolTipVariableX = toolTip
    .append("span")
    .append("text")
    .attr("class", "tooltip-item");

const toolTipVariableY = toolTip
    .append("span")
    .append("text")
    .attr("class", "tooltip-item");


d3.csv("data_no_missing_gini.csv").then(function(data) {

    //const listCities = data.sort((a, b) => d3.ascending(a.city_name, b.city_name));

    // d3.select("#selectVariableX")
    //     .selectAll("myOptions")
    //     .data(listCities)
    //     .enter()
    //     .append("option")
    //     .text(d => d.city_name) // text showed in the menu
    //     .attr("value",d => d.GM_NAAM) // corresponding value returned by the button
    
      // Transforms data units into pixel units for the x axis.
    xScale
        .domain(d3.extent(d3.map(data, d => +d.AANT_INW))) // domain corresponds to range of values of the data (in data unit).
        .nice(); // nice rounds the domain.

      // Transforms data units into pixel units for the y axis.
    yScale
        .domain(d3.extent(d3.map(data, d => +d.intensity))) 
        .nice();

    scaleRadius
        .domain([0, d3.max(d3.map(data, d => +d.AANT_INW))]);

    // Add the observations.
    scatterPlot
        .selectAll("circle") 
        .data(data.sort((a, b) => d3.descending(+a.AANT_INW, +b.AANT_INW)))
        .join("circle")
        .attr("fill", d => colorScale(+d.share_NW_c * 100))
        .attr("stroke", d => colorScale(+d.share_NW_c * 100))
        .attr("stroke-width",0.5) // to remove.
        .attr("fill-opacity",0.5)
        .attr("stroke-opacity",0.5)
        .attr("class","figure-observation")
        .on("mousemove", nodeMouseOver) 
        .on("mouseout", nodeMouseOut);

    updateFigure();

    })

function updateFigure() {
    // Get the current width and height of the container
    //container = d3.select("#figure-interactive");
    width = container.node().clientWidth;
    height = width/1.6;
    marginRight = 0.1*width;
    legendWidth = marginRight;

    legendX = (width > 725? width - marginRight:width - marginRight-20);
    
    heightColorbarBody = (width > 725? 0.7 * (height - marginBottom):0.5 * (height - marginBottom));
    heightColorbar = (width > 725? 0.7 * (height - marginBottom):0.5 * (height - marginBottom));
    barWidth = legendWidth/6;
    ticksColor = heightColorbar / 64;
    tickValuesColor = (width > 725? [0,5,10,15,20,25,30,35,40]:[0,10,20,30,40]);

    heightSizeLegend = 0.3 * (height - marginBottom);
    maxRadius = 0.02*width;
    tickValuesSize = (width > 725? [10000,200000,600000]:[10000,400000]);

    // Update the width and height of the entire figure.
    figureBody
        .attr("width", width)
        .attr("height", height);

    // Update the scatter plot.
    // Changing the scale of the axes.
    xScale.range([marginLeft, width - marginRight]);
    yScale.range([height - marginBottom, marginTop]);
    scaleRadius.range([minRadius, maxRadius]);
    cScale.rangeRound(d3.quantize(d3.interpolate(heightColorbar,0), n)); // colorscale for the colorbar.

    // Updating the axes.
        xAxis.scale(xScale);
        yAxis.scale(yScale);
        cAxis
        .scale(cScale)
        .ticks(ticksColor, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickValues(tickValuesColor)
        .tickSize(tickSizeColor);

    // Updating the position of the axes.
    xAxisG
        .call(xAxis)
        .attr("transform", `translate(0,${height - marginBottom})`)
        .attr("x", width - marginRight);

    yAxisG
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis);

    // Updating the position of the label of the x axis.
    xAxisLabel
        .attr("x", width - marginRight);

    // SCATTER PLOT.
    if (selectedVariableX == "pop"){
        scatterPlot.selectAll(".figure-observation").attr("cx", d => xScale(+d.AANT_INW));
    }
    else if (selectedVariableX == "sh_NW"){
        scatterPlot.selectAll(".figure-observation").attr("cx", d => xScale(+d.share_NW_c*100)); 
    }
    else if (selectedVariableX == "gini"){
        scatterPlot.selectAll(".figure-observation").attr("cx", d => xScale(+d.Gini*100)); 
    }

    if (selectedVariableY == "intensity"){
        scatterPlot.selectAll(".figure-observation").attr("cy", d => yScale(+d.intensity));
     }
     else if (selectedVariableY == "separation"){
        scatterPlot.selectAll(".figure-observation").attr("cy", d => yScale(+d.separation)); 
     }
     else if (selectedVariableY == "scale"){
         scatterPlot.selectAll(".figure-observation").attr("cy", d => yScale(+d.scale)); 
     }
    else if (selectedVariableY == "scale_rel"){
        scatterPlot.selectAll(".figure-observation").attr("cy", d => yScale(+d.scale_rel)); 
    }

    scatterPlot
        .selectAll(".figure-observation")
        .attr("r", d => scaleRadius(+d.AANT_INW));


    // SIZE LEGEND.
    sizeLegendBody
        .attr("width", legendWidth)
        .attr("height", heightSizeLegend)
        .attr("transform", `translate(${legendX + maxRadius},${marginTop + 2 *maxRadius + 22})`);

    sizeLegendTitle
        .attr("y", - 2.5 * maxRadius)
        .attr("x",-maxRadius);

    sizeLegendItems
        .selectAll("circle")
        .data(tickValuesSize)
        .join("circle")
        .attr("cy", d => -scaleRadius(d))
        .attr("r", scaleRadius)
        .attr("class", "figure-legend-size-g");
    
    sizeLegendItems
        .selectAll("line")
        .data(tickValuesSize)
        .join("line")
        .attr("x1", 0)
        .attr("y1", (d) => -2 * scaleRadius(d))
        .attr("x2", maxRadius)
        .attr("y2", (d) => -2 * scaleRadius(d))
        .attr("class", "figure-legend-size-g");

    sizeLegendItems
        .selectAll("text")
        .data(tickValuesSize)
        .join("text")
        .attr("x", maxRadius)
        .attr("y", (d) => -2 * scaleRadius(d))
        .text(scaleRadius.tickFormat(tickValuesSize.len, "s"))
        .attr("class","figure-tick")
        .attr("dx", "0.2em");


    // COLORBAR.   
    colorbarBody  
        .attr("width", legendWidth)
        .attr("height", heightColorbarBody)
        .attr("transform", `translate(${legendX},${height-heightColorbarBody-45})`);

    colorbarBar
        .attr("width", barWidth)
        .attr("height", heightColorbar);

    colorbarImg
        .attr("width", barWidth)
        .attr("height", heightColorbar)
        .attr("preserveAspectRatio", "none") // d3.quantize(d3.interpolate(0, 1), n) takes n values equally spaced between 0 and 1.
        .attr("xlink:href", ramp(colorScale.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());

    colorbarTicks
        .attr("transform", `translate(${barWidth},${heightColorbarBody-heightColorbar})`)
        .call(cAxis)
        .call(g => g.selectAll(".tick line").attr("x1",  -barWidth))
        .call(g => g.select(".domain").remove());

    }

function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.height = n;
    canvas.width = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(0, n-i-1, 1, 1);
    }
    return canvas;
  }


async function nodeMouseOver(event, d){
    // Get the toolTip, update the position, and append the inner html depending on your content

    selectedVariableX = d3.select("#selectVariableX").property("value");
    selectedVariableY = d3.select("#selectVariableY").property("value");
    toolTip 
        .style("left",  event.pageX + 18 + "px") //careful with the event.pageX.
        .style("top", event.pageY + "px") //careful with the event.pageX.
        .style("display", "block");

    // Optional cursor change on target
    d3.select(event.target).style("cursor", "pointer"); 
    
    // Optional highlight effects on target
    d3.select(event.target)
        .attr("stroke-width",3) // to remove.
        .attr("fill-opacity",0.7)
        .attr("stroke-opacity",0.7)
        .attr("stroke","black")
        .attr("class","figure-observation-hover");

        toolTipTitle.text(`${d.city_name}`);

    if (selectedVariableX == "pop"){
        toolTipVariableX.text(`Population: ${d3.format(",")(d.AANT_INW)}`);
    }

    else if (selectedVariableX == "sh_NW"){
        toolTipVariableX.text(`Social mix: ${d3.format(".1f")(d.share_NW_c*100)} %`); 
    }

    else if (selectedVariableX == "gini"){
        toolTipVariableX.text(`Gini: ${d3.format(".1f")(d.Gini*100)} %`); 
    }

    if (selectedVariableY == "intensity"){
        toolTipVariableY.text(`Intensity: ${d3.format(".1f")(+d.intensity)} %`);
    }

    else if (selectedVariableY == "separation"){
        toolTipVariableY.text(`Separation: ${d3.format(".1f")(d.separation)} %`); 
    }

    else if (selectedVariableY == "scale"){
        toolTipVariableY.text(`Scale: ${d3.format(",")(d.scale)}`); 
    }
    else if (selectedVariableY == "scale_rel"){
        toolTipVariableY.text(`Relative scale: ${d3.format(".1f")(d.scale_rel)} %`); 
    }
   

}

function nodeMouseOut(event, d){

   // rectMap.attr("width", mapWidth);

    toolTip.style("display", "none");

    // Optional cursor change removed
    d3.select(event.target).style("cursor", "default"); 
    
    // Optional highlight removed
    d3.select(event.target)
        .transition()
        .attr("stroke", colorScale(d.share_NW_c * 100))
        .attr("stroke-width",0.5) 
        .attr("fill-opacity",0.5)
        .attr("stroke-opacity",0.5)
        .attr("class","figure-observation");


}

d3.select("#selectVariableX").on("change", function(d) {
    // recover the option that has been chosen
    selectedVariableX = d3.select(this).property("value");
    //selectedVariableY = d3.select("#selectVariableY").property("value");

    if (selectedVariableX == "pop"){
        xScale
            .domain(d3.extent(scatterPlot.selectAll(".figure-observation").data().map(d => +d.AANT_INW)))
            .nice();
        xAxis.scale(xScale);
        xAxisG.call(xAxis);
        xAxisLabel.text("Population [inh]");
        scatterPlot.selectAll(".figure-observation").transition().duration(1000).attr("cx", d => xScale(+d.AANT_INW));
    }

    else if (selectedVariableX == "sh_NW"){
        xScale
            .domain(d3.extent(scatterPlot.selectAll(".figure-observation").data().map(d => +d.share_NW_c*100)))
            .nice();
        xAxis.scale(xScale);
        xAxisG.call(xAxis);
        xAxisLabel.text("Social mix [%]");
        scatterPlot.selectAll(".figure-observation").transition().duration(1000).attr("cx", d => xScale(+d.share_NW_c*100)); 
    }

    else if (selectedVariableX == "gini"){
        xScale
            .domain(d3.extent(scatterPlot.selectAll(".figure-observation").data().map(d => +d.Gini*100)))
            .nice();
        xAxis.scale(xScale);
        xAxisG.call(xAxis);
        xAxisLabel.text("Gini coefficent [%]");
        scatterPlot.selectAll(".figure-observation").transition().duration(1000).attr("cx", d => xScale(+d.Gini*100)); 
    }

})

d3.select("#selectVariableY").on("change", function(d) {
     // recover the option that has been chosen
     selectedVariableY = d3.select(this).property("value");
     //selectedVariableY = d3.select("#selectVariableY").property("value");
 
     if (selectedVariableY == "intensity"){
        yScale
            .domain(d3.extent(scatterPlot.selectAll(".figure-observation").data().map(d => +d.intensity)))
            .nice();
        yAxis.scale(yScale);
        yAxisG.call(yAxis);
        yAxisLabel.text("Intensity [%]");
        scatterPlot.selectAll(".figure-observation").transition().duration(1000).attr("cy", d => yScale(+d.intensity));
     }
 
     else if (selectedVariableY == "separation"){
        yScale
            .domain(d3.extent(scatterPlot.selectAll(".figure-observation").data().map(d => +d.separation)))
            .nice();
        yAxis.scale(yScale);
        yAxisG.call(yAxis);
        yAxisLabel.text("Separation [%]");
        scatterPlot.selectAll(".figure-observation").transition().duration(1000).attr("cy", d => yScale(+d.separation)); 
     }
 
     else if (selectedVariableY == "scale"){
         yScale
             .domain(d3.extent(scatterPlot.selectAll(".figure-observation").data().map(d => +d.scale)))
             .nice();
         yAxis.scale(yScale);
         yAxisG.call(yAxis.tickFormat(d3.format(".2s")));
         yAxisLabel.text("Scale [inh]");
         scatterPlot.selectAll(".figure-observation").transition().duration(1000).attr("cy", d => yScale(+d.scale)); 
     }

    else if (selectedVariableY == "scale_rel"){
        yScale
            .domain(d3.extent(scatterPlot.selectAll(".figure-observation").data().map(d => +d.scale_rel)))
            .nice();
        yAxis.scale(yScale);
        yAxisG.call(yAxis);
        yAxisLabel.text("Relative scale [%]");
        scatterPlot.selectAll(".figure-observation").transition().duration(1000).attr("cy", d => yScale(+d.scale_rel)); 
    }

})
