(function(){
    'use strict';

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

    // export Sector
    window.States = {
        Healthy: Healthy,
        Recovered: Recovered,
        Sick: Sick,
        Dead: Dead
    };

}());