(function () {
    'use strict';

    /**************
    ** CONSTANTS **
    ***************/
    var fps = 60; // Note: if you change this, you'll need to addapt gravity and resistance logic in ball.js
    var intervalMs = 1000 / fps;
    var simulationFrames = fps * 30;
    var localDimensions = {
        width: 100, // 1 localDimensions.width is 1 local unit
        height: 100 * (2/3) // the canvas ratio is always 3:2
    };
    var ballProperties = {
        radius: 0.8, // local units
        speed: 0.2,
        startAngle: 0,
        endAngle: 2 * Math.PI
    };

    /******************************************************************************************
    ** PROPERTIES USED FOR COMUNICATION BETWEEN HELPERS, EVENTS, UPDATE AND PUBLIC FUNCTIONS **
    *******************************************************************************************/
    var updateInterval, canvas, context, canvasDimensions, balls, totalFrames, simulationParameters;

    /************
    ** DRAWING **
    *************/
    function drawCanvasBorder(dimensions) {
        context.strokeStyle = '#000000';
        context.strokeRect(0, 0, dimensions.width, dimensions.height);
    }

    function drawBall(ball, scaleRatio) {
        var scaledCoords = ball.position.mult(scaleRatio); // convert the coordinates in CANVAS size

        context.beginPath();
        context.arc(scaledCoords.X, scaledCoords.Y, ballProperties.radius * scaleRatio, // convert the radius too
            ballProperties.startAngle, ballProperties.endAngle);
        context.closePath();

        context.fillStyle = ball.state.color;
        context.fill();
    }

    /************
    ** HELPERS **
    *************/
    function getCanvasDimensions() {
        return {
            width: canvasDimensions.offsetWidth,
            height: canvasDimensions.offsetHeight,
            top: canvasDimensions.offsetTop,
            left: canvasDimensions.offsetLeft,
            scaleRatio: canvasDimensions.offsetWidth / localDimensions.width
        }
    }

    function start() {
        balls = [];
        totalFrames = 0;

        // init static properties for ball class
        Ball.adjustStaticProperties(ballProperties.radius, ballProperties.speed, localDimensions,
            simulationParameters.infectionRate, simulationParameters.deathRate);

        // create balls
        for (var i=0; i<simulationParameters.totalPopulation - simulationParameters.sickPopulation; i++)
            balls.push(new Ball(new States.Healthy()));
        for (var i=0; i<simulationParameters.sickPopulation; i++)
            balls.push(new Ball(new States.Sick()));

        // init graph
        Graph.init(simulationFrames, simulationParameters.totalPopulation);

        // set interval
        updateInterval = setInterval(update, intervalMs);
    }

    function stop() {
        // clear interval
        clearInterval(updateInterval);
    }

    /******************
    ** MAIN FUNCTION **
    *******************/
    function update() {
        // check dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        var dimensions = getCanvasDimensions();
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // draw canvas border
        drawCanvasBorder(dimensions);

        // check collisions and update state, positions & velocities
        for (var i=0; i<balls.length; i++)
            for (var j=i+1; j<balls.length; j++)
                balls[i].collision(balls[j]);

        var graphData = {'sick':0, 'healthy':0, 'recovered':0, 'dead':0};

        for (var i=0; i<balls.length; i++) {
            // update ball position & velocity
            balls[i].move();

            // draw updated balls
            drawBall(balls[i], dimensions.scaleRatio);

            // update graph data
            if (balls[i].state instanceof States.Sick)
                graphData['sick']++;
            else if (balls[i].state instanceof States.Healthy)
                graphData['healthy']++;
            else if (balls[i].state instanceof States.Recovered)
                graphData['recovered']++;
            else
                graphData['dead']++;
        }

        // update graph
        Graph.update(graphData);

        // stop simulation if needed
        totalFrames++;
        if (totalFrames == simulationFrames)
            stop();
    }

    /*********************
    ** PUBLIC FUNCTIONS **
    **********************/
    function init(canvasId, dimensionsId, totalPopulation, sickPopulation,
        socialDistancingPopulation, infectionRate, deathRate) {
        simulationParameters = {
            'totalPopulation': totalPopulation,
            'sickPopulation': sickPopulation,
            'socialDistancingPopulation': socialDistancingPopulation,
            'infectionRate': infectionRate,
            'deathRate': deathRate
        };

        // init parameters
        canvas =  document.getElementById(canvasId);
        context = canvas.getContext('2d');
        canvasDimensions = document.getElementById(dimensionsId);

        start();
    }

    function restart() {
        clear();

        start();
    }

    function clear() {
        stop();

        // clear graph
        Graph.clear();

        // clear canvas
        canvas.width = canvas.height = 0;
    }

    /* Save these functions as global */
    window.Simulation = {
        init: init,
        restart: restart,
        clear: clear
    };

}());