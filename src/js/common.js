(function(){
    'use strict';

    var fps = 60; // Note: if you change this, you'll need to addapt ball speed
    var intervalMs = 1000 / fps;
    var simulationSec = 30;
    var totalFrames = fps * simulationSec;
    var borderWidth = 1;
    var localDimensions = {
        width: 100, // 1 localDimensions.width is 1 local unit
        height: 100 * (2/3) // the canvas ratio is always 3:2
    };
    var ballProperties = {
        radius: 0.8, // local units
        speed: 0.2
    };
    var safeLimitPercentage = 0.3;
    var chartSafeLimit = 1 - safeLimitPercentage; // that's 30 percents capacity (1-0.3)
    var fullRotation = 2 * Math.PI;

    Ball.adjustStaticProperties = function(radius, speed, localDimensions, infectionRate, deathRate) {
        Ball.radius = radius;
        Ball.speed = speed;
        Ball.localDimensions = localDimensions;
        Ball.infectionRate = infectionRate;
        Ball.deathRate = deathRate;
        Ball.borderCoords = {
            left: 0 + radius,
            right: localDimensions.width - radius,
            top: 0 + radius,
            bottom: localDimensions.height - radius,
        };
        Ball.gap = 0.01; // a small value used to create gaps between balls
    }

    var colors = {
        border: {
            open: '#eeeeee',
            closed: '#000000'
        }

    };
    var borders = {
        left: {
            leftPosition: localDimensions.width/3 - borderWidth/2,
            rightPosition: localDimensions.width/3 + borderWidth/2,
            closed: false,
            color: colors.border.open
        },
        right: {
            leftPosition: 2*localDimensions.width/3 - borderWidth/2,
            rightPosition: 2*localDimensions.width/3 + borderWidth/2,
            closed: false,
            color: colors.border.open
        }
    }
    var states = {
        healthy: 0,
        sick: 1,
        recovered: 2,
        dead: 3
    };

    function State(socialDistancing) {
        this.color = null;
    }

    function Healthy() {
        this.color = '#AAC6CA';
        this.socialDistancing = false;
    }

    function Recovered() {
        this.color = '#CB8AC0';
        this.socialDistancing = false;
    }

    function Sick() {
        this.color = '#BB641D';
        this.socialDistancing = false;
        var from = 6 * 60;
        var to = 8 * 60;
        this.left = parseInt(from + Math.random() * (to - from));
    }

    Sick.prototype.update = function() {
        this.left --;
        return this.left == 0;
    }

    function Dead() {
        this.color = '#000000';
        this.socialDistancing = false;
    }

    // export Common
    window.Common = {
        intervalMs: intervalMs,
        totalFrames: totalFrames,
        localDimensions: localDimensions,
        ballProperties: ballProperties,
        borders: borders,
        fullRotation: fullRotation,
        chartSafeLimit: chartSafeLimit,
        colors: colors
    };

}());