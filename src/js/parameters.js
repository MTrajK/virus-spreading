(function () {
    'use strict';

    var simulation = document.getElementById('simulation');
    var parameters = document.getElementById('parameters');

    document.getElementById('start').addEventListener('click', function(){
        parameters.style.display = 'none';
        simulation.style.display = 'block';
        // start simulation
        window.Simulation.init('canvas', 'dimensions');
    });
    document.getElementById('adjust').addEventListener('click', function(){
        parameters.style.display = 'block';
        simulation.style.display = 'none';
        // end simulation
        window.Simulation.clear();
    });
    document.getElementById('refresh').addEventListener('click', function(){
        // refresh simulation
        window.Simulation.refresh();
    });

}());