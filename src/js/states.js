(function(){
    'use strict';

    function State() {
        this.color = null;
    }

    function Healthy() {
        this.color = '#AAC6CA';
    }

    function Recovered() {
        this.color = '#CB8AC0';
    }

    function Sick() {
        this.color = '#BB641D';
        var from = 5 * 60;
        var to = 8 * 60;
        this.left = parseInt(from + Math.random() * (to - from));
    }

    Sick.prototype.update = function() {
        this.left --;
        return this.left == 0;
    }

    function Dead() {
        this.color = '#000000';
    }

    // export Sector
    window.States = {
        Healthy: Healthy,
        Recovered: Recovered,
        Sick: Sick,
        Dead: Dead
    };

}());