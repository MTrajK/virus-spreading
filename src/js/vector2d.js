(function(){
    'use strict';

    /****************
     * 2 dimensional vector class, contains X and Y coordinates
     * and several vector operations.
    ****************/

    function Vector2D(x, y) {
        // constructor for 2 dimensional vector
        this.X = x;
        this.Y = y;
    }

    Vector2D.random = function() {
        // static function for a random vector
        return new Vector2D(Math.random(), Math.random());
    }

    Vector2D.prototype.add = function(v) {
        // add 'v' to this vector
        return new Vector2D(
            v.X + this.X,
            v.Y + this.Y
        );
    }

    Vector2D.prototype.sub = function(v) {
        // substract 'v' from this vector (direction from this to 'v' vector)
        return new Vector2D(
            this.X - v.X,
            this.Y - v.Y
        );
    }

    Vector2D.prototype.mult = function(factor) {
        // multiply this vector by constant 'factor'
        return new Vector2D(
            this.X * factor,
            this.Y * factor
        );
    }

    Vector2D.prototype.div = function(factor) {
        // divide this vector by constant 'factor'
        return new Vector2D(
            this.X / factor,
            this.Y / factor
        );
    }

    Vector2D.prototype.normalize = function() {
        // convert to unit vector, vector with length of 1 (distance between origin and this vector)
        // NOTE: unsafe normalize (if length is zero)!
        return this.div(this.length());
    }

    Vector2D.prototype.length = function() {
        // lenght of this vector (Pythagorean theorem)
        return Math.sqrt(this.X*this.X + this.Y*this.Y);
    }

    Vector2D.prototype.dot = function(v) {
        // dot product between this and 'v' vector
        return this.X * v.X + this.Y * v.Y;
    }

    Vector2D.prototype.opposite = function() {
        // opposite from this vector
        return new Vector2D(
            -this.X,
            -this.Y
        );
    }

    // export Vector2D
    window.Vector2D = Vector2D;

}());