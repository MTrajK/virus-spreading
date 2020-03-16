(function () {
    'use strict';

    var simulation = document.getElementById('simulation');
    var parameters = document.getElementById('parameters');

    var bordersBtns = document.getElementById('borders-btns');
    var simulationEndBtns = document.getElementById('simulation-end-btns');
    var border1 = document.getElementById('border1');
    var border2 = document.getElementById('border2');

    var populationSlider = document.getElementById('population-slider');
    var sickSlider = document.getElementById('sick-slider');
    var distancingSlider = document.getElementById('distancing-slider');
    var infectionSlider = document.getElementById('infection-slider');
    var deathSlider = document.getElementById('death-slider');

    function simulationEnd() {
        bordersBtns.style.display = 'none';
        simulationEndBtns.style.display = 'block';
    }

    document.getElementById('start').addEventListener('click', function(){
        bordersBtns.style.display = 'block';
        simulationEndBtns.style.display = 'none';

        parameters.style.display = 'none';
        simulation.style.display = 'block';

        border1.value = 'Close border 1';
        border2.value = 'Close border 2';

        // start simulation
        window.Simulation.init('canvas', 'dimensions', simulationEnd,
            parseInt(populationSlider.value),
            parseInt(parseInt(populationSlider.value) * parseFloat(sickSlider.value)),
            parseFloat(distancingSlider.value),
            parseFloat(infectionSlider.value),
            parseFloat(deathSlider.value));
    });
    document.getElementById('adjust').addEventListener('click', function(){
        parameters.style.display = 'block';
        simulation.style.display = 'none';
        // end simulation
        window.Simulation.clear();
    });
    document.getElementById('restart').addEventListener('click', function(){
        bordersBtns.style.display = 'block';
        simulationEndBtns.style.display = 'none';

        border1.value = 'Close border 1';
        border2.value = 'Close border 2';

        // restart simulation
        window.Simulation.restart();
    });
    border1.addEventListener('click', function(){
        if (window.Simulation.border(0))
            border1.value = 'Open border 1';
        else
            border1.value = 'Close border 1';
    });
    border2.addEventListener('click', function(){
        if (window.Simulation.border(1))
            border2.value = 'Open border 2';
        else
            border2.value = 'Close border 2';
    });

}());