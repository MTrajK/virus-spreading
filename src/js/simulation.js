(function () {
    'use strict';

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

    function drawSectorBorder(border, dimensions) {
        drawLine(border.color, border.leftPosition, dimensions);   // left wall
        drawLine(border.color, border.rightPosition, dimensions);  // right wall
    }

    function drawCanvasBorder(dimensions) {
        context.strokeStyle = '#000000';
        context.strokeRect(0, 0, dimensions.width, dimensions.height);
    }

    function drawBall(ball, scaleWidthRatio) {
        var scaledCoords = ball.position.mult(scaleWidthRatio);
        var scaledRadius = Common.ballProperties.radius * scaleWidthRatio;

        context.beginPath();
        context.arc(scaledCoords.X, scaledCoords.Y, scaledRadius, 0, Common.fullRotation);
        context.closePath();

        context.fillStyle = ball.state.color;
        context.fill();
    }

    function resizeEventHandler() {
        // this mechanism is to prevent/delay many drawings of the same things when resizing the browser
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            draw();
        }, Common.intervalMs);
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
            balls.push(new Ball(new States.Sick()));
            ballIdx++;
        }
        while (ballIdx < simulationParameters.totalPopulation) {
            balls.push(new Ball(new States.Healthy()));
            ballIdx++;
        }

        // shuffle balls
        shuffleBalls();

        // make socialDistancing balls
        for (var i=0; i<simulationParameters.socialDistancingPopulation; i++) {
            balls[i].state.socialDistancing = true;
            balls[i].velocity = Vector2D.zero();
        }

        // start chart
        Chart.start();

        // set interval
        updateInterval = setInterval(update, Common.intervalMs);
    }

    function draw() {
        var dimensions = {
            width: simulationDimensions.offsetWidth,
            height: simulationDimensions.offsetHeight,
            scaleWidthRatio: simulationDimensions.offsetWidth / Common.localDimensions.width
        };

        // update dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        simulationCanvas.width = dimensions.width;
        simulationCanvas.height = dimensions.height;

        // draw sector borders
        drawSectorBorder(borders.left, dimensions);
        drawSectorBorder(borders.right, dimensions);

        // draw canvas border
        drawCanvasBorder(dimensions);

        // draw dead balls
        for (var i=0; i<balls.length; i++)
            if (balls[i].state instanceof States.Dead)
                drawBall(balls[i], dimensions.scaleWidthRatio);

        // draw other balls
        for (var i=0; i<balls.length; i++)
            if (!(balls[i].state instanceof States.Dead))
                drawBall(balls[i], dimensions.scaleWidthRatio);

        // draw chart
        Chart.draw();
    }

    function update() {
        // check collisions and update state, positions & velocities
        // This O(N^2) method could be faster using
        // Binary Space Partitioning (https://en.wikipedia.org/wiki/Binary_space_partitioning) or Quadtrees (https://en.wikipedia.org/wiki/Quadtree)
        for (var i=0; i<balls.length; i++)
            if (!(balls[i].state instanceof States.Dead))
                for (var j=i+1; j<balls.length; j++)
                    if (!(balls[j].state instanceof States.Dead))
                        balls[i].ballsCollision(balls[j]);

        var statsData = {sick: 0, healthy: 0, recovered: 0, dead: 0};
        for (var i=0; i<balls.length; i++) {
            // update ball position & velocity
            balls[i].move();

            // check canvas borders collision
            balls[i].canvasCollision();

            // check sector borders collision
            balls[i].bordersCollision();

            // count stats
            if (balls[i].state instanceof States.Sick)
                statsData.sick++;
            else if (balls[i].state instanceof States.Healthy)
                statsData.healthy++;
            else if (balls[i].state instanceof States.Recovered)
                statsData.recovered++;
            else
                statsData.dead++;
        }

        // update stats
        simulationStats(statsData);

        // update chart
        Chart.update(statsData);

        // draw everything
        draw();

        // stop simulation if needed
        currentFrame++;
        if (currentFrame == Common.totalFrames) {
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