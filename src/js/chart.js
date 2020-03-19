(function () {
    'use strict';

    /****************
        The canvas ratio is always 10:1
        The responsive chart width could be found in chartDimensions.offsetWidth
        The responsive chart height could be found in chartDimensions.offsetHeight
    ****************/

    var chartCanvas, chartDimensions, context, totalSteps, maxValue, safeLimit,
        currentStep, sick, sickLimit, healthy, recovered;

    function drawRect(color, x, y, width, height) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    }

    function drawPolygon(data, color, dimensions, step) {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(0, dimensions.height);
        var stepI = 0;
        for (var i=0, stepI=0; i<data.length; i++, stepI+=step)
            context.lineTo(stepI, data[i] * dimensions.height);
        context.lineTo((data.length - 1) * step, dimensions.height);
        context.closePath();
        context.fill();
    }

    function drawLine(height, from, to) {
        context.strokeStyle = '#eee';
        context.beginPath();
        context.moveTo(from, height);
        context.lineTo(to, height);
        context.closePath();
        context.stroke();
    }

    function init(chart, steps, value, safeLimitPercentage) {
        // init parameters
        chartCanvas =  chart.canvas;
        chartDimensions = chart.dimensions;
        context = chartCanvas.getContext('2d');

        totalSteps = steps;
        maxValue = value;
        safeLimit = 1 - safeLimitPercentage;
    }

    function clear() {
        // clear canvas
        chartCanvas.width = chartCanvas.height = 0;
    }

    function start() {
        // clean chart states
        sick = [];
        sickLimit = [];
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

        sick.push(sickValue);
        sickLimit.push(Math.max(sickValue, safeLimit));
        healthy.push(healthyValue);
        recovered.push(recoveredValue);
    }

    function draw() {
        // update dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        var dimensions = {
            'width': chartDimensions.offsetWidth,
            'height': chartDimensions.offsetHeight
        }
        chartCanvas.width = dimensions.width;
        chartCanvas.height = dimensions.height;

        var step = dimensions.width / (totalSteps - 1);
        var currentStepSize = currentStep * step;

        // draw empty rect
        drawRect('#eee', currentStepSize, 0, dimensions.width - currentStepSize, dimensions.height);

        // draw dead line (the whole rectangle)
        drawRect('#000', 0, 0, currentStepSize, dimensions.height);

        // draw recovered line
        drawPolygon(recovered, '#CB8AC0', dimensions, step);

        // draw healthy line
        drawPolygon(healthy, '#AAC6CA', dimensions, step);

        // draw danger sick line
        drawPolygon(sick, 'brown', dimensions, step);

        // draw "safe" sick line
        drawPolygon(sickLimit, '#BB641D', dimensions, step);

        // draw limit line
        drawLine(dimensions.height * safeLimit, 0, currentStepSize);

        currentStep++;
    }

    /* Save these functions as global */
    window.Chart = {
        init: init,
        clear: clear,
        start: start,
        update: update,
        draw: draw
    };

}());