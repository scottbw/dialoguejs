//
// The dialogue tree/conversation engine
//

//
// Data model
//
// id text [responses] -> next
//
// dialogue {
//         id:             // the dialogue id
//         text:           // the text to display
//         next:           // the next dialogue (optional)
//         responses:[]    // the ids of the options for responding (optional)
// } 
//  
// Simple example:
// 1 Hi! Welcome to Ossland! Is this your first visit? [2,3]
// 2 Yes, I just arrived. -> 4
// 3 No, I've been here before. -> 5 
// 4 Awesome, have fun.
// 5 Welcome back.  
//

var Dialogue = exports;

//
// The state of a dialogue; this is a matrix of players and actors,
// so for each player an actor has a different dialogue state
//
Dialogue.dialogue_states = {};

//
// A map of dialogue objects for each actor
//
Dialogue.dialogues = {};
    
/*
 * Get the dialogue state for an actor and player combination
 */
Dialogue.__getState = function(actor, player){
    
    var actor_state = Dialogue.dialogue_states[actor];
    if (!Dialogue.dialogue_states[actor]) Dialogue.dialogue_states[actor] = {};
    
    var player_state = Dialogue.dialogue_states[actor][player];
    if (!player_state) player_state = 0;
    return player_state;
}

/*
 * Set the dialogue state for an actor and player combination
 */
Dialogue.__setState = function(actor, player, state){
    Dialogue.dialogue_states[actor][player] = state;
}

/*
 * Get the specified dialogue for this actor
 */
Dialogue.__getDialogue = function(actor, id){
    if (!Dialogue.dialogues[actor]) Dialogue.dialogues[actor] = {};
    return Dialogue.dialogues[actor][id]; 
}

/*
 * Set the dialogue for an actor
 */
Dialogue.__setDialogue = function(actor, dialogue){
    if (!Dialogue.dialogues[actor]) Dialogue.dialogues[actor] = {};
    Dialogue.dialogues[actor][dialogue.id] = dialogue;
}

/*
 * Enact a dialogue 
 *
 * Note that this can also result in events being fired
 *
 * @param actor the ID of the actor speaking
 * @param player the ID of the player interacting with the actor
 * @response the response id [optional]
 *
 * @return the dialogue to show (text) and also any responses to display
 */
Dialogue.interact = function(actor,player,response){
    
    var state = Dialogue.__getState(actor, player);
    var dialogue;

    //
    // If a response id is passed along, see if it matches a dialogue element
    //
    if (response){  
        var response_dialogue = Dialogue.__getDialogue(actor,response);
        if (response_dialogue){
            //
            // If its an integer response, move the dialogue state as this is a
            // response choice
            //
            if (parseInt(response)){
                state = response_dialogue.next;
                Dialogue.__setState(actor, player, state);
                dialogue = Dialogue.__getDialogue(actor,state);
            } else {
            //
            // ... otherwise this was a "what about the [item]" type of choice
            // so we return the dialogue but don't modify the state
            //
                dialogue = response_dialogue;
            }
        } 
            
        //
        // Process events
        //
    } else {
        dialogue = Dialogue.__getDialogue(actor,state);
    }
    
    if (!dialogue) return null;
    
    var text;
    var responses;
    
    //
    // Process responses
    //
    var responses = new Array();
    if (dialogue.responses){
        for (r in dialogue.responses){
            var response = Dialogue.__getDialogue(actor,dialogue.responses[r]);
            responses.push({id:response.id, text:response.text});
        }
    }
    
    var dialogue_processed = {};
    dialogue_processed.text = dialogue.text;
    dialogue_processed.responses = responses;
    
    //
    // Move the conversation on
    //
    if (dialogue.next){
        Dialogue.__setState(actor, player, dialogue.next);
    }
    
    return dialogue_processed;
}

/*
 * Parse a simple dialogue tree file
 */
Dialogue.parse = function(actor, text){
   var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
   for (line in lines){
        var dialogue_line =  lines[line];
        var dialogue = {};
    
        //
        // Each line starts with a number (the id) or a word (topic)
        //
        dialogue.id = parseInt(dialogue_line);
        if (isNaN(dialogue.id)){
            dialogue.id = dialogue_line.substr(0, dialogue_line.indexOf(":"));
            dialogue_line = dialogue_line.substr(dialogue.id.toString().length+1);
        } else {
            dialogue_line = dialogue_line.substr(dialogue.id.toString().length);
        }
        
        //
        // At the end is either a choice [1,2] or a next -> indicator
        //
        if (dialogue_line.indexOf("->") != -1){
            var str = dialogue_line.split("->");
            dialogue_line = str[0];
            dialogue.next= parseInt(str[1]);
        }
        if (dialogue_line.indexOf("[") != -1){
            var choices = dialogue_line.substr(dialogue_line.indexOf("["));
            dialogue.responses = JSON.parse(choices);
            dialogue_line = dialogue_line.split("[")[0];
        }
        dialogue.text = dialogue_line.trim();
        Dialogue.__setDialogue(actor, dialogue);
    } 
}

/*
 * Loads a dialogue file
 * @param actor the actor to associate with the dialogue
 * @file the path to the file
 * @return a dialogue object
 */
Dialogue.load = function(actor, file){
    console.log(file);
    var fs = require('fs');
    fs.readFile(file, function (err, data) {
      if (err) {
        throw err; 
      }
      Dialogue.parse(actor, data.toString());
    });
}




