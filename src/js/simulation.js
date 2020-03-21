(function () {
    'use strict';

    /****************
     * Simulation drawings and logics are here.
     * The simulation canvas ratio is always 3:2.
    ****************/

    var simulationCanvas, simulationDimensions, context, simulationStats, simulationEnd, simulationParameters,
        balls, currentFrame, updateInterval, resizeTimeout;

    function drawLine(color, position, dimensions) {
        var scaledPosition = position * dimensions.scaleWidthRatio;

        context.beginPath();
        context.moveTo(scaledPosition, 0);
        context.lineTo(scaledPosition, dimensions.height);
        context.closePath();

        context.strokeStyle = color;
        context.stroke();
    }

    function drawBorder(border, dimensions) {
        drawLine(border.color, border.leftWall, dimensions);
        drawLine(border.color, border.rightWall, dimensions);
    }

    function drawCanvasBoundaries(dimensions) {
        context.strokeStyle = Common.colors.canvasBoundary;
        context.strokeRect(0, 0, dimensions.width, dimensions.height);
    }

    function drawBall(ball, scaleWidthRatio) {
        var scaledCoords = ball.position.mult(scaleWidthRatio);
        var scaledRadius = Common.ball.radius * scaleWidthRatio;

        context.beginPath();
        context.arc(scaledCoords.X, scaledCoords.Y, scaledRadius, 0, Common.ball.fullRotation);
        context.closePath();

        context.fillStyle = Common.colors.states[ball.state];
        context.fill();
    }

    function resizeEventHandler() {
        // this mechanism is to prevent/delay many drawings of the same things when resizing the browser
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            draw();
        }, Common.simulation.intervalMs);
    }

    function shuffleBalls() {
        // Fisher–Yates shuffle (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
        for (var i=0; i<balls.length; i++) {
            var rand = parseInt(Math.random() * balls.length);
            var temp = balls[i];
            balls[i] = balls[rand];
            balls[rand] = temp;
        }
    }

    function start() {
        // clean simulation states
        balls = [];
        currentFrame = 0;

        // create sick and healthy balls
        var ballIdx = 0;
        while (ballIdx < simulationParameters.sickPopulation) {
            balls.push(new Ball(Common.states.sick));
            ballIdx++;
        }
        while (ballIdx < simulationParameters.totalPopulation) {
            balls.push(new Ball(Common.states.healthy));
            ballIdx++;
        }

        // shuffle balls
        shuffleBalls();

        // make socialDistancing balls
        for (var i=0; i<simulationParameters.socialDistancingPopulation; i++)
            balls[i].socialDistancing = true;

        // start chart
        Chart.start();

        // set interval
        updateInterval = setInterval(update, Common.simulation.intervalMs);
    }

    function draw() {
        var dimensions = {
            width: simulationDimensions.offsetWidth,
            height: simulationDimensions.offsetHeight,
            scaleWidthRatio: simulationDimensions.offsetWidth / Common.localCanvasDimensions.width
        };

        // update dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        simulationCanvas.width = dimensions.width;
        simulationCanvas.height = dimensions.height;

        // draw borders
        drawBorder(Common.borders.left, dimensions);
        drawBorder(Common.borders.right, dimensions);

        // draw canvas boundaries
        drawCanvasBoundaries(dimensions);

        // draw dead balls (they should be under all other balls in the canvas)
        for (var i=0; i<balls.length; i++)
            if (balls[i].state == Common.states.dead)
                drawBall(balls[i], dimensions.scaleWidthRatio);

        // draw other balls
        for (var i=0; i<balls.length; i++)
            if (balls[i].state != Common.states.dead)
                drawBall(balls[i], dimensions.scaleWidthRatio);

        // draw chart
        Chart.draw();
    }

    function update() {
        // This O(N^2) method could be faster using
        // Binary Space Partitioning (https://en.wikipedia.org/wiki/Binary_space_partitioning) or Quadtrees (https://en.wikipedia.org/wiki/Quadtree)
        for (var i=0; i<balls.length; i++)
            for (var j=i+1; j<balls.length; j++)
                // check collision and update states, positions & velocities
                balls[i].ballsCollision(balls[j]);

        var statsData = {sick: 0, healthy: 0, recovered: 0, dead: 0};
        for (var i=0; i<balls.length; i++) {
            // count stats
            statsData[balls[i].state]++;

            // update ball position & velocity
            balls[i].move();

            // check canvas boundaries collision
            balls[i].canvasBoundariesCollision();

            // check borders collision
            balls[i].bordersCollision();
        }

        // update stats numbers
        simulationStats(statsData);

        // update chart
        Chart.update(statsData);

        // draw everything
        draw();

        // stop simulation if needed
        currentFrame++;
        if (currentFrame == Common.simulation.totalFrames) {
            clearInterval(updateInterval);
            window.addEventListener('resize', resizeEventHandler);
            simulationEnd();
        }
    }

    function init(simulation, chart, stats, end, parameters) {
        // init parameters
        simulationCanvas =  simulation.canvas;
        simulationDimensions = simulation.dimensions;
        context = simulationCanvas.getContext('2d');

        simulationStats = stats;
        simulationEnd = end;
        simulationParameters = parameters;

        // init static properties for ball class
        // TODO: Should this be located in common.js????
        Ball.infectionRate = simulationParameters.infectionRate;
        Ball.deathRate = simulationParameters.deathRate;

        // init chart
        Chart.init(chart, simulationParameters.totalPopulation);

        start();
    }

    function clear() {
        // clear resize handler
        window.removeEventListener('resize', resizeEventHandler);
        clearTimeout(resizeTimeout);

        // clear chart
        Chart.clear();

        // clear canvas
        simulationCanvas.width = simulationCanvas.height = 0;
    }

    function restart() {
        clear();
        start();
    }

    // export Simulation (only the public methods)
    window.Simulation = {
        init: init,
        clear: clear,
        restart: restart
    };

}());