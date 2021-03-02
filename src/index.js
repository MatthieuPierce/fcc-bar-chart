import * as d3 from 'd3';
import { examplo } from './examplo';
import './index.scss';

console.log("run from index.js");
console.log(examplo);

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