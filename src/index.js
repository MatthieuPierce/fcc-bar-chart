import * as d3 from 'd3';
import './index.scss';

//function to create main chart div with plain JS (not D3)
// no good reason for this, just practice making html in plain js
function makeDivForChart(){
  const element = document.createElement('div');
  element.setAttribute("id", "svg-div");

  return element;
}
//append chart-div to the "main" element
document.getElementById("main").appendChild(makeDivForChart());



// Date formater for display in tooltip per test criteria
//I.e. "YYYY QX", 2020 Q4
let quarterFormat = d3.timeFormat("%Y Q%q");

//INITIAL CHART PARAMETERS

//padding
const padding = 40;

//margin
const margin = { 
top: padding, 
right: padding, 
bottom: padding, 
left: padding + 10
};

//width & height
const width = 1000;
const height = 500;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom; 

//main chart SVG
const mainSvg = d3.select("#svg-div")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background", `hsla(0,0%, 70%, 0.1)`)
  .style("color", "var(--main-text-color)")
  .attr("id", "main-svg")
;

//Margin Convention - group all in-chart components, translate over and down
// to create margins
const innerGroup = mainSvg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .attr("id", "inner-group")
  ;

// y-axis tick text format logic
//format tick text to local (US) currency with two significant digits
// and remove any trailing .0
let yTickText = (tick) => d3.format("$.2s")(tick).replace('.0', '')


let dataset;
//Dataset source
let gdpUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';



//Fetch data and generate marks
d3.json(gdpUrl).then(function(root) {

  console.log(`object fetched by d3.json:`)
  console.log(root);

  dataset = root.data.map((d) => {
    //parse date string from dataset into js Date
    let dateProper = new Date(d[0]);
    let quarterString = quarterFormat(dateProper);
    //convert GDP value (in billions in the dataset) to full value
    let fullDollars = d[1] * 1e9;
    return [dateProper, fullDollars, quarterString];
  });
  console.log(`dataset after processing:`); 
  console.log(dataset);

  //min and max values from dataset, to be reused
  let xMax = d3.max(dataset, (d) => d[0]);
  let xMin = d3.min(dataset, d => d[0]);
  let yMax = d3.max(dataset, (d) => d[1]);
  let yMin = d3.min(dataset, d => d[1]);

  // color scale for y axis (sequential scale of Reds)
  // let scaleForColors = d3.scaleSequential()
  //   .domain([0, yMax])
  //   .range([0, 1])
  //   ;

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

  const xScale = d3.scaleTime()
    .domain([xMin, xMax])
    .range([0, innerWidth])
    // .nice() // common practice, skip here for test
    ;

  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([innerHeight, 0]);


// initialize and append xAxis 
const xAxis = d3.axisBottom(xScale);
innerGroup.append("g")
  .attr("transform", `translate(0, ${innerHeight})`)
  .attr("id", "x-axis")
  .call(xAxis)
  .call(g => g.select(".domain")
    .style("color", "var(--main-text-color)")
    .attr("stroke-opacity", 0.3))
  ;

// initialize and append yAxis
const yAxis = d3.axisLeft(yScale);
innerGroup.append("g")
  .attr("transform", `translate(${0}, 0)`)
  .style("color", "var(--main-text-color)")
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
  ;

  let tooltip = d3.select("main")
    .append("div")
    .style("opacity", 0)
    .style("z-index", 20)
    .style("background", `hsla(220, 40%, 20%, 1)`)
    .style("border-width", "1px")
    .style("border-radius", "2px")
    .style("padding", "15px")
    .style("position", "absolute")
    .attr("id", "tooltip")
    // .attr("height", "500px")
    // .attr("width", "500px")
    // .text("unmodified tooltip");

    let handleMouseOver = function(event, d) {
      d3.select(event.currentTarget)
        .attr("opacity", 0.85);

      d3.select('#tooltip')
        .transition()
        .duration('50')
        .style("opacity", 1)
        .insert("p")
        .text("here's p for ya")
        // .text(`This will be the html.
        //         The time is: ${d[2]}. <br />
        //         The GDP is: ${d[1]}`)
        // .text("now  you see me")
        // .html(function(d){
        //   return `<p>${d[1]}Inner text ${d[2]}</p>`
        // })
        // .html('data of any sort<br></br><br />')
    }

    // let handleMouseMove = function(event, d) {       
    //     // .style("top", `${d3.pointer(event)[1]}px`)
    //     // .style("left", `${d3.pointer(event)[0]}px`)
    // }

    let handleMouseOut = function(event, d) {
      d3.select(event.currentTarget)
        .attr("opacity", "1")

      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.5)
    }

  // Blood for the blood god, bars for the Bar Chart
  innerGroup
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("margin", 1)
    .attr("width", 3)
    .attr("height", (d) => (yScale(0) - yScale(d[1])))
    .attr("fill", d => barColor(d[1]))
    .attr("class", "bar")
    .property("data-date", d => d[0] )
    .property("data-gdp", d => d[1])
    .text( (d) => `${d[0]}, ${d[1]}`)
    .attr("x", (d) => xScale(d[0]))
    .attr("y",(d) => yScale(d[1]))
    .on("mouseover", function(event, d) {
      d3.select(event.currentTarget)
        .attr("opacity", 0.75);
      d3.select('#tooltip')
        .transition()
        .duration('50')
        .style("opacity", 1)
        // .html('<div><p>candy capers</p></div>')
        // .insert("p")
        .text("here's p for ya")

    })
    // .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut)
    ;

    

  // innerGroup
  // .append("circle")
  // .attr("cx", 30)
  // .attr("cy", 30)
  // .attr("r", 50)
  // .attr("fill", "red");

  


  }

 
    
);
