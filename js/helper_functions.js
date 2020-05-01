// Load external data and boot
function loadData(year) {
  d3.queue()
  .defer(d3.json, "js/world.geojson")
  .defer(d3.csv, "ND_GAIN_Data/gain/risk.csv", function(d) {  riskData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Emissions_Data/Emissions_with_ISO3.csv", function(d) { ghgData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "ND_GAIN_Data/gain/risk_rankings.csv", function(d) {  riskRankData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Emissions_Data/emissions_rankings.csv", function(d) {  ghgRankData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Emissions_Data/emissions_per_cap_no_nans.csv", function(d) {perCapGhgData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Emissions_Data/emissions_per_cap_rankings.csv", function(d) {perCapGhgRankData.set(d.ISO3, +d[year]); })
  .defer(d3.csv, "Population_Data/Population_by_country.csv", function(d) { countryNames.set(d.ISO3, d.CountryName); })
  .await(ready);
}

function set_up_color_scales() {
  riskRange = [];
  for (i = 0; i < color_matrix.length; i++) {
    riskRange.push(color_matrix[i][0])
  }
  riskColorScale = d3.scaleQuantile()
              .domain([RISK_MIN, RISK_MAX])
              .range(riskRange);
  ghgColorScale =  d3.scaleQuantile()
              .domain([EMISSIONS_MIN, EMISSIONS_MAX])
              .range(color_matrix[0]);
  perCapGhgColorScale = d3.scaleQuantile()
              .domain([EMISSIONS_PER_CAP_MIN, EMISSIONS_PER_CAP_MAX])
              .range(color_matrix[0]);
}

//Get color matrix from the constant color list
function create_color_matrix() {
  var color_matrix = new Array(Math.sqrt(COLOR_LIST.length));

  for (var i = 0; i < color_matrix.length; i++) {
    color_matrix[i] = new Array(Math.sqrt(COLOR_LIST.length));
  };

  list_counter = 0;
  for (var y = 0; y < Math.sqrt(COLOR_LIST.length); y++){
    for (var x = 0; x < Math.sqrt(COLOR_LIST.length); x++) {
      color_matrix[x][y] = COLOR_LIST[list_counter];
      list_counter += 1;
    }
  }
  return color_matrix;
}

//Create the key using 
function create_key() {
  for (var x = 0; x < Math.sqrt(COLOR_LIST.length); x++){
    for (var y = 0; y < Math.sqrt(COLOR_LIST.length); y++) {
    keySvg.append("rect")
    .attr("id", "Square" + x + "_" + y)
    .attr("width", SQUARE_SIZE)
    .attr("height", SQUARE_SIZE)
    .attr("x",  BASE_X + SQUARE_SIZE * x + SPACE * x)
    .attr("y", keySvg.node().getBoundingClientRect().height*.9 - TEXT_HEIGHT - SQUARE_SIZE * y - SPACE * y)
    .attr("fill", color_matrix[x][y])
    }
  }
  keySvg.append("text")
  .style("fill", "black")
  .style("font-family", FONT)
    .style("font-size", "15px")
    .attr("y", BASE_X - 10)
    .attr("x", 0 - BASE_X * 1.2)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(270)")
    .text("Emissions");
  keySvg.append("text")
  .style("fill", "black")
  .style("font-family", FONT)
    .style("font-size", "15px")
    .attr("x", keySvg.node().getBoundingClientRect().width * .41)
    .attr("y", keySvg.node().getBoundingClientRect().height * .87)
    .attr("text-anchor", "middle")
    .text("Risk Index");
}


/*** Function to get Country Values ***/
function displayVals(d, i){
  //Assign Country Name
  d3.select("#country")
    .text(d.properties.name)
  if (per_capita == true){
      riskVal = riskData.get(d.id)
      d3.select("#emissions_tag")
        .text("Emissions (Per Capita), Rank")
      if (typeof riskVal == 'undefined') {
        d3.select("#risk_val")
            .text("No Value")
      } else {
          riskVal = Math.round((riskVal + Number.EPSILON) * 100) / 100
          riskRank = riskRankData.get(d.id)
          d3.select("#risk_val")
            .text(String(riskVal) + ", " + String(riskRank))
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
      riskVal = riskData.get(d.id)
      d3.select("#emissions_tag")
        .text("Emissions (Total), Rank")
      if (typeof riskVal == 'undefined') {
        d3.select("#risk_val")
            .text("No Value")
      } else {
          riskVal = Math.round((riskVal + Number.EPSILON) * 100) / 100
          riskRank = riskRankData.get(d.id)
          d3.select("#risk_val")
            .text(String(riskVal) + ", " + String(riskRank))
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
    update_barchart_year();
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

function valueToIndex(value, quantileArray) {
  for(var i = 0; i < quantileArray.length; i++) {
    if (value >= quantileArray[i] && (value <= quantileArray[i + 1] || quantileArray[i+1] == undefined)) {
      return i + 1;
    }
  }
  return 0;
}

function getQuantileArray(values) {
  values = values.sort();
  buckets = Math.sqrt(COLOR_LIST.length);
  quantileIncrement = 1.0 / buckets;
  quantileArray = [];
  for (var quantile = quantileIncrement; quantile < 1.0; quantile += quantileIncrement) {
    quantileArray.push(d3.quantile(values, quantile))
  }
  return quantileArray;
}

function fillCountryColor() {
  displayPerCap = per_capita;
  var ghgQuantileArray = getQuantileArray(ghgData.values());
  var riskQuantileArray = getQuantileArray(riskData.values());
  var perCapQuantileArray = getQuantileArray(perCapGhgData.values());
  g.selectAll("path")
    .attr("class", function (d) { return d.id; })
    .attr("fill", function (d) {
          ghgVal = ghgData.get(d.id);
          riskVal = riskData.get(d.id);
          perCapGhgVal = perCapGhgData.get(d.id);
          if (typeof ghgVal == 'undefined' || typeof riskVal == 'undefined' || typeof perCapGhgVal == 'undefined') {
            return NO_DATA;
          } else {
            riskCoordinate = valueToIndex(riskVal, riskQuantileArray);
            ghgCoordinate = displayPerCap ? valueToIndex(perCapGhgVal, perCapQuantileArray): valueToIndex(ghgVal, ghgQuantileArray); 
            return color_matrix[riskCoordinate][ghgCoordinate];
          } 
        });
}
function fillGainColor() {
  var riskMidpoint = average(riskData.values());
  g.selectAll("path")
    .attr("class", function (d) { return d.id; })
    .attr("fill", function (d) {
          if (typeof riskData.get(d.id) == 'undefined') {
            return NO_DATA;
          } else {
            return riskColorScale(riskData.get(d.id));
          }
        })
}
function fillEmissionsColor() {
  displayPerCap = per_capita;
  g.selectAll("path")
    .attr("class", function (d) { return d.id; })
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

    display = DisplayType.RISK;
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
      case DisplayType.RISK:
        fillGainColor();
        break;
      case DisplayType.COMBO:
        fillCountryColor()
    }
}

/***********************/
