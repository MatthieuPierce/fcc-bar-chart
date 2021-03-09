import { timeFormat, format, } from 'd3';

// Date formater for display in tooltip per test criteria
//I.e. "YYYY QX", 2020 Q4
export const quarterFormat = timeFormat("%Y Q%q");

//Date formatter for data-date properties



// y-axis tick text format logic
//format tick text to local (US) currency with two significant digits
// and remove any trailing .0
export const yTickText = (tick) => format("$.2s")(tick)
  .replace('.0', '')
  .replace('G', 'B');


// GDP value string for display in tooltip per test criteria
export const gdpText = (v) => format("$,.5~r")(v);




// // Date formater for display in tooltip per test criteria
// //I.e. "YYYY QX", 2020 Q4
// export const quarterFormat = d3.timeFormat("%Y Q%q");

// //Date formatter for 


// // y-axis tick text format logic
// //format tick text to local (US) currency with two significant digits
// // and remove any trailing .0
// export const yTickText = (tick) => d3.format("$.2s")(tick)
//   .replace('.0', '')
//   .replace('G', 'B');


// // GDP value string for display in tooltip per test criteria
// export const gdpText = (v) => d3.format("$,.5~r")(v);
