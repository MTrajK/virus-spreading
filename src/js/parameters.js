(function () {
    'use strict';

    /* DOM elements */

    var simulationContainer = document.getElementById('simulation');
    var parametersContainer = document.getElementById('parameters');
    var borderBtnsContainer = document.getElementById('borders-btns');
    var simulationEndBtnsContainer = document.getElementById('simulation-end-btns');

    var btns = {
        'start': document.getElementById('start'),
        'adjust': document.getElementById('adjust'),
        'restart': document.getElementById('restart')
    };
    var borderBtns = {
        'left': document.getElementById('left-border'),
        'right': document.getElementById('right-border')
    };
    var sliders = {
        'population': [
            document.getElementById('population-slider'),
            document.getElementById('population-number')
        ],
        'sick': [
            document.getElementById('sick-slider'),
            document.getElementById('sick-percent')
        ],
        'distancing': [
            document.getElementById('distancing-slider'),
            document.getElementById('distancing-percent')
        ],
        'infection': [
            document.getElementById('infection-slider'),
            document.getElementById('infection-percent')
        ],
        'death': [
            document.getElementById('death-slider'),
            document.getElementById('death-percent')
        ]
    };

    /* Helper functions */

    function hide(element) {
        element.style.display = 'none';
    }
    function show(element) {
        element.style.display = 'block';
    }
    function simulationEnd() {
        hide(borderBtnsContainer);
        show(simulationEndBtnsContainer);
    }
    function resetBorderBtnsText() {
        Object.keys(borderBtns).forEach(function(key) {
            borderBtns[key].value = 'Close ' + key + ' border';
        });
    }
    function addSliderEventListener(event, key) {
        sliders[key][0].addEventListener(event, function() {
            sliders[key][1].innerHTML = sliders[key][0].value;
        });
    }

    /* Attach event listeners */

    btns.start.addEventListener('click', function(){
        show(borderBtnsContainer);
        hide(simulationEndBtnsContainer);

        hide(parametersContainer);
        show(simulationContainer);

        resetBorderBtnsText();

        // start simulation
        window.Simulation.init('canvas', 'dimensions', simulationEnd, {
            'totalPopulation': parseInt(sliders.population[0].value),
            'sickPopulation': parseInt(parseInt(sliders.population[0].value) * parseFloat(sliders.sick[0].value) / 100),
            'socialDistancingPopulation': parseInt(parseInt(sliders.population[0].value) * parseFloat(sliders.distancing[0].value) / 100),
            'infectionRate': parseFloat(sliders.infection[0].value) / 100,
            'deathRate': parseFloat(sliders.death[0].value) / 100
        });
    });
    btns.adjust.addEventListener('click', function(){
        show(parametersContainer);
        hide(simulationContainer);
        // end simulation
        window.Simulation.clear();
    });
    btns.restart.addEventListener('click', function(){
        show(borderBtnsContainer);
        hide(simulationEndBtnsContainer);

        resetBorderBtnsText();

        // restart simulation
        window.Simulation.restart();
    });

    Object.keys(borderBtns).forEach(function(key) {
        borderBtns[key].addEventListener('click', function(){
            borderBtns[key].value = (window.Simulation.border(key) ? 'Open' : 'Close') + ' ' + key + ' border';
        });
    });
    Object.keys(sliders).forEach(function(key) {
        addSliderEventListener('change', key);   // for Internet Explorer
        addSliderEventListener('input', key);    // for the rest browsers
    });

}());