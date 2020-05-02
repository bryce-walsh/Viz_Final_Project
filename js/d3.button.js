d3.button = function() {

  var dispatch = d3.dispatch('press', 'release');

  var padding = 5,
      radius = 0,
      stdDeviation = 1,
      offsetX = 1,
      offsetY = 1;

  function my(selection) {
    selection.each(function(d, i) {
      var g = d3.select(this)
          .attr('id', 'd3-button' + i)
          .attr('transform', 'translate(' + d.x + ',' + d.y + ')');

      if (d.label == "+") {
        var text = g.append('text').text(d.label);
        var defs = g.append('defs');
        var bbox = text.node().getBBox();
        var rect = g.insert('rect', 'text')
            .attr("x", bbox.x - 7)
            .attr("y", bbox.y - .5 * 7)
            .attr("width", bbox.width + 2 * 7)
            .attr("height", bbox.height + 7)
            .classed("button", false)
            .attr('rx', radius)
            .attr('ry', radius)
            .on('click', function() {
                  zoom.scaleBy(svg.transition().duration(750), 1.3);
            });
      } else if (d.label == "–") {
        var text = g.append('text').text(d.label);
        var defs = g.append('defs');
        var bbox = text.node().getBBox();
        var rect = g.insert('rect', 'text')
            .attr("x", bbox.x - 7)
            .attr("y", bbox.y - .5 * 7)
            .attr("width", bbox.width + 2 * 7)
            .attr("height", bbox.height + 7)
            .classed("button", false)
            .attr('rx', radius)
            .attr('ry', radius)
            .on('click', function() {
                  zoom.scaleBy(svg, 1 / 1.3);
            });
       } else {
          var text = g.append('text').text(d.label);
          var defs = g.append('defs');
          var bbox = text.node().getBBox();
          var rect = g.insert('rect', 'text')
              .attr("x", bbox.x - padding)
              .attr("y", bbox.y - padding)
              .attr("width", bbox.width + 2 * padding)
              .attr("height", bbox.height + 2 * padding)
              .attr('rx', radius)
              .attr('ry', radius)
              .on('click', toggle);
           addShadow.call(g.node(), d, i);
       }
    });
  }

  function addShadow(d, i) {
    var defs = d3.select(this).select('defs');
    var rect = d3.select(this).select('rect').attr('filter', 'url(#dropShadow' + i + ")" );
    var shadow = defs.append('filter')
        .attr('id', 'dropShadow' + i)
        .attr('x', rect.attr('x'))
        .attr('y', rect.attr('y'))
        .attr('width', rect.attr('width') + offsetX)
        .attr('height', rect.attr('height') + offsetY)

    shadow.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', stdDeviation)

    shadow.append('feOffset')
        .attr('dx', offsetX)
        .attr('dy', offsetY);

    var merge = shadow.append('feMerge');

    merge.append('feMergeNode');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  function toggle(d, i) {
    press.call(this, d, i);
    if (d.label == "Risk Index") {
      dispGain();
    } else if (d.label == "Emissions") {
      dispEmissions();
    } else if (d.label == "Risk vs. Emissions") {
      dispCombo();
    }
    update_barchart_year();
    update_barchart_yaxis();
  }

  function press(d, i) {
    dispatch.call('press', this, d, i)
    d3.select(this).classed('pressed', true);
    var shadow = d3.select(this.parentNode).select('filter')
    if (!shadow.node()) return;
    shadow.select('feOffset').attr('dx', 0).attr('dy', 0);
    shadow.select('feGaussianBlur').attr('stdDeviation', 0);
  }

  function release(d, i) {
    dispatch.call('release', this, d, i)
    my.clear.call(this, d, i);
  }

  my.clear = function(d, i) {
    d3.select(this).classed('pressed', false);
    var shadow = d3.select(this.parentNode).select('filter')
    if (!shadow.node()) return;
    shadow.select('feOffset').attr('dx', offsetX).attr('dy', offsetY);
    shadow.select('feGaussianBlur').attr('stdDeviation', stdDeviation);
  }

  my.on = function() {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}