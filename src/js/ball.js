(function(){
    'use strict';

    /**************
     * Ball class *
    ***************/
    function Ball(state) {
        this.state = state;
        //this.position = Vector2D.random().multVec(new Vector2D(Ball.localDimensions.width - 2 * Ball.radius, Ball.localDimensions.height - 2 * Ball.radius)).add(new Vector2D(Ball.radius, Ball.radius));
        this.position = Vector2D.random().multVec(new Vector2D(Ball.localDimensions.width, Ball.localDimensions.height));
        this.velocity = Vector2D.random().sub(new Vector2D(0.5, 0.5)).tryNormalize().mult(Ball.speed);
    }

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
    }

    Ball.prototype.ballsCollision = function(ball) {
        var minDistance = 2 * Ball.radius;
        var positionSub = this.position.sub(ball.position);
        var distance = positionSub.length();

        if (distance <= minDistance) {

            if (this.state.socialDistancing) {
                // solution: r=d−2(d*n)n (https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector)
                positionSub = positionSub.tryNormalize().opposite();
                ball.position = ball.position.add(positionSub.mult((minDistance - distance) + Vector2D.NEAR_ZERO / 2));
                ball.velocity = ball.velocity.sub(positionSub.mult(2 * ball.velocity.dot(positionSub)));
            }
            else if (ball.state.socialDistancing) {
                // solution: r=d−2(d*n)n (https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector)
                positionSub = positionSub.tryNormalize();
                this.position = this.position.add(positionSub.mult((minDistance - distance) + Vector2D.NEAR_ZERO / 2));
                this.velocity = this.velocity.sub(positionSub.mult(2 * this.velocity.dot(positionSub)));
            }
            else {
                if (!ball.state.socialDistancing || !this.state.socialDistancing) {
                    /*********************************************************
                        The formula could be found here: https://en.wikipedia.org/wiki/Elastic_collision
                        velocityA -= (dot(velocityAB_sub, positionAB_sub) / distance^2) * positionAB_sub
                        velocityB -= (dot(velocityBA_sub, positionBA_sub) / distance^2) * positionBA_sub
                        but this thing (dot(velocityAB_sub, positionAB_sub) / distance^2) is same for 2 velocities
                        because dot and length methods are commutative properties, and velocityAB_sub = -velocityBA_sub, same for positionSub
                    *********************************************************/
                    var coeff = this.velocity.sub(ball.velocity).dot(positionSub) / (distance * distance);
                    this.velocity = this.velocity.sub(positionSub.mult(coeff)).tryNormalize().mult(Ball.speed);
                    ball.velocity = ball.velocity.sub(positionSub.opposite().mult(coeff)).tryNormalize().mult(Ball.speed);
                }

                // move balls outside of collision
                var diff = (minDistance - distance) / 2 + Vector2D.NEAR_ZERO;
                this.position = this.position.add(positionSub.tryNormalize().mult(diff));
                ball.position = ball.position.add(positionSub.opposite().tryNormalize().mult(diff));
            }

            if (Math.random() < Ball.infectionRate) {
                if ((this.state instanceof States.Sick) && (ball.state instanceof States.Healthy)) {
                    var socialDistancing = ball.state.socialDistancing;
                    ball.state = new States.Sick();
                    ball.state.socialDistancing = socialDistancing;
                }
                else if ((this.state instanceof States.Healthy) && (ball.state instanceof States.Sick)) {
                    var socialDistancing = this.state.socialDistancing;
                    this.state = new States.Sick();
                    this.state.socialDistancing = socialDistancing;
                }
            }
        }
    }

    Ball.prototype.canvasCollision = function() {
        if (this.position.X <= Ball.borderCoords.left || this.position.X >= Ball.borderCoords.right) {
            // move ball inside the borders
            this.position.X = (this.position.X <= Ball.borderCoords.left) ?
                                Ball.borderCoords.left : Ball.borderCoords.right;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is Y axis)
            this.velocity.X = -this.velocity.X;
        }
        if (this.position.Y <= Ball.borderCoords.top || this.position.Y >= Ball.borderCoords.bottom) {
            // move ball inside the borders
            this.position.Y = (this.position.Y <= Ball.borderCoords.top) ?
                                Ball.borderCoords.top : Ball.borderCoords.bottom;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is X axis)
            this.velocity.Y = -this.velocity.Y;
        }
    }

    Ball.prototype.sectorCollision = function(borders) {
        for (var i=0; i<borders.length; i++)
            if (borders[i].closed) {
                if (borders[i].leftPosition - Ball.radius <= this.position.X && borders[i].rightPosition + Ball.radius >= this.position.X) {
                    if (Math.abs(this.position.X - borders[i].rightPosition) <= Math.abs(this.position.X - borders[i].leftPosition))
                        this.position.X = borders[i].rightPosition + Ball.radius;
                    else
                        this.position.X = borders[i].leftPosition - Ball.radius;
                    this.velocity.X = -this.velocity.X;
                }
            }
    }

    Ball.prototype.move = function() {
        // move the ball using the velocity
        this.position = this.position.add(this.velocity);

        if (this.state instanceof States.Sick && this.state.update()) {
            var socialDistancing = this.state.socialDistancing;
            if (Math.random() < Ball.deathRate) {
                this.state = new States.Dead();
                this.velocity = Vector2D.zero();
            }
            else
                this.state = new States.Recovered();
            this.state.socialDistancing = socialDistancing;
        }
    }

    // export Ball
    window.Ball = Ball;

}());