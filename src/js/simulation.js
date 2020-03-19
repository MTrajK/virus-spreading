(function () {
    'use strict';

    var fps = 60; // Note: if you change this, you'll need to addapt gravity and resistance logic in ball.js
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

    var updateInterval, canvas, context, canvasDimensions, balls, totalFrames, simulationParameters, borders, simulationEnd, resizeTimeout;

    function getCanvasDimensions() {
        return {
            width: canvasDimensions.offsetWidth,
            height: canvasDimensions.offsetHeight,
            top: canvasDimensions.offsetTop,
            left: canvasDimensions.offsetLeft,
            scaleWidthRatio: canvasDimensions.offsetWidth / localDimensions.width
        }
    }

    function resizeEventHandler() {
        // this mechanism is to prevent many renders of the same things
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            draw();
        }, 10);
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
        totalFrames = 0;
        resizeTimeout = undefined;

        // create sick and healthy balls
        var ballIdx = 0;
        while (ballIdx < simulationParameters.sickPopulation) {
            balls.push(new Ball(new States.Sick()));
            ballIdx ++;
        }
        while (ballIdx < simulationParameters.totalPopulation) {
            balls.push(new Ball(new States.Healthy()));
            ballIdx ++;
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

        // init graph
        var graphData = {
            'sick': simulationParameters.sickPopulation,
            'healthy': simulationParameters.totalPopulation - simulationParameters.sickPopulation,
            'recovered': 0,
            'dead': 0
        };
        Graph.init(simulationFrames, simulationParameters.totalPopulation, graphData);

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
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

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

        // draw graph
        Graph.draw();
    }

    function update() {
        // check collisions and update state, positions & velocities
        for (var i=0; i<balls.length; i++)
            if (!(balls[i].state instanceof States.Dead))
                for (var j=i+1; j<balls.length; j++)
                    if (!(balls[j].state instanceof States.Dead))
                        balls[i].ballsCollision(balls[j]);

        var graphData = {'sick': 0, 'healthy': 0, 'recovered': 0, 'dead': 0};
        for (var i=0; i<balls.length; i++) {
            // update ball position & velocity
            balls[i].move();

            // check canvas borders collision
            balls[i].canvasCollision();

            // check sector borders collision
            balls[i].sectorCollision(borders);

            // update graph data
            if (balls[i].state instanceof States.Sick)
                graphData.sick++;
            else if (balls[i].state instanceof States.Healthy)
                graphData.healthy++;
            else if (balls[i].state instanceof States.Recovered)
                graphData.recovered++;
            else
                graphData.dead++;
        }

        // update graph
        Graph.update(graphData);

        // draw everything
        draw();

        // stop simulation if needed
        totalFrames++;
        if (totalFrames == simulationFrames) {
            clearInterval(updateInterval);
            window.addEventListener('resize', resizeEventHandler);
            simulationEnd();
        }
    }

    function init(canvasId, dimensionsId, simulationEndFunc, totalPopulation, sickPopulation,
        socialDistancingPopulation, infectionRate, deathRate) {
        // init parameters
        canvas =  document.getElementById(canvasId);
        context = canvas.getContext('2d');
        canvasDimensions = document.getElementById(dimensionsId);

        simulationEnd = simulationEndFunc;

        simulationParameters = {
            'totalPopulation': totalPopulation,
            'sickPopulation': sickPopulation,
            'socialDistancingPopulation': socialDistancingPopulation,
            'infectionRate': infectionRate,
            'deathRate': deathRate
        };

        // init static properties for ball class
        Ball.adjustStaticProperties(ballProperties.radius, ballProperties.speed, localDimensions,
            simulationParameters.infectionRate, simulationParameters.deathRate);

        start();
    }

    function restart() {
        clear();
        start();
    }

    function clear() {
        // clear resize handler
        clearTimeout(resizeTimeout);
        window.removeEventListener('resize', resizeEventHandler);

        // clear graph
        Graph.clear();

        // clear canvas
        canvas.width = canvas.height = 0;
    }

    function border(side) {
        var num = (side == 'left') ? 0 : 1;
        borders[num].closed = !borders[num].closed;
        return borders[num].closed;
    }

    /* Save these functions as global */
    window.Simulation = {
        init: init,
        restart: restart,
        clear: clear,
        border: border
    };

}());