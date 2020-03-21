(function(){
    'use strict';

    /**************
     * Ball class *
    ***************/
    function Ball(state) {
        this.state = state;
        //this.position = Vector2D.random().multVec(new Vector2D(Ball.localCanvasDimensions.width - 2 * Ball.radius, Ball.localCanvasDimensions.height - 2 * Ball.radius)).add(new Vector2D(Ball.radius, Ball.radius));
        this.position = Vector2D.random();
        this.position.X *= Common.localCanvasDimensions.width;
        this.position.Y *= Common.localCanvasDimensions.height;
        this.velocity = Vector2D.random().sub(new Vector2D(0.5, 0.5)).tryNormalize().mult(Common.ball.speed);
        this.socialDistancing = false;
        this.sicknessLeft = parseInt(Common.sicknessInterval.from + Math.random() * (Common.sicknessInterval.to - Common.sicknessInterval.from));
    }

    // static properties
    Ball.infectionRate = undefined;
    Ball.deathRate = undefined;

    Ball.prototype.ballsCollision = function(ball) {
        if (this.state == Common.states.dead || ball.state == Common.states.dead)
            return;

        var positionSub = this.position.sub(ball.position);
        var distance = positionSub.length();

        if (distance > Common.ball.minDistance)
            return;

        if (this.socialDistancing) {
            // solution: r=d−2(d*n)n (https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector)
            positionSub = positionSub.tryNormalize().opposite();
            // TODO: ball.position SHOULD BE COMPUTED AFTER ball.velocity, SOMETHING WRONG HERE!!!
            ball.position = ball.position.add(positionSub.mult((Common.ball.minDistance - distance) + Common.ball.gap / 2));
            ball.velocity = ball.velocity.sub(positionSub.mult(2 * ball.velocity.dot(positionSub)));
        }
        else if (ball.socialDistancing) {
            // solution: r=d−2(d*n)n (https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector)
            positionSub = positionSub.tryNormalize();
            // TODO: ball.position SHOULD BE COMPUTED AFTER ball.velocity, SOMETHING WRONG HERE!!!
            this.position = this.position.add(positionSub.mult((Common.ball.minDistance - distance) + Common.ball.gap / 2));
            this.velocity = this.velocity.sub(positionSub.mult(2 * this.velocity.dot(positionSub)));
        }
        else {
            if (!ball.socialDistancing || !this.socialDistancing) {
                // Elastic collision, revert the ball speed after collision (no energy lost in this case)
                // The formula can be found here: https://en.wikipedia.org/wiki/Elastic_collision
                var coeff = this.velocity.sub(ball.velocity).dot(positionSub) / (distance * distance);
                this.velocity = this.velocity.sub(positionSub.mult(coeff)).tryNormalize().mult(Common.ball.speed);
                ball.velocity = ball.velocity.sub(positionSub.opposite().mult(coeff)).tryNormalize().mult(Common.ball.speed);
            }

            // move balls outside of collision
            var diff = (Common.ball.minDistance - distance) / 2 + Common.ball.gap;
            this.position = this.position.add(positionSub.tryNormalize().mult(diff));
            ball.position = ball.position.add(positionSub.opposite().tryNormalize().mult(diff));
        }

        if ((this.state == Common.states.sick || ball.state == Common.states.sick) &&
            (this.state == Common.states.healthy || ball.state == Common.states.healthy) &&
            (Math.random() < Ball.infectionRate))
            this.state = ball.state = Common.states.sick;   // both will be sick if at least one is infected in the collision
    }

    Ball.prototype.canvasBoundariesCollision = function() {
        if (this.position.X <= Common.ballMovingBoundaries.left || this.position.X >= Common.ballMovingBoundaries.right) {
            // move ball inside the boundaries
            this.position.X = (this.position.X <= Common.ballMovingBoundaries.left) ?
                                Common.ballMovingBoundaries.left : Common.ballMovingBoundaries.right;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is Y axis)
            this.velocity.X = -this.velocity.X;
        }
        if (this.position.Y <= Common.ballMovingBoundaries.top || this.position.Y >= Common.ballMovingBoundaries.bottom) {
            // move ball inside the borders
            this.position.Y = (this.position.Y <= Common.ballMovingBoundaries.top) ?
                                Common.ballMovingBoundaries.top : Common.ballMovingBoundaries.bottom;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is X axis)
            this.velocity.Y = -this.velocity.Y;
        }
    }

    function borderCollision(border, ball) {
        if (!border.closed)
            return;

        if (border.ballLeftPosition <= ball.position.X && border.ballRightPosition >= ball.position.X) {
            // move ball outside the border
            ball.position.X = (ball.position.X <= border.position) ?
                border.ballLeftPosition : border.ballRightPosition;

            // reflection angle
            ball.velocity.X = -ball.velocity.X;
        }
    }

    Ball.prototype.bordersCollision = function() {
        borderCollision(Common.borders.left, this);
        borderCollision(Common.borders.right, this);
    }

    Ball.prototype.move = function() {
        if (!this.socialDistancing && this.state != Common.states.dead)
            // move the ball using velocity if not social distancing or dead
            this.position = this.position.add(this.velocity);

        if (this.state == Common.states.sick && (--this.sicknessLeft) == 0)
            // check if this ball is dead or recovered
            this.state = (Math.random() < Ball.deathRate) ? Common.states.dead : Common.states.recovered;
    }

    // export Ball
    window.Ball = Ball;

}());