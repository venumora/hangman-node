const inquirer = require('inquirer');
const hangmanGame = require('./hangman');

let game;
inquirer.prompt([{
    type: 'input',
    name: 'playerName',
    message: 'Hello!! What should I call you?'
}]).then(function(data){
    game = new hangmanGame();    
    game.playerName = data.playerName || 'Anonymous';
    inquirer.prompt([{
        type: 'input',
        name: 'prompt',
        message: `Hi ${game.playerName} Press Enter to Start the Game!!`
    }]).then(function(data){
        game.startGame();
    });
});