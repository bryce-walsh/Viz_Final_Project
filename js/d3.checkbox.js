function d3CheckBox () {

    var size = 18,
        x = 0,
        y = 0,
        rx = 0,
        ry = 0,
        markStrokeWidth = 1,
        boxStrokeWidth = 2,
        checked = true,
        clickEvent;

    function checkBox (selection) {

        var g = selection.append("g"),
            box = g.append("rect")
            .attr("width", size)
            .attr("height", size)
            .attr("x", x)
            .attr("y", y)
            .attr("rx", rx)
            .attr("ry", ry)
            .style("fill", "lightgray")
            .style("stroke-width", boxStrokeWidth)
            .style("stroke", "lightgray")
            .style("cursor", "pointer");

        //Data to represent the check mark
        var coordinates = [
            {x: x + (size / 5), y: y + (size / 2)},
            {x: x + (size / 2.2), y: (y + size) - (size / 4)},
            {x: (x + size) - (size / 5), y: (y + (size / 5))}
        ];

        var line = d3.line()
                .x(function(d){ return d.x; })
                .y(function(d){ return d.y; })
                .curve(d3.curveLinear);

        var mark = g.append("path")
            .attr("d", line(coordinates))
            .style("stroke-width", markStrokeWidth)
            .style("stroke", "black")
            .style("fill", "none")
            .style("opacity", (checked)? 1 : 0)
            .style("cursor", "pointer");

        g.on("click", function () {
            checked = !checked;
            update_barchart_year();
            mark.style("opacity", (checked)? 1 : 0);

            if(clickEvent)
                clickEvent();

            d3.event.stopPropagation();
        });

    }

    checkBox.size = function (val) {
        size = val;
        return checkBox;
    }

    checkBox.x = function (val) {
        x = val;
        return checkBox;
    }

    checkBox.y = function (val) {
        y = val;
        return checkBox;
    }

    checkBox.rx = function (val) {
        rx = val;
        return checkBox;
    }

    checkBox.ry = function (val) {
        ry = val;
        return checkBox;
    }

    checkBox.markStrokeWidth = function (val) {
        markStrokeWidth = val;
        return checkBox;
    }

    checkBox.boxStrokeWidth = function (val) {
        boxStrokeWidth = val;
        return checkBox;
    }

    checkBox.checked = function (val) {

        if(val === undefined) {
            return checked;
        } else {
            checked = val;
            return checkBox;
        }
    }

    checkBox.clickEvent = function (val) {
        clickEvent = val;
        return checkBox;
    }

    return checkBox;
}