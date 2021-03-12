import {quarterFormat, gdpText } from './formats'

export const datasetParse = (d) => {
  //parse date string from dataset into js Date for use in d3 scale/axes
  let dateProper = new Date(d[0]);

  //convert GDP value (in billions in the dataset) to full value for d3 scale
  let gdpProper = d[1] * 1e9;

  // Date string for display in tooltip per test criteria; "YYYY QX", 2020 Q4    
  let quarterString = quarterFormat(dateProper);

  // GDP value string for display in tooltip per test criteria
  let gdpString = gdpText(d[1]);

  let dateClassic = d[0];
  let gdpClassic = d[1]
  
  return {
    dateProper,
    //gdpProper for practical application, unused due to fcc test constraints
    gdpProper, 
    quarterString, 
    gdpString, 
    dateClassic,
    gdpClassic
  }
}