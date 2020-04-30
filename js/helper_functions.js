// Load external data and boot
function loadData(year) {
  d3.queue()
  .defer(d3.json, "js/world.geojson")
  .defer(d3.csv, "ND_GAIN_Data/gain/gain_no_nans.csv", function(d) {  gainData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Emissions_Data/Emissions_with_ISO3.csv", function(d) { ghgData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "ND_GAIN_Data/gain/gain_rankings.csv", function(d) {  gainRankData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Emissions_Data/emissions_rankings.csv", function(d) {  ghgRankData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Emissions_Data/emissions_per_cap_no_nans.csv", function(d) {perCapGhgData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Emissions_Data/emissions_per_cap_rankings.csv", function(d) {perCapGhgRankData.set(d.ISO3, +d[year]); })
  .await(ready);
}

function set_up_color_scales() {
  gainColorScale = d3.scaleLinear()
              .domain([GAIN_MIN, GAIN_MAX])
              //Right to Left because GAIN index is backwards from risk
              .range([BOTTOM_RIGHT, BOTTOM_LEFT]);
  ghgColorScale =  d3.scaleLinear()
              .domain([EMISSIONS_MIN, EMISSIONS_MAX])
              .range([BOTTOM_LEFT, TOP_LEFT]);
  perCapGhgColorScale = d3.scaleLinear()
              .domain([GAIN_MIN, GAIN_MAX])
              .range([BOTTOM_LEFT, TOP_LEFT]);
}

/*** Function to get Country Values ***/
function displayVals(d, i){
  //Assign Country Name
  d3.select("#country")
    .text(d.properties.name)
  if (per_capita == true){
      gainVal = gainData.get(d.id)
      d3.select("#emissions_tag")
        .text("Emissions (Per Capita), Rank")
      if (typeof gainVal == 'undefined') {
        d3.select("#risk_val")
            .text("No Value")
      } else {
          gainVal = Math.round((gainVal + Number.EPSILON) * 100) / 100
          gainRank = gainRankData.get(d.id)
          d3.select("#risk_val")
            .text(String(gainVal) + ", " + String(gainRank))
      }
      ghgVal = perCapGhgData.get(d.id)
      if (typeof ghgVal == 'undefined') {
        d3.select("#emissions_val")
            .text("No Value")
      } else {
          ghgVal = Math.round((ghgVal + Number.EPSILON) * 100) / 100
          ghgRank = perCapGhgRankData.get(d.id)
          d3.select("#emissions_val")
            .text(String(ghgVal) + ", " + String(ghgRank))
      }
  } else{
      gainVal = gainData.get(d.id)
      d3.select("#emissions_tag")
        .text("Emissions (Total), Rank")
      if (typeof gainVal == 'undefined') {
        d3.select("#risk_val")
            .text("No Value")
      } else {
          gainVal = Math.round((gainVal + Number.EPSILON) * 100) / 100
          gainRank = gainRankData.get(d.id)
          d3.select("#risk_val")
            .text(String(gainVal) + ", " + String(gainRank))
      }
      ghgVal = ghgData.get(d.id)
      if (typeof ghgVal == 'undefined') {
        d3.select("#emissions_val")
            .text("No Value")
      } else {
          ghgVal = Math.round((ghgVal + Number.EPSILON) * 100) / 100
          ghgRank = ghgRankData.get(d.id)
          d3.select("#emissions_val")
            .text(String(ghgVal) + ", " + String(ghgRank))
      }
  }
}

/***********************/

/********* Timeline drag **************/

function dragged(value) {
    var x = xScale.invert(value), index = null, midPoint, cx, year;
    if(step) {
        // if step has a value, compute the midpoint based on range values and reposition the slider based on the mouse position
        for (var i = 0; i < rangeValues.length - 1; i++) {
            if (x >= rangeValues[i] && x <= rangeValues[i + 1]) {
                index = i;
                break;
            }
        }
        midPoint = (rangeValues[index] + rangeValues[index + 1]) / 2;
        if (x < midPoint) {
            cx = xScale(rangeValues[index]);
            year = rangeValues[index];
        } else {
            cx = xScale(rangeValues[index + 1]);
            year = rangeValues[index + 1];
        }
    } else {
        // if step is null or 0, return the drag value as is
        cx = xScale(x);
        year = x.toFixed(3);
    }
    // use xVal as drag value
    loadData(year);
    handle.attr('cx', cx);
}

/***********************/

/********** Map Zoom *********/

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
  g.attr("transform", d3.event.transform);
}

function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

function average(array) {
  return array.reduce((a, b) => a + b) / array.length;
}

/***********************/

/********** Color countries based on value *********/

function fillCountryColor() {
  displayPerCap = per_capita;
  var ghgMidpoint = average(ghgData.values());
  var gainMidpoint = average(gainData.values());
  var perCapMidpoint = average(perCapGhgData.values());
  g.selectAll("path")
    .attr("fill", function (d) {

          ghgVal = ghgData.get(d.id);
          gainVal = gainData.get(d.id);
          perCapGhgVal = perCapGhgData.get(d.id);
          ghgDisplayVal = displayPerCap ? perCapGhgVal : ghgVal; 

          ghgDisplayMidpoint = displayPerCap ? perCapMidpoint : ghgMidpoint

          if (typeof ghgDisplayVal == 'undefined' || typeof gainVal == 'undefined') {
            return NO_DATA;
          } else if (ghgDisplayVal <= ghgDisplayMidpoint && gainVal >= gainMidpoint) {
            return BOTTOM_LEFT;
          } else if (ghgDisplayVal > ghgDisplayMidpoint && gainVal >= gainMidpoint) {
            return TOP_LEFT;
          } else if (ghgDisplayVal <= ghgDisplayMidpoint && gainVal < gainMidpoint) {
            return BOTTOM_RIGHT;
          } else if (ghgDisplayVal > ghgDisplayMidpoint && gainVal < gainMidpoint) {
            return TOP_RIGHT;
          } else {
            return "black";
          }
        })
}
function fillGainColor() {
  var gainMidpoint = average(gainData.values());
  g.selectAll("path")
    .attr("fill", function (d) {
          if (typeof gainData.get(d.id) == 'undefined') {
            return NO_DATA;
          } else {
            return gainColorScale(gainData.get(d.id));
          }
        })
}
function fillEmissionsColor() {
  displayPerCap = per_capita;
  g.selectAll("path")
    .attr("fill", function (d) {
          ghgVal = ghgData.get(d.id);
          perCapGhgVal = perCapGhgData.get(d.id);
          ghgDisplayVal = displayPerCap ? perCapGhgVal : ghgVal ;
          ghgDisplayColorScale = displayPerCap ? perCapGhgColorScale : ghgColorScale;
          if (typeof ghgDisplayVal == 'undefined') {
            return NO_DATA;
          } else {
            return ghgDisplayColorScale(ghgDisplayVal);
          }
        })
}

/***********************/

/********** Change map display *********/

function dispGain(){

    display = DisplayType.GAIN;
    var maxRisk = d3.select('#Max_Risk')
                  .attr('opacity', 100)
    var maxCombo = d3.select('#Max_Combo')
                  .attr('opacity', 0)
    var maxEmissions = d3.select('#Max_Emissions')
                          .attr('opacity', 0)
    reload_map();
}
function dispEmissions(){
    display = DisplayType.EMISSIONS;
    var maxRisk = d3.select('#Max_Risk')
                  .attr('opacity', 0)
    var maxCombo = d3.select('#Max_Combo')
                  .attr('opacity', 0)
    var maxEmissions = d3.select('#Max_Emissions')
                          .attr('opacity', 100)
    reload_map();
}

function dispCombo(){
    display = DisplayType.COMBO;
    var maxRisk = d3.select('#Max_Risk')
                  .attr('opacity', 100)
    var maxCombo = d3.select('#Max_Combo')
                  .attr('opacity', 100)
    var maxEmissions = d3.select('#Max_Emissions')
                          .attr('opacity', 100)
    reload_map();
}

function reload_map() {
    switch (display) {
      case DisplayType.EMISSIONS:
        fillEmissionsColor();
        break;
      case DisplayType.GAIN:
        fillGainColor();
        break;
      case DisplayType.COMBO:
        fillCountryColor()
    }
}

/***********************/
