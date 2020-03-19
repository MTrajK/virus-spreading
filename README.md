# Virus Spreading

Simple virus spreading simulation inspired by this great [article](https://www.washingtonpost.com/graphics/2020/world/corona-simulator/) (written by Harry Stevens on [WashingtonPost](https://www.washingtonpost.com/)).\
The goal of this tool is to experiment with several parameters to see how to **"flatten the curve"** (Why does the curve need to be flattened in an epidemic? You can find the answer in the previously mentioned article, or search google because there are a lot of great articles).\
The whole simulation is made in plain JS and CSS.

**[Try it here](https://mtrajk.github.io/virus-spreading/)**

**NOTE: Not final! The project definitely needs a big refactoring (spaghetti code, I'll refactor it in the next days)!!!**

## Description

- Each simulation lasts 30 seconds.
- A sick ball lasts between 6 and 8 seconds.
- Social distancing ball is a ball that doesn't move.
- The infection rate is the possibility of a healthy ball to be infected after a collision with a sick ball.
- The death rate is the possibility of a sick ball to die.

*PS: The readme will be updated with more detailed description after the refactoring.*

## License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details