(function(){
    'use strict';

    var ballProperties = {
        speed: 0,
        radius: 0.8,
    }

    var localDimensions = {
        width: 100, // 1 localDimensions.width is 1 local unit
        height: 100 * (2/3) // the canvas ratio is always 3:2
    };

    var borderCoords = {
        left: 0 + ballProperties.radius,
        right: localDimensions.width - ballProperties.radius,
        top: 0 + ballProperties.radius,
        bottom: localDimensions.height - ballProperties.radius,
    };

    /**************
     * Ball class *
    ***************/
    function Ball(state) {
        this.state = state;
        this.position = Vector2D.random().multVec(new Vector2D(localDimensions.width, localDimensions.height));
        this.velocity = Vector2D.random().sub(new Vector2D(0.5, 0.5)).tryNormalize().mult(0.2);
    }

    Ball.prototype.collision = function(ball) {
        if (this.state instanceof States.Dead || ball.state instanceof States.Dead)
            return;

        var minDistance = 2 * ballProperties.radius;
        var positionSub = this.position.sub(ball.position);
        var distance = positionSub.length();

        if (distance <= minDistance) {
            // move balls outside of collision
            var diff = (minDistance - distance) / 2 + 0.01;
            this.position = this.position.add(positionSub.tryNormalize().mult(diff));
            ball.position = ball.position.add(positionSub.opposite().tryNormalize().mult(diff));

            /*********************************************************
                The formula could be found here: https://en.wikipedia.org/wiki/Elastic_collision
                velocityA -= (dot(velocityAB_sub, positionAB_sub) / distance^2) * positionAB_sub
                velocityB -= (dot(velocityBA_sub, positionBA_sub) / distance^2) * positionBA_sub
                but this thing (dot(velocityAB_sub, positionAB_sub) / distance^2) is same for 2 velocities
                because dot and length methods are commutative properties, and velocityAB_sub = -velocityBA_sub, same for positionSub
            *********************************************************/
            var coeff = this.velocity.sub(ball.velocity).dot(positionSub) / (distance * distance);
            this.velocity = this.velocity.sub(positionSub.mult(coeff)).tryNormalize().mult(0.2);
            ball.velocity = ball.velocity.sub(positionSub.opposite().mult(coeff)).tryNormalize().mult(0.2);

            if ((this.state instanceof States.Sick) && (ball.state instanceof States.Healthy)) {
                ball.state = new States.Sick();
            }
            if ((this.state instanceof States.Healthy) && (ball.state instanceof States.Sick)) {
                this.state = new States.Sick();
            }
        }
    }

    Ball.prototype.move = function(sectors) {
        if (this.state instanceof States.Dead)
            return;

        // move the ball using the velocity
        this.position = this.position.add(this.velocity);

        if (this.position.X <= borderCoords.left || this.position.X >= borderCoords.right) {
            // move ball inside the borders
            this.position.X = (this.position.X <= borderCoords.left) ?
                                borderCoords.left : borderCoords.right;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is Y axis)
            this.velocity.X = -this.velocity.X;
        }
        if (this.position.Y <= borderCoords.top || this.position.Y >= borderCoords.bottom) {
            // move ball inside the borders
            this.position.Y = (this.position.Y <= borderCoords.top) ?
                                borderCoords.top : borderCoords.bottom;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is X axis)
            this.velocity.Y = -this.velocity.Y;
        }

        if (this.state instanceof States.Sick) {
            if (this.state.update()) {
                if (Math.random() < 0.03)
                    this.state = new States.Dead();
                else
                    this.state = new States.Recovered();
            }
        }
    }

    // export Ball
    window.Ball = Ball;

}());