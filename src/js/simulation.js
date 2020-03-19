(function () {
    'use strict';

    var fps = 60; // Note: if you change this, you'll need to addapt ball speed
    var intervalMs = 1000 / fps;
    var simulationSec = 30;
    var simulationFrames = fps * simulationSec;
    var borderWidth = 1;
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

    var simulationCanvas, simulationDimensions, context, simulationStats, simulationEnd, simulationParameters,
        updateInterval, balls, currentFrame, borders, resizeTimeout;

    function getCanvasDimensions() {
        return {
            width: simulationDimensions.offsetWidth,
            height: simulationDimensions.offsetHeight,
            top: simulationDimensions.offsetTop,
            left: simulationDimensions.offsetLeft,
            scaleWidthRatio: simulationDimensions.offsetWidth / localDimensions.width
        }
    }

    function resizeEventHandler() {
        // this mechanism is here to prevent many drawings of the same things when resizing the browser
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            draw();
        }, intervalMs);
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
        balls = [];
        borders = [];
        currentFrame = 0;
        resizeTimeout = undefined;

        // create sick and healthy balls
        var ballIdx = 0;
        while (ballIdx < simulationParameters.sickPopulation) {
            balls.push(new Ball(new States.Sick()));
            ballIdx ++;
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

        // create borders
        borders.push(new Border(localDimensions.width/3, borderWidth, false));
        borders.push(new Border(2*localDimensions.width/3, borderWidth, false));

        // start chart
        Chart.start();

        // set interval
        updateInterval = setInterval(update, intervalMs);
    }

    function drawLine(color, position, dimensions) {
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(position, 0);
        context.lineTo(position, dimensions.height);
        context.closePath();
        context.stroke();
    }

    function drawSectorBorder(border, dimensions) {
        /*
        if (border.closed)
            context.fillStyle = '#000000';
        else
            context.fillStyle = '#eeeeee';

        context.fillRect((border.position - borderWidth/2) * dimensions.scaleWidthRatio, 0, (border.position + borderWidth/2) * dimensions.scaleWidthRatio, dimensions.height);
        */
        var color = '#eeeeee';
        if (border.closed)
            color = '#000000';

        drawLine(color, border.leftPosition * dimensions.scaleWidthRatio, dimensions);
        drawLine(color, border.rightPosition * dimensions.scaleWidthRatio, dimensions);

        context.beginPath();
        context.moveTo(border.rightPosition * dimensions.scaleWidthRatio, 0);
        context.lineTo(border.rightPosition * dimensions.scaleWidthRatio, dimensions.height);
        context.closePath();
        context.stroke();
    }

    function drawCanvasBorder(dimensions) {
        context.strokeStyle = '#000000';
        context.strokeRect(0, 0, dimensions.width, dimensions.height);
    }

    function drawBall(ball, scaleWidthRatio) {
        var scaledCoords = ball.position.mult(scaleWidthRatio); // convert the coordinates in CANVAS size

        context.beginPath();
        context.arc(scaledCoords.X, scaledCoords.Y, ballProperties.radius * scaleWidthRatio, // convert the radius too
            ballProperties.startAngle, ballProperties.endAngle);
        context.closePath();

        context.fillStyle = ball.state.color;
        context.fill();
    }

    function draw() {
        // update dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        var dimensions = getCanvasDimensions();
        simulationCanvas.width = dimensions.width;
        simulationCanvas.height = dimensions.height;

        // draw sector borders
        drawSectorBorder(borders[0], dimensions);
        drawSectorBorder(borders[1], dimensions);

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
        for (var i=0; i<balls.length; i++)
            if (!(balls[i].state instanceof States.Dead))
                for (var j=i+1; j<balls.length; j++)
                    if (!(balls[j].state instanceof States.Dead))
                        balls[i].ballsCollision(balls[j]);

        var statsData = {'sick': 0, 'healthy': 0, 'recovered': 0, 'dead': 0};
        for (var i=0; i<balls.length; i++) {
            // update ball position & velocity
            balls[i].move();

            // check canvas borders collision
            balls[i].canvasCollision();

            // check sector borders collision
            balls[i].sectorCollision(borders);

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
        if (currentFrame == simulationFrames) {
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
        Ball.adjustStaticProperties(ballProperties.radius, ballProperties.speed, localDimensions,
            simulationParameters.infectionRate, simulationParameters.deathRate);

        // init chart
        Chart.init(chart, simulationFrames, simulationParameters.totalPopulation, 0.3);

        start();
    }

    function clear() {
        // clear resize handler
        clearTimeout(resizeTimeout);
        window.removeEventListener('resize', resizeEventHandler);

        // clear chart
        Chart.clear();

        // clear canvas
        simulationCanvas.width = simulationCanvas.height = 0;
    }

    function restart() {
        clear();
        start();
    }

    function border(side) {
        var num = (side == 'left') ? 0 : 1;
        borders[num].closed = !borders[num].closed;
        return borders[num].closed;
    }

    /* Save these functions as global */
    window.Simulation = {
        init: init,
        clear: clear,
        restart: restart,
        border: border
    };

}());