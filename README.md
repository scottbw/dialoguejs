dialoguejs
==========

![dialoguejs](https://raw.github.com/scottbw/dialoguejs/master/logo.png)

A simple branching dialogue and ask/tell engine for conversations in RPG-style games

## Installing and using

Use NPM to install:

    npm install dialoguejs
    
You can then create a dialogue object, holding all dialogue states, using:

    var mydialogue = require('dialoguejs');

## Loading dialogue from a text file

To load dialogue for a character, call

    dialogue.load(actor, file)

For example:

    dialogue.load("gnu", "gnu.txt");

... loads dialogue for "gnu" from "gnu.txt".

## Interacting using ask/tell

The format of the request is 

    dialogue.interact(actor, player, topic)

For example,

    dialogue.interact("gnu", "player", "banana")

... returns:

    { text: "I hate bananas" }

## Interacting using branches

Branching dialogue follows a similar structure. An interaction request uses:

    dialogue.interact(actor, player, [response_id])
    
For example:

    dialogue.interact("gnu", "player")
    
... returns 

    {text: "Hi! Welcome to OSSland! Is this your first visit?",
     responses: [
        {id: 1, text: "Yes, I just arrived"}, 
        {id: 2, text: "No, I've been here before"}
     ]
    }
    
... and then if the player selects a response, we can call:

    dialogue.interact("gnu", "player", 2)
  
... which would return:

    {text: "Hey, welcome back"}
    
Note that dialogue state is maintained for player-actor combinations, so if multiple players converse with a NPC, they can each have a different state within the conversation with that NPC.

## Creating a script

Dialogue scripts are simple text files. Each line of dialogue is on a separate line, and starts with an identifier. This must be a number for use in a branching dialogue, or can be a word if using ask/tell. (Both types can be combined in one dialogue file)

After the identifier comes the text to be returned, followed by either a set of response options, or the next line to follow.

For choices, put identifiers in square brackets, e.g.

    1 Where is the Grue? [3,7]

... indicates that, along with this text, the player should be presented with lines 3 and 7 as possible responses.

For moving the dialogue on, use a dash-and-angle-bracket arrow (->) followed the line number, e.g.

    3 In the dark -> 4
    4 Yes, I suppose it is -> 5
    5 Hello again, nice to see you

... indicates that, if the player responds "In the dark" (3), that the next line spoken by the actor will be "Yes, suppose it is" (4). The dialogue state will then move onto number 5.

