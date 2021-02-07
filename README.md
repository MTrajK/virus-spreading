# Virus Spreading

Simple virus spreading simulation inspired by this great [article](https://www.washingtonpost.com/graphics/2020/world/corona-simulator/) (written by Harry Stevens on [WashingtonPost](https://www.washingtonpost.com/)).\
The goal of this tool is to experiment with several parameters to find the best way to **"flatten the curve"**.\
The whole simulation is made with plain/vanilla JavaScript and CSS. But why vanilla JavaScript (without some newer specification like ES6)? Because I wanted to be runnable in older/all browsers without using a JS compiler. Btw I'm not saying to ignore JS frameworks, JS compilers, or ES6 (they are great!), but for this project, I decided not to use something like that.

*Note: This is not a mathematical simulation nor a 100% real-world simulation (because there are many more factors in the real world, and the people aren't just balls that are bouncing), but it could show how important the social distancing is and how quickly a virus could spread among the population.*

**[Try it here](https://mtrajk.github.io/virus-spreading/)**

<p align="center">
    <img src="https://raw.githubusercontent.com/MTrajK/virus-spreading/master/images/simulation_v2.gif" width="800px" title="simulation">
</p>


## Description

Several details about the simulation:

- The simulation and chart are responsive and mobile-friendly.
- Each simulation lasts 30 seconds.
- A healthy ball (green) could be infected by a sick ball with a collision (the infection depends on the "infection rate" parameter).
- A sick ball (red) will be sick between 6 and 8 seconds. After that, it changes the state in recovered or dead (this depends on the "death rate" parameter). The number of sick balls depends on the "sick population" parameter.
- A recovered ball (orange) can't be infected again.
- A dead ball (black) is a ball that doesn't move and doesn't collide (doesn't exist for the other balls).
- Healthy, vaccinated, sick and recovered balls could be social distancing balls, which means that the ball doesn't move but the moving balls can collide with it. The number of social distancing balls depends on the "social distancing" parameter.
- In the chart there is a "safe limit" line (grey), that line is the hospital capacity, in this case, that limit is 30% of the total population (in the real-world this percent is much lower).
- Two new parameters were added to the original simulation (around 11 months later): "vaccinated" population (blue balls) and "vaccine efficiency". Vaccinated balls are blue. Each vaccinated ball may develop virus immunity, this depends on the "vaccine efficiency" parameter.


## Repo structure

- [images](images) - logo (made by me, an amateur "designer") and a gif from the simulation
- [src](src) - the source code of the application
    * [index.html](https://github.com/MTrajK/virus-spreading/tree/master/src/index.html) - a simple HTML page, JS and CSS files are imported and the parameters, notes, and canvases are defined here
    * [css/styles.css](https://github.com/MTrajK/virus-spreading/tree/master/src/css/styles.css) - used to define media queries (for responsiveness), and other very simple CSS rules (for buttons, ranges, and texts)
    * [js/common.js](https://github.com/MTrajK/virus-spreading/tree/master/src/js/common.js) - all constants used in simulation
    * [js/vector2d.js](https://github.com/MTrajK/virus-spreading/tree/master/src/js/vector2d.js) - 2 dimensional vector class, all vector related things are located here
    * [js/ball.js](https://github.com/MTrajK/virus-spreading/tree/master/src/js/ball.js) - balls collision and movement logics/physics
    * [js/chart.js](https://github.com/MTrajK/virus-spreading/tree/master/src/js/chart.js) - chart logics and drawings
    * [js/simulation.js](https://github.com/MTrajK/virus-spreading/tree/master/src/js/simulation.js) - simulation drawings and logics (without ball logics)
    * [js/app.js](https://github.com/MTrajK/virus-spreading/tree/master/src/js/app.js) - the role of this js is to control the whole app/workflow, used to initialize (using the values from the parameters), stop the simulation and all other interaction


## Resources

Useful resources about virus spreading (you can find the same resources in the application):
- [Why outbreaks like coronavirus spread exponentially, and how to “flatten the curve”](https://www.washingtonpost.com/graphics/2020/world/corona-simulator/)
- [Outbreak](https://meltingasphalt.com/interactive/outbreak/)
- [What Happens Next?](https://ncase.me/covid-19/)
- [Epidemic Calculator](http://gabgoh.github.io/COVID/index.html)
- [Simulating an epidemic](https://www.youtube.com/watch?v=gxAaO2rsdIs)
- [Epidemic, Endemic, and Eradication Simulations](https://www.youtube.com/watch?v=7OLpKqTriio)
- [Exponential growth and epidemics](https://www.youtube.com/watch?v=Kas0tIxDvrg)
- [What This Chart Actually Means for COVID-19](https://www.youtube.com/watch?v=fgBla7RepXU)
- [The Coronavirus Curve](https://www.youtube.com/watch?v=k6nLfCbAzgo)
- [How To See Germs Spread Experiment (Coronavirus)](https://www.youtube.com/watch?v=I5-dI74zxPg)
- [Visualizing Herd Immunity (with 500 Mousetraps!)](https://www.youtube.com/watch?v=Et_J8_x4qBs)


## License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details