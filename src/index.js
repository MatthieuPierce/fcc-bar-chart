import * as d3 from 'd3';

function component(){
  const element = document.createElement('div');

  element.setAttribute("class", "svg-div");

  return element;
}

document.body.appendChild(component());

const mainSvg = d3.select("div")
.append("svg")
.attr("width", 500)
.attr("height", 500);

mainSvg
.append("circle")
.attr("cx", 30)
.attr("cy", 30)
.attr("r", 10)
.attr("fill", "pink");