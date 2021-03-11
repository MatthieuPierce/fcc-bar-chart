import * as d3 from 'd3';
import { select, scaleTime, scaleLinear, selectAll } from 'd3';

import './index.scss';
import { yTickText, } from './formats'
import { datasetParse } from './datasetParse';
// import { resize } from './resize';

//function to create main chart div with plain JS (not D3)
// no good reason for this, just practice making html in plain js
function makeDivForChart(){
  const element = document.createElement('div');
  element.setAttribute("id", "svg-div");

  return element;
}
//append chart-div to the "main" element
document.getElementById("main").appendChild(makeDivForChart());


//INITIAL CHART PARAMETERS
//padding
let padding = 40;
//margin
let margin = { 
  top: padding, 
  right: padding, 
  bottom: padding, 
  left: padding + 10
};

//initialize main chart SVG
const mainSvg = d3.select("#svg-div")
  .append("svg")
  .style("background", `hsla(0,0%, 70%, 0.1)`)
  .style("color", "var(--main-text-color)")
  .attr("id", "main-svg")
;


//width & height
// // old static width & height
// const width = 1000;
// const height = 500;

// new responsive width 
let width = parseInt(d3.select('#main-svg').style("width"));
let height = parseInt(d3.select('#main-svg').style("height"));
let innerWidth = width - margin.left - margin.right;
let innerHeight = height - margin.top - margin.bottom; 

//apply height and width to mainSvg (separated from initialization because
// selecting the mainSvg svg element's style: width and height properties
// requires that the element exist on the DOM first

mainSvg
.attr("width", width)
.attr("height", height)

//Margin Convention - group all in-chart components, translate over and down
// to create margins
const innerGroup = mainSvg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .attr("id", "inner-group")
  ;

// HELPER FUNCTIONS



//call resize upon load?
// resize();


// simple clamp function
let clamp = (min, val, max) => Math.max(min, Math.min(val, max));


let dataset;
//Dataset source
let gdpUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';


