import { select, 
  scaleTime, 
  scaleLinear, 
  scaleSequential, 
  json, 
  min, 
  max,
  interpolateReds,
  axisBottom,
  axisLeft,
 } from 'd3';
import './index.scss';
import { datasetParse } from './datasetParse';
// import { yTickText, } from './formats'  //Removed due to fcc test constraints


// Function to create div to contain chart svg with plain JS
// No good reason for this, just practice making html in plain js
function makeDivForChart(){
  const element = document.createElement('div');
  element.setAttribute("id", "svg-container");
  return element;
}
// Append .svg-container div to the "main" element
document.getElementById("main").appendChild(makeDivForChart());

// Snarky disclaimer, required by internal moral compass
const aside = document.createElement('aside');
const disclaimer = document.createTextNode(
`Not included in chart: environmental externalities, global
sociopolitical conditions, quality of life, income equality, existential
satisfaction.`
);
aside.appendChild( disclaimer);
document.getElementById("main").appendChild(aside);

// Initial chart parameters
let padding = 30;
let margin = { 
  top: padding, 
  right: padding, 
  bottom: padding, 
  left: padding + 10
};

// Initialize main chart SVG
let mainSvg = select("#svg-container")
  .append("svg")
  .style("background", `hsla(0,0%, 70%, 0.1)`)
  .style("color", "var(--main-text-color)")
  .attr("id", "main-svg")
;

// Width & height
const width = 500;
const height = 250;
let innerWidth = width - margin.left - margin.right;
let innerHeight = height - margin.top - margin.bottom; 

// Apply height and width to mainSvg via viewBox
mainSvg
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .classed("svg-content", true)

// Margin Convention: group all in-chart components, translate over and down
const innerGroup = mainSvg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .attr("id", "inner-group")
  ;

// Helper Function: simple clamp (for use in bounding tooltip position )
let clamp = (min, val, max) => Math.max(min, Math.min(val, max));

// Initialize dataset variable
let dataset;

//Dataset source
let gdpUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';


