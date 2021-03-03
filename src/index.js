import * as d3 from 'd3';
import { examplo } from './examplo';
import './index.scss';

console.log(examplo);

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

  console.log(Object.keys(root));
  console.log(root);
  console.log("here comes the data inside d3.json():");

  dataset = root.data.map((d) => {
    return [new Date(d[0]), d[1]];
  });

  console.log(dataset);

  //chart parameters
  //width & height
  const w = 1000;
  const h = 500;
  //padding
  const p = 40;

  let xMax = d3.max(dataset, (d) => d[0]);
  let yMax = d3.max(dataset, (d) => d[1]);

  let scaleColors = d3.scaleLinear()
        .domain([0, yMax])
        .range([0, 360]);

  const xScale = d3.scaleLinear()
                    .domain([0, xMax])
                    .range([p, w - p]);

  const yScale = d3.scaleLinear()
                    .domain([0, yMax])
                    .range([h - p, p]);

  const mainSvg = d3.select("#svg-div")
  .append("svg")
  .attr("width", w)
  .attr("height", h)

  //background on chart
  // mainSvg
  //   .append("rect")
  //   .attr("width", w)
  //   .attr("height", h)
  //   .attr("fill", `hsla(0, 00%, 90%, 1)`)
  // ;


  // mainSvg
  //   .selectAll("text")
  //   .data(dataset)
  //   .enter()
  //   .append("text")
  //   .text( (d) => `${d[0]}, ${d[1]}`)
  //   .attr("x", (d) => xScale(d[0]))
  //   .attr("y", (d) => yScale(d[1]))
  //   ;

  mainSvg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("margin", 1)
    .attr("width", 2)
    .attr("height", (d) => d[1])
    .attr("fill", (d) => 
      `hsla(${scaleColors(d[1])}, 50%, 50%, 1 )`
    )
    .text( (d) => `${d[0]}, ${d[1]}`)
    .attr("x", (d) => xScale(d[0]))
    .attr("y",(d) => yScale(d[1]))
    ;

const xAxis = d3.axisBottom(xScale);

mainSvg.append("g")
  .attr("transform", `translate(0, ${h - p})`)
  .attr("color", "black")
  .call(xAxis);

const yAxis = d3.axisLeft(yScale);
mainSvg.append("g")
  .attr("transform", `translate(${p}, 0)`)
  .attr("color", "black")
  .call(yAxis);

  mainSvg
  .append("circle")
  .attr("cx", 30)
  .attr("cy", 30)
  .attr("r", 50)
  .attr("fill", "red");



  }
    
);
