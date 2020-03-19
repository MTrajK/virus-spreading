(function () {
    'use strict';

    var localDimensions = {
        width: 100, // 1 localDimensions.width is 1 local unit
        height: 100 * (1/10) // the canvas ratio is always 10:1
    };

    var sick, healthy, recovered, canvas, context, canvasDimensions, limit,
        currentStep, step, maxValue, healthyNumber, sickNumber, recoveredNumber, deadNumber;

    function getCanvasDimensions() {
        return {
            width: canvasDimensions.offsetWidth,
            height: canvasDimensions.offsetHeight,
            top: canvasDimensions.offsetTop,
            left: canvasDimensions.offsetLeft,
            scaleWidth: canvasDimensions.offsetWidth / localDimensions.width
        }
    }

    function changeNumbers(data) {
        healthyNumber.innerHTML = data['healthy'];
        sickNumber.innerHTML = data['sick'];
        recoveredNumber.innerHTML = data['recovered'];
        deadNumber.innerHTML = data['dead'];
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
            context.lineTo(i * step * dimensions.scaleWidth, data[i] * dimensions.height);
        context.lineTo(currentStep * dimensions.scaleWidth, dimensions.height);
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

    function init(totalSteps, value) {
        sick = [];
        healthy = [];
        recovered = [];
        maxValue = value;
        currentStep = 0;
        totalSteps -= 1;
        step = localDimensions.width / totalSteps;
        limit = 0.3;

        canvas =  document.getElementById('graph-canvas');
        context = canvas.getContext('2d');
        canvasDimensions = document.getElementById('graph-dimensions');

        healthyNumber = document.getElementById('healthy-number');
        sickNumber = document.getElementById('sick-number');
        recoveredNumber = document.getElementById('recovered-number');
        deadNumber = document.getElementById('dead-number');

        drawRect('#eee', 0, 0, dimensions.width, dimensions.height);
    }

    function update(data) {
        var sickValue = maxValue - data['sick'];
        var healthyValue = sickValue - data['healthy'];
        var recoveredValue = healthyValue - data['recovered'];

        sick.push(sickValue / maxValue);
        healthy.push(healthyValue / maxValue);
        recovered.push(recoveredValue / maxValue);

        changeNumbers(data);

        var dimensions = getCanvasDimensions();
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // draw empty rect
        drawRect('#eee', currentStep * dimensions.scaleWidth, 0, dimensions.width - currentStep * dimensions.scaleWidth, dimensions.height);

        // draw dead line (the whole rectangle)
        drawRect('#000', 0, 0, currentStep * dimensions.scaleWidth, dimensions.height);

        // draw recovered line
        drawPolygon(recovered, '#CB8AC0', dimensions);

        // draw healthy line
        drawPolygon(healthy, '#AAC6CA', dimensions);

        // draw sick line
        drawPolygon(sick, '#BB641D', dimensions);

        // draw limit line
        drawLine(dimensions, currentStep * dimensions.scaleWidth);

        currentStep += step;
    }

    function clear() {
        // clear canvas
        canvas.width = canvas.height = 0;
    }

    /* Save these functions as global */
    window.Graph = {
        init: init,
        update: update,
        clear: clear
    };

}());