(function () {
    'use strict';

    var localDimensions = {
        width: 100, // 1 localDimensions.width is 1 local unit
        height: 100 * (1/10) // the canvas ratio is always 10:1
    };

    var lastData, sick, healthy, recovered, canvas, context, canvasDimensions, limit,
        currentStep, step, maxValue, healthyNumber, sickNumber, recoveredNumber, deadNumber;

    function getCanvasDimensions() {
        return {
            width: canvasDimensions.offsetWidth,
            height: canvasDimensions.offsetHeight,
            top: canvasDimensions.offsetTop,
            left: canvasDimensions.offsetLeft,
            scaleWidthRatio: canvasDimensions.offsetWidth / localDimensions.width
        }
    }

    function changeNumbers() {
        healthyNumber.innerHTML = lastData.healthy;
        sickNumber.innerHTML = lastData.sick;
        recoveredNumber.innerHTML = lastData.recovered;
        deadNumber.innerHTML = lastData.dead;
    }

    function drawRect(color, x, y, width, height) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    }

    function drawPolygon(data, color, dimensions) {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(0, dimensions.height);
        for (var i=0; i<sick.length; i++)
            context.lineTo(i * step * dimensions.scaleWidthRatio, data[i] * dimensions.height);
        context.lineTo(currentStep * dimensions.scaleWidthRatio, dimensions.height);
        context.closePath();
        context.fill();
    }

    function drawLine(dimensions, to) {
        context.strokeStyle = '#eee';
        context.beginPath();
        context.moveTo(0, dimensions.height * (1 - limit));
        context.lineTo(to, dimensions.height * (1 - limit));
        context.closePath();
        context.stroke();
    }

    function init(totalSteps, value, data) {
        lastData = data;
        sick = [];
        healthy = [];
        recovered = [];
        maxValue = value;
        totalSteps -= 1;
        step = localDimensions.width / totalSteps;
        currentStep = -step;
        limit = 0.3;

        canvas =  document.getElementById('graph-canvas');
        context = canvas.getContext('2d');
        canvasDimensions = document.getElementById('graph-dimensions');

        healthyNumber = document.getElementById('healthy-number');
        sickNumber = document.getElementById('sick-number');
        recoveredNumber = document.getElementById('recovered-number');
        deadNumber = document.getElementById('dead-number');

        changeNumbers();
        drawRect('#eee', 0, 0, dimensions.width, dimensions.height);
    }

    function update(data) {
        lastData = data;

        var sickValue = maxValue - data.sick;
        var healthyValue = sickValue - data.healthy;
        var recoveredValue = healthyValue - data.recovered;

        sick.push(sickValue / maxValue);
        healthy.push(healthyValue / maxValue);
        recovered.push(recoveredValue / maxValue);

        currentStep += step;
    }

    function draw() {
        // update dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        var dimensions = getCanvasDimensions();
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // update numbers
        changeNumbers();

        // draw empty rect
        drawRect('#eee', currentStep * dimensions.scaleWidthRatio, 0, dimensions.width - currentStep * dimensions.scaleWidthRatio, dimensions.height);

        // draw dead line (the whole rectangle)
        drawRect('#000', 0, 0, currentStep * dimensions.scaleWidthRatio, dimensions.height);

        // draw recovered line
        drawPolygon(recovered, '#CB8AC0', dimensions);

        // draw healthy line
        drawPolygon(healthy, '#AAC6CA', dimensions);

        // draw sick line
        drawPolygon(sick, '#BB641D', dimensions);

        // draw limit line
        drawLine(dimensions, currentStep * dimensions.scaleWidthRatio);
    }

    function clear() {
        // clear canvas
        canvas.width = canvas.height = 0;
    }

    /* Save these functions as global */
    window.Graph = {
        init: init,
        update: update,
        clear: clear,
        draw: draw
    };

}());