//Fetch data and generate marks 
json(gdpUrl).then((root) => {
  dataset = root.data.map(datasetParse);

  // Extract min and max values from dataset, to be reused
  let xMax = max(dataset, (d) => d.dateProper);
  let xMin = min(dataset, d => d.dateProper);
  let yMax = max(dataset, (d) => d.gdpClassic);

  // Set coloration based on y-axis values 
  let barColor = (d) => {
    // Given a number in the range [0,1], interpolateReds returns the 
    // corresponding color in the "Reds" sequential color scheme represented 
    // as an RGB string.
    return interpolateReds(
      // Produces the number in the range [0, 1] by using the scaleSequential
      // method within the domain of the bar value, and ferrying the data point
      // to scaleSequential
      scaleSequential()
        .domain([0, yMax])
        .range([0, 1])
        (d));
  }
  // More modular mark coloration option for future reference:
  // barColor separated into 1) scaling y value into val between 0 and 1; and
  // let scaleForColors = d3.scaleSequential()
  //   .domain([0, yMax])
  //   .range([0, 1])
  //   ;
  // 2) applying color interpolation effect
  // let colorMaker = (valueScaledForColors) => 
  //   d3.interpolateReds(scaleColors(valueScaledForColors))

  // Set X and Y scales 
  let xScale = scaleTime()
    .domain([xMin, xMax])
    .range([0, innerWidth])
    // .nice() // common practice, skipped here for sake of fcc-test
    ;
  let yScale = scaleLinear()
    .domain([0, yMax])
    .range([innerHeight, 0]);

  // Initialize and append xAxis 
  let xAxis = axisBottom(xScale);
  innerGroup.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .attr("id", "x-axis")
    .call(xAxis)
    .call(g => g.select(".domain")
      .style("color", "var(--main-text-color)")
      .attr("stroke-opacity", 0.3))
    ;

  // Initialize and append yAxis
  const yAxis = axisLeft(yScale);
  innerGroup.append("g")
    .attr("transform", `translate(${0}, 0)`)
    .style("color", "var(--main-text-color)")
    .attr("id", "y-axis")
    .call(yAxis)
    // Move all but the first tick text to the right of axis and above line
    .call(g => g.selectAll(".tick:not(:first-of-type) text")
      .attr("x", 2)
      .attr("dy", -3)
      .attr("text-anchor", "start")
    )
    // Remove the first tick text ($0), because it overlaps with mark rects 
    // in this particular "stacked values inside main chart body" style
    .call(g => g.select(`.tick:nth-of-type(1) text`)
      // commenting out preferred method (remove) due to fcc test constraints
      // .remove()
      // instead hiding the text with transparency like a coward
      .style("color", "transparent")
      )
    // Format tick text to local (US) currency with two significant digits
    .call(g => g.selectAll(`.tick text`)
      // commenting this out this due to fcc test constraints
      // .text(t => yTickText(t))
      // replace with default behavior
      .text (t => t)

    )
    // Remove the y axis domain path for style
    .call(g => g.select(".domain")
          .remove())
    // Draw tick lines across whole chart
    .call(g => g.selectAll(".tick line")
      .attr("transform", `translate(${0}, 0)`)
      .attr(`x1`, 0)
      .attr(`x2`, innerWidth)
    // Move tick lines below bar marks
      .attr("z-index", "-1")
      .attr("stroke-opacity", 0.3)
    )
    .append("text")
    .text("Gross Domestic Product - Billion$")
    .style("fill", "var(--main-text-color)")
    .attr("transform", `translate(${-10}, ${innerHeight / 2}) rotate(270)`)
    .attr("text-anchor", "middle")
    .style("font-size", "1.3em")
    .attr("id", "y-label")
    ;
    
  // Create tooltip
  let tooltip = select("#svg-container")
    .append("div")
    .style("opacity", 1)
    .style("z-index", 20)
    .style("background", `hsla(220, 40%, 20%, 0.9)`)
    .style("border-width", "1px")
    .style("border-radius", "2px")
    .style("padding", "0px 5px")
    .style("position", "absolute")
    .style("font-size", "1.2rem")
    .style("text-align", "center")
    .attr("id", "tooltip")
    ;

  // Function to handling mouse over mark (bar rect) elements
  let handleMouseOver = function(event, d) {

    // Style the moused-over bar rect
    select(event.currentTarget)
      .attr("opacity", 0.5);

    // Update content inside tooltip
    select('#tooltip')
      .attr("data-date", d.dateClassic)
      .html(`<p>${d.quarterString}</p><p>${d.gdpString} Billion</p>`);
    
    // Get size and position information on tooltip element and the overall
    // chart in order to clamp the tooltip position within it chart bounds
    let tipDimensions =  document.querySelector("#tooltip")
      .getBoundingClientRect();
    let chartDimentions = document.querySelector("#main-svg")
      .getBoundingClientRect();

    // Position the tooltip element -- clamp takes (min, val, max)
    select('#tooltip')
      .style("top", 
        `${clamp(
            0, 
            event.offsetY - tipDimensions.height - 5,
            chartDimentions.height - tipDimensions.height
            )}px`)
      .style("left",
        `${clamp(
          margin.left, 
          event.offsetX - tipDimensions.width - 5, 
          chartDimentions.width - tipDimensions.width
          )}px`)
      .transition()
      .duration('50')
      .style("opacity", 1)
  ;
  }
  // Function to handle mouse leaving bar, simple transition to 0 opacity
  let handleMouseOut = function(event, d) {
    select(event.currentTarget)
      .attr("opacity", "1")

    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // Create marks 
  // Blood for the blood god, bars for the Bar Chart
  
  // Set bar width according to available size, add a teense to remove gaps
  let barWidth = innerWidth / dataset.length + 1; 

  innerGroup
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("width", barWidth)
    .attr("height", (d) => ((yScale(0) - yScale(d.gdpClassic)) * 1000 ) / 1000 )
    .attr("fill", d => barColor(d.gdpClassic))
    .attr("class", "bar")
    .attr("data-date", d => d.dateClassic )
    .attr("data-gdp", d => d.gdpClassic)
    .attr("x", (d) => xScale(d.dateProper))
    .attr("y",(d) => (yScale(d.gdpClassic) * 1000 ) / 1000)
    .on("mouseover mousemove focus pointerover", handleMouseOver
    )
    // .on("mousemove", handleMouseMove)
    .on("mouseout pointerleave pointerout", handleMouseOut)
    ;
  }
);
