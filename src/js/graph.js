(function () {
    'use strict';

    var localDimensions = {
        width: 100, // 1 localDimensions.width is 1 local unit
        height: 100 * (1/10) // the canvas ratio is always 10:1
    };

    var sick, healthy, recovered, canvas, context, canvasDimensions,
        currentStep, step, maxValue;

    function getCanvasDimensions() {
        return {
            width: canvasDimensions.offsetWidth,
            height: canvasDimensions.offsetHeight,
            top: canvasDimensions.offsetTop,
            left: canvasDimensions.offsetLeft,
            scaleWidth: canvasDimensions.offsetWidth / localDimensions.width
        }
    }

    function init(totalSteps, value) {
        sick = [];
        healthy = [];
        recovered = [];
        maxValue = value;
        currentStep = 0;
        totalSteps -= 1;
        step = localDimensions.width / totalSteps;

        canvas =  document.getElementById('graph-canvas');
        context = canvas.getContext('2d');
        canvasDimensions = document.getElementById('graph-dimensions');

        context.fillStyle = '#eee';
        context.fillRect(0, 0, dimensions.width, dimensions.height);
    }

    function update(data) {
        var sickValue = maxValue - data['sick'];
        var healthyValue = sickValue - data['healthy'];
        var recoveredValue = healthyValue - data['recovered'];
        sick.push(sickValue / maxValue);
        healthy.push(healthyValue / maxValue);
        recovered.push(recoveredValue / maxValue);

        var dimensions = getCanvasDimensions();
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        context.fillStyle = '#eee';
        context.fillRect(0, 0, dimensions.width, dimensions.height);

        // draw dead line
        context.fillStyle = '#000';
        context.fillRect(0, 0, currentStep * dimensions.scaleWidth, dimensions.height);

        // draw recovered line
        drawLine(recovered, '#CB8AC0', dimensions);

        // draw healthy line
        drawLine(healthy, '#AAC6CA', dimensions);

        // draw sick line
        drawLine(sick, '#BB641D', dimensions);

        currentStep += step;
    }

    function drawLine(data, color, dimensions) {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(0, dimensions.height);
        for (var i=0; i<sick.length; i++)
            context.lineTo(i * step * dimensions.scaleWidth, data[i] * dimensions.height);
        context.lineTo(currentStep * dimensions.scaleWidth, dimensions.height);
        context.closePath();
        context.fill();
    }

    function clear() {
        // clear canvas
        canvas.width = canvas.height = 0;

        context.fillStyle = '#eee';
        context.fillRect(0, 0, dimensions.width, dimensions.height);
    }

    /* Save these functions as global */
    window.Graph = {
        init: init,
        update: update,
        clear: clear
    };

}());