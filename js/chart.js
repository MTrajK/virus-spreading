(function () {
    'use strict';

    /****************
     * Chart logics and drawings.
     * The chart canvas ratio is always 10:1.
    ****************/

    var chartCanvas, chartDimensions, context, maxValue,
        currentStep, dangerSick, safeSick, healthy, recovered, dead;

    function drawLine(height, from, to) {
        context.beginPath();
        context.moveTo(from, height);
        context.lineTo(to, height);
        context.closePath();

        context.strokeStyle = Common.colors.chart.safeLine;
        context.stroke();
    }

    function drawRect(color, x, y, width, height) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    }

    function drawPolygon(data, color, height, stepSize) {
        context.beginPath();
        context.moveTo(0, height);

        var step = -stepSize;
        for (var i=0; i<data.length; i++) {
            step += stepSize;
            context.lineTo(step, data[i] * height);
        }

        context.lineTo(step, height);
        context.closePath();

        context.fillStyle = color;
        context.fill();
    }

    function init(chart, value) {
        // init parameters
        chartCanvas =  chart.canvas;
        chartDimensions = chart.dimensions;
        context = chartCanvas.getContext('2d');
        maxValue = value;
    }

    function clear() {
        // clear canvas
        chartCanvas.width = chartCanvas.height = 0;
    }

    function start() {
        // clean chart states
        dangerSick = [];
        safeSick = [];
        healthy = [];
        recovered = [];
        dead = [];
        currentStep = 0;
    }

    function update(data) {
        // save the values as percentages
        var sickValue = maxValue - data.sick;
        var healthyValue = sickValue - data.healthy;
        var recoveredValue = healthyValue - data.recovered;
        var deadValue = recoveredValue - data.dead;
        sickValue /= maxValue;
        healthyValue /= maxValue;
        recoveredValue /= maxValue;
        deadValue /= maxValue

        dangerSick.push(sickValue);
        safeSick.push(Math.max(sickValue, Common.chartSafeLimit));
        healthy.push(healthyValue);
        recovered.push(recoveredValue);
        dead.push(deadValue);
    }

    function draw() {
        // The chart canvas width and height can be found using offsetWidth and offsetHeight
        var width = chartDimensions.offsetWidth;
        var height = chartDimensions.offsetHeight;
        var stepSize = width / (Common.simulation.totalFrames - 1); // minus the first frame/result, because that's the start of the chart
        var currentStepSize = currentStep * stepSize;

        // update dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        chartCanvas.width = width;
        chartCanvas.height = height;

        // draw empty rect (the upcoming time)
        drawRect(Common.colors.chart.empty, currentStepSize, 0, width - currentStepSize, height);

        // draw vaccinated part (a whole rectangle, the elapsed time)
        drawRect(Common.colors.chart.vaccinated, 0, 0, currentStepSize, height);

        // draw dead part
        drawPolygon(dead, Common.colors.chart.dead, height, stepSize);

        // draw recovered part
        drawPolygon(recovered, Common.colors.chart.recovered, height, stepSize);

        // draw healthy part
        drawPolygon(healthy, Common.colors.chart.healthy, height, stepSize);

        // draw danger sick part
        drawPolygon(dangerSick, Common.colors.chart.dangerSick, height, stepSize);

        // draw "safe" sick part
        drawPolygon(safeSick, Common.colors.chart.safeSick, height, stepSize);

        // draw "safe" line
        drawLine(height * Common.chartSafeLimit, 0, currentStepSize);

        currentStep++;
    }

    // export Chart (only the public methods)
    window.Chart = {
        init: init,
        clear: clear,
        start: start,
        update: update,
        draw: draw
    };

}());