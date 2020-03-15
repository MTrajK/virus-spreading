(function () {
    'use strict';

    var simulation = document.getElementById('simulation');
    var parameters = document.getElementById('parameters');

    document.getElementById('start').addEventListener('click', function(){
        parameters.style.display = 'none';
        simulation.style.display = 'block';
        // start simulation
        window.Simulation.init('canvas', 'dimensions', 100, 1, 0.5, 1, 0.05);
    });
    document.getElementById('adjust').addEventListener('click', function(){
        parameters.style.display = 'block';
        simulation.style.display = 'none';
        // end simulation
        window.Simulation.clear();
    });
    document.getElementById('restart').addEventListener('click', function(){
        // restart simulation
        window.Simulation.restart();
    });

}());