import { select, scaleTime, scaleLinear, selectAll } from 'd3';

export const resize = () => {

  // redefine core width and height variables based on new style values
  let width = parseInt(select('#main-svg').style("width"));
  let height = parseInt(select('#main-svg').style("height"));

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
    .call(yAxis)
    // draw tick line across whole chart
    .call(g => g.selectAll(".tick line")
      .attr("transform", `translate(${0}, 0)`)
      .attr(`x1`, 0)
      .attr(`x2`, innerWidth)
    );

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
