import * as d3 from 'd3';
import './index.scss';

function makeDivForChart(){
  const element = document.createElement('div');

  element.setAttribute("id", "svg-div");

  return element;
}
document.getElementById("main").appendChild(makeDivForChart());

let dataset;

//fetch dataset from:
let gdpUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

d3.json(gdpUrl).then(function(root) {

  console.log(`object fetched by d3.json:`)
  console.log(root);

  let quarterFormat = d3.timeFormat("%Y Q%q");

  dataset = root.data.map((d) => {
    let dateProper = new Date(d[0]);
    // let year = dateProper.getFullYear();
    // let quarter = Math.floor(dateProper.getMonth() / 3) + 1;
    // let quarterString = `${year} Q${quarter}`;
    let quarterString = quarterFormat(dateProper);
    return [dateProper, d[1], quarterString];
  });
  console.log(`dataset after processing:`); 
  console.log(dataset);

  //chart parameters
  //padding
  const padding = 40;
  //margin
  const margin = { 
    top: padding, 
    right: padding, 
    bottom: padding, 
    left: padding 
  };

   //width & height
  const width = 1000;
  const height = 500;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom; 
   

  let xMax = d3.max(dataset, (d) => d[0]);
  let xMin = d3.min(dataset, d => d[0]);
  let yMax = d3.max(dataset, (d) => d[1]);
  let yMin = d3.min(dataset, d => d[1]);


  let scaleColors = d3.scaleLinear()
        .domain([0, yMax])
        .range([0, 100]);

  const xScale = d3.scaleTime()
                    .domain([xMin, xMax])
                    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
                    .domain([0, yMax])
                    .range([innerHeight, 0]);

  const mainSvg = d3.select("#svg-div")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background", `hsla(0,0%, 100%, 0.8)`)
  ;

  const innerGroup = mainSvg.append("g")
    // .attr("width", innerWidth)
    // .attr("height", innerHeight)
    // .style("background-color", `green`)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // mainSvg
  //   .selectAll("text")
  //   .data(dataset)
  //   .enter()
  //   .append("text")
  //   .text( (d) => `${d[0]}, ${d[1]}`)
  //   .attr("x", (d) => xScale(d[0]))
  //   .attr("y", (d) => yScale(d[1]))
  //   ;

  // Bars for the Bar Chart
  innerGroup
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("margin", 1)
    .attr("width", 3)
    .attr("height", (d) => (yScale(0) - yScale(d[1])))
    .attr("fill", (d) => 
      `hsla( 0, ${scaleColors(d[1])}%, ${ ( scaleColors(d[1]) + 45 ) / 2}%, 1 )`
    )
    .attr("class", "bar")
    .property("data-date", d => d[0] )
    .property("data-gdp", d => d[1])
    .text( (d) => `${d[0]}, ${d[1]}`)
    .attr("x", (d) => xScale(d[0]))
    .attr("y",(d) => yScale(d[1]))
    ;

const xAxis = d3.axisBottom(xScale);

console.log(xScale.ticks());

innerGroup.append("g")
  .attr("transform", `translate(0, ${innerHeight})`)
  .attr("color", "black")
  .attr("id", "x-axis")
  .call(xAxis);

const yAxis = d3.axisLeft(yScale);
innerGroup.append("g")
  .attr("transform", `translate(${0}, 0)`)
  .attr("color", "black")
  .attr("id", "y-axis")
  .call(yAxis)
  .call(g => g.selectAll(".tick text")
  .attr("x", 35))
  ;

  // innerGroup
  // .append("circle")
  // .attr("cx", 30)
  // .attr("cy", 30)
  // .attr("r", 50)
  // .attr("fill", "red");



  }
    
);
