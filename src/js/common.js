(function(){
    'use strict';

    var fps = 60; // Note: if you change this, you'll need to addapt ball speed
    var simulationSeconds = 30; // the simulation lasts 30 seconds
    var safeLimitPercentage = 0.3; // that's 30 percents capacity

    // loval units
    var width = 100;
    var height = 100 * 2 / 3; // the canvas ratio is always 3:2
    var ballRadius = 0.8;
    var ballSpeed = 0.2;
    var ballsGap = 0.001; // a small value used to create gaps between balls
    var borderWidth = 1;

    var oneThirdWidth = width / 3;
    var twoThirdsWidth = 2 * oneThirdWidth;
    var borderWidthHalf = borderWidth / 2;

    // colors
    var blackColor = '#000000';
    var lightGrayColor = '#EEEEEE';
    var healthyColor = '#AED581';
    var vaccinatedColor = '#81D4FA';
    var sickColor = '#E53935';
    var recoveredColor = '#FF9800';
    var dangerSickColor = '#B71C1C';

    // export Common
    window.Common = {
        states: {
            healthy: 'healthy',
            vaccinated: 'vaccinated',
            sick: 'sick',
            recovered: 'recovered',
            dead: 'dead'
        },
        simulation: {
            intervalMs: 1000 / fps,
            totalFrames: fps * simulationSeconds
        },
        localCanvasDimensions: {
            width: width,
            height: height
        },
        borders: {
            left: {
                position: oneThirdWidth,
                leftWall: oneThirdWidth - borderWidthHalf,
                rightWall: oneThirdWidth + borderWidthHalf,
                ballLeftPosition: oneThirdWidth - borderWidthHalf - ballRadius,
                ballRightPosition: oneThirdWidth + borderWidthHalf + ballRadius,
                closed: false,
                color: lightGrayColor
            },
            right: {
                position: twoThirdsWidth,
                leftWall: twoThirdsWidth - borderWidthHalf,
                rightWall: twoThirdsWidth + borderWidthHalf,
                ballLeftPosition: twoThirdsWidth - borderWidthHalf - ballRadius,
                ballRightPosition: twoThirdsWidth + borderWidthHalf + ballRadius,
                closed: false,
                color: lightGrayColor
            }
        },
        ball: {
            radius: ballRadius,
            speed: ballSpeed,
            gap: ballsGap,
            fullRotation: 2 * Math.PI,
            minDistance: 2 * ballRadius
        },
        ballMovingBoundaries: {
            left: ballRadius,
            right: width - ballRadius,
            top: ballRadius,
            bottom: height - ballRadius
        },
        colors: {
            border: {
                opened: lightGrayColor,
                closed: blackColor
            },
            states: {
                healthy: healthyColor,
                vaccinated: vaccinatedColor,
                sick: sickColor,
                recovered: recoveredColor,
                dead: blackColor
            },
            chart: {
                healthy: healthyColor,
                vaccinated: vaccinatedColor,
                safeSick: sickColor,
                dangerSick: dangerSickColor,
                recovered: recoveredColor,
                dead: blackColor,
                empty: lightGrayColor,
                safeLine: lightGrayColor
            },
            canvasBoundary: blackColor,
        },
        rates: {
            vaccineEfficacy: undefined,
            infectionRate: undefined,
            deathRate: undefined
        },
        sicknessInterval: {
            from: 6 * fps,
            to: 8 * fps
        },
        chartSafeLimit: 1 - safeLimitPercentage
    };

}());