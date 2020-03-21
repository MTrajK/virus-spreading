(function () {
    'use strict';

    /****************
     * The whole chart logic is here.
     * The chart canvas ratio is always 10:1.
    ****************/

    var chartCanvas, chartDimensions, context, maxValue,
        currentStep, dangerSick, safeSick, healthy, recovered;

    function drawLine(height, from, to) {
        context.beginPath();
        context.moveTo(from, height);
        context.lineTo(to, height);
        context.closePath();

        context.strokeStyle = '#eee';
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
        currentStep = 0;
    }

    function update(data) {
        // save the values as percentages
        var sickValue = maxValue - data.sick;
        var healthyValue = sickValue - data.healthy;
        var recoveredValue = healthyValue - data.recovered;
        sickValue /= maxValue;
        healthyValue /= maxValue;
        recoveredValue /= maxValue;

        dangerSic.push(sickValue);
        safeSick.push(Math.max(sickValue, Common.chartSafeLimit));
        healthy.push(healthyValue);
        recovered.push(recoveredValue);
    }

    function draw() {
        // The chart canvas width and height can be found using offsetWidth and offsetHeight
        var width = chartDimensions.offsetWidth;
        var height = chartDimensions.offsetHeight;
        var stepSize = width / (Common.totalFrames - 1); // minus the first frame/result, because that's the start of the chart
        var currentStepSize = currentStep * stepSize;

        // update dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        chartCanvas.width = width;
        chartCanvas.height = height;

        // draw empty rect (the upcoming time)
        drawRect('#eee', currentStepSize, 0, width - currentStepSize, height);

        // draw dead line (a whole rectangle, the elapsed time)
        drawRect('#000', 0, 0, currentStepSize, height);

        // draw recovered line
        drawPolygon(recovered, '#CB8AC0', height, stepSize);

        // draw healthy line
        drawPolygon(healthy, '#AAC6CA', height, stepSize);

        // draw danger sick line
        drawPolygon(dangerSick, 'brown', height, stepSize);

        // draw "safe" sick line
        drawPolygon(safeSick, '#BB641D', height, stepSize);

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