//Fetch data and generate marks
d3.json(gdpUrl).then(function(root) {

  console.log(`object fetched by d3.json:`)
  console.log(root);

  dataset = root.data.map(datasetParse);
  console.log(`dataset after processing:`); 
  console.log(dataset);

  //min and max values from dataset, to be reused
  let xMax = d3.max(dataset, (d) => d[0]);
  let xMin = d3.min(dataset, d => d[0]);
  let yMax = d3.max(dataset, (d) => d[1]);
  let yMin = d3.min(dataset, d => d[1]);

  //RESIZE INSIDE FETCH
  function resize(){
    // redefine core width and height variables based on new style values
    width = parseInt(select('#main-svg').style("width"));
    height = parseInt(select('#main-svg').style("height"));
  
    //padding
    let padding = 40;
    //margin
    let margin = { 
      top: padding, 
      right: padding, 
      bottom: padding, 
      left: padding + 10
    };
    innerWidth = width - margin.left - margin.right;
    innerHeight = height - margin.top - margin.bottom; 
  
    // update scale ranges for new width and height
    xScale = scaleTime()
      .domain([xMin, xMax])
      .range([0, innerWidth])
    ;
    yScale = scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);
  
    // update x and y axes
    select('#x-axis')
      .call(xAxis)
      .attr("transform", `translate(0, ${innerHeight})`);
    
    select('#y-axis')
    .attr("transform", `translate(${0}, 0)`)
    .style("color", "var(--main-text-color)")
    .style("font-size", "0.9rem")
    .attr("id", "y-axis")
    .call(yAxis)
    //move all but the first tick text to the right of the axis and above the line
    .call(g => g.selectAll(".tick:not(:first-of-type) text")
      .attr("x", 2)
      .attr("dy", -3)
      .attr("text-anchor", "start")
    )
    //remove the first tick text ($0), because it overlaps with mark rects 
    //with this style
    .call(g => g.select(`.tick:nth-of-type(1) text`)
      .remove())
    //format tick text to local (US) currency with two significant digits
    .call(g => g.selectAll(`.tick text`)
      .text(t => yTickText(t))
    )
    //remove the y axis domain path for style
    .call(g => g.select(".domain")
          .remove())
    // draw tick line across whole chart
    .call(g => g.selectAll(".tick line")
      .attr("transform", `translate(${0}, 0)`)
      .attr(`x1`, 0)
      .attr(`x2`, innerWidth)
      .attr("z-index", "-1")
      .attr("stroke-opacity", 0.3)
    )


      // .call(yAxis)
      // // draw tick line across whole chart
      // .call(g => g.selectAll(".tick line")
      //   .attr("transform", `translate(${0}, 0)`)
      //   .attr(`x1`, 0)
      //   .attr(`x2`, innerWidth)
      // )
      ;
  
    // update text label on y-axis
    select('#y-label')
      .attr("transform", `translate(${-10}, ${innerHeight / 2}) rotate(270)`)
  
    //recalulate and update bars
  
    //reset bar width (unnecessary?)
    barWidth = innerWidth / dataset.length + 1
  
    //reset bar values
    innerGroup.selectAll(".bar")
      .attr("width", barWidth)
      .attr("height", (d) => (yScale(0) - yScale(d[1])))
      .attr("x", (d) => xScale(d[0]))
      .attr("y",(d) => yScale(d[1]))
  }

  // Add listener for window resize, activate custom resize function
  d3.select(window).on('resize', resize);


  // barColor separated into 1) scaling y value into val between 0 and 1; and
  // let scaleForColors = d3.scaleSequential()
  //   .domain([0, yMax])
  //   .range([0, 1])
  //   ;
  // 2) applying color interpolation effect
  // let colorMaker = (valueScaledForColors) => 
  //   d3.interpolateReds(scaleColors(valueScaledForColors))

  let barColor = (d) => {
    // Given a number in the range [0,1], interpolateReds returns the 
    // corresponding color in the "Reds" sequential color scheme represented 
    //as an RGB string.
    return d3.interpolateReds(
      //produce the number in the range [0, 1] by using the scaleSequential
      //method within the domain of the bar value, and ferrying the data point
      // to scaleSequential
      d3.scaleSequential()
        .domain([0, yMax])
        .range([0, 1])
        (d));
  }

  let xScale = d3.scaleTime()
    .domain([xMin, xMax])
    .range([0, innerWidth])
    // .nice() // common practice, skip here for test
    ;

  let yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([innerHeight, 0]);


// initialize and append xAxis 
let xAxis = d3.axisBottom(xScale);
innerGroup.append("g")
  .attr("transform", `translate(0, ${innerHeight})`)
  .attr("id", "x-axis")
  .call(xAxis)
  .call(g => g.select(".domain")
    .style("color", "var(--main-text-color)")
    .attr("stroke-opacity", 0.3))
    .style("font-size", "0.9rem")
  ;

// initialize and append yAxis
const yAxis = d3.axisLeft(yScale);
innerGroup.append("g")
  .attr("transform", `translate(${0}, 0)`)
  .style("color", "var(--main-text-color)")
  .style("font-size", "0.9rem")
  .attr("id", "y-axis")
  .call(yAxis)
  //move all but the first tick text to the right of the axis and above the line
  .call(g => g.selectAll(".tick:not(:first-of-type) text")
    .attr("x", 2)
    .attr("dy", -3)
    .attr("text-anchor", "start")
  )
  //remove the first tick text ($0), because it overlaps with mark rects 
  //with this style
  .call(g => g.select(`.tick:nth-of-type(1) text`)
    .remove())
  //format tick text to local (US) currency with two significant digits
  .call(g => g.selectAll(`.tick text`)
    .text(t => yTickText(t))
  )
  //remove the y axis domain path for style
  .call(g => g.select(".domain")
        .remove())
  // draw tick line across whole chart
  .call(g => g.selectAll(".tick line")
    .attr("transform", `translate(${0}, 0)`)
    .attr(`x1`, 0)
    .attr(`x2`, innerWidth)
    .attr("z-index", "-1")
    .attr("stroke-opacity", 0.3)
  )
  .append("text")
  .text("Gross Domestic Product")
  .style("fill", "var(--main-text-color)")
  .attr("transform", `translate(${-10}, ${innerHeight / 2}) rotate(270)`)
  .attr("text-anchor", "middle")
  .style("font-size", "1.5rem")
  .attr("id", "y-label")
  ;

  let tooltip = d3.select("main")
    .append("div")
    .style("opacity", 1)
    .style("z-index", 20)
    .style("background", `hsla(220, 40%, 20%, 0.9)`)
    .style("border-width", "1px")
    .style("border-radius", "2px")
    .style("padding", "0px 5px")
    .style("position", "absolute")
    .style("font-size", "1rem")
    .style("text-align", "center")
    .attr("id", "tooltip")
    ;

    let handleMouseOver = function(event, d) {
      d3.select(event.currentTarget)
        .attr("opacity", 0.5);
      d3.select('#tooltip')
        .attr("data-date", d[4])
        .html(`<p>${d[2]}</p><p>${d[3]} Billion</p>`)
        // .style("top", `${event.pageY}px`)
        .style("top", `${clamp(0, event.pageY - 100, 1000)}px`)
        .style("left", `${clamp(0, event.pageX - 50, 1000)}px`)

        // .style("top", `${200}px`)
        .transition()
        .duration('50')
        .style("opacity", 1)
    ;
    }

    let handleMouseOut = function(event, d) {
      d3.select(event.currentTarget)
        .attr("opacity", "1")

      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }

  // Blood for the blood god, bars for the Bar Chart
    let barWidth = innerWidth / dataset.length + 1; 

  innerGroup
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    // .attr("margin", 1)
    .attr("width", barWidth)
    .attr("height", (d) => (yScale(0) - yScale(d[1])))
    .attr("fill", d => barColor(d[1]))
    .attr("class", "bar")
    .attr("data-date", d => d[4] )
    .attr("data-gdp", d => d[5])
    .text( (d) => `${d[0]}, ${d[1]}`)
    .attr("x", (d) => xScale(d[0]))
    .attr("y",(d) => yScale(d[1]))
    .on("mouseover mousemove focus pointerover", handleMouseOver
    )
    // .on("mousemove", handleMouseMove)
    .on("mouseout pointerleave pointerout", handleMouseOut)
    ;

    

  // innerGroup
  // .append("circle")
  // .attr("cx", 30)
  // .attr("cy", 30)
  // .attr("r", 50)
  // .attr("fill", "red");

  


  }

 
    
);
