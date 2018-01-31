const states = require('./states');
const inquirer = require('inquirer');
var clc = require('cli-color');
var state = require('./state');

var error = clc.red.bold;
var warn = clc.yellow;
var notice = clc.blue;
var success = clc.green;

//	Gets random or specific state object.
function getRandomState(id) {
    if(id) {
        return states[id];
    }
    var randomState = states[Math.floor(Math.random()*states.length)];
    return new state(randomState.id, randomState.name);
}

// Removes state object from states array.
function removeState(state) {
    states.splice(states.indexOf(state), 1);
}

// Extend strings to replace character at index.
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

var hangmanGame = function() {
    this.currentState = {},
    this.playerName = '',
    this.gameStarted = false,
    this.hangmanText = '',
    this.lives = 6,
    this.previousGuesses = [];

    hangmanGame.prototype.startGame = () => {
        this.gameStarted = true;
        this.currentState = getRandomState();
        if(this.currentState) {
            // Remove selected state so that a state is not repeated in single game.
            removeState(this.currentState);
            this.hangmanText = '';
            this.lives = 6;
            this.previousGuesses = [];
            console.log(notice(`Let\'s play Hangman!! ${this.playerName}, Start typing letters. Guess the state of the USA`));
            this.hangmanText = this.currentState.name.replace(/[\s]/g, '  ').replace(/[a-z]/gi, '_ ');
            console.log(error("\n*******************************************************\n"));
            console.log(notice(this.hangmanText.replace(/\s\s/g, '  ')));
            console.log(error("\n*******************************************************\n"));
            
            this.promptForUserGuess('What is your Guess', true);
            return;
        }

        console.log(error(`${this.playerName} You completed guessing all the states.`));
        this.hangmanText = 'Game Over';
        console.log(notice(this.hangmanText));
    };

    hangmanGame.prototype.promptForUserGuess = (messagae, isGuessing) => {
        inquirer.prompt([{
            type: 'input',
            name: 'guess',
            message: messagae
        }]).then(function(data){
            if (isGuessing) {
                if(data.guess.length) {
                    if(data.guess.length > 1) {
                        console.log(error('Only One letter at a time!!')); 
                        this.promptForUserGuess('What is your Guess', true);                                                  
                    } else {
                        this.handleGuess(data.guess);
                    }
                } else {
                    console.log(error('Enter one letter!!'));
                    this.promptForUserGuess('What is your Guess', true);                                              
                }
            } else {
                this.handleGuess();
            }
        }.bind(this));
    };

    hangmanGame.prototype.endGame = (isWin) => {
        this.gameStarted = false;
        console.log(notice('State is: ' + this.currentState.name.split('').join('  ').toUpperCase()));
        if(isWin) {
            console.log(success(`${this.playerName} you are Awesome!`));
        } else {
            console.log(error(`Never mind try again!`));
        }

        this.promptForUserGuess('Press Enter to restart the Game', false);
    };

    hangmanGame.prototype.handleGuess = (userGuess) => {
        if(!this.gameStarted) {
            this.startGame();
            return;
        }

        userGuess = userGuess.toLowerCase();

        // When user guess is an alphabet
        if(userGuess.match(/^[a-z]$/i)) {
            // When user input is not already given.
            if(this.previousGuesses.indexOf(userGuess) === -1) {
                let isWin = false, regEx = null, counter = 0;
                regEx = (new RegExp(userGuess,'gi'));

                // Replace _ with actual letter in each occurance.
                let match = '';
                while ((match = regEx.exec(this.currentState.name))) {
                    counter++;
                    const actualIndex = 2 * match.index;
                    this.hangmanText = this.hangmanText.replaceAt(actualIndex, match[0]);
                }
                console.log(error("\n*******************************************************\n"));
                console.log(notice(this.hangmanText.toUpperCase().replace(/\s\s/g, '  ')));
                console.log(error("\n*******************************************************\n"));
                
                console.log(success(`${counter} match(es)${counter ? ' Sweet!!' : ''}`));

                // When there is no match
                // reduce lives
                if(!counter) {
                    this.lives--;
                    console.log(error('Lives Remaining: ' + this.lives));
                }

                this.previousGuesses.push(userGuess);
                console.log(notice('Letter Guessed So Far: ' + this.previousGuesses.join(', ').toUpperCase()));

                isWin = !this.hangmanText.match(/[_]/g);

                // When lives are 0 or user won the game
                // call end procedure
                if(!this.lives || isWin) {
                    this.endGame(isWin);                    
                } else {
                    this.promptForUserGuess('What is your Next Guess', true);
                }

                return;
            }

            console.log(error(`${userGuess} is already entered!!`));
            this.promptForUserGuess('What is your Next Guess', true);            
            return;
        }

        console.log(error(`${userGuess === ' ' ? 'Space' : userGuess} is not valid, Google "How to play hangman?" !!`));
        this.promptForUserGuess('What is your Next Guess', true);                    
        return;
    };
};

module.exports = hangmanGame;
