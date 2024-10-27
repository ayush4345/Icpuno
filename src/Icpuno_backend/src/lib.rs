use candid::{CandidType, Deserialize,Principal};
use ic_cdk::storage;
use ic_cdk::*;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

// Struct to represent a game
#[derive(CandidType, Deserialize, Clone)]
struct Game {
    id: u64,
    players: Vec<String>,
    is_active: bool,
    current_player_index: usize,
    state_hash: String,
    last_action_timestamp: u64,
    turn_count: u64,
    direction_clockwise: bool,
    is_started: bool,
}

// Struct to represent an action within a game
#[derive(CandidType, Deserialize, Clone)]
struct Action {
    player: String,
    action_hash: String,
    timestamp: u64,
}

// Storage to keep track of game states and actions
type Games = HashMap<u64, Game>;
type GameActions = HashMap<u64, Vec<Action>>;

// Global storage for games and game actions
#[ic_cdk::init]
fn init() {
    storage::stable_save((Games::new(), GameActions::new())).unwrap();
}

// Function to create a new game
#[ic_cdk::update]
fn create_game(creator: String) -> u64 {
    let (mut games, mut actions): (Games, GameActions) = storage::stable_restore().unwrap();

    let new_game_id = games.len() as u64 + 1;
    let initial_state_hash = hash_state(new_game_id, &creator);
    
    let game = Game {
        id: new_game_id,
        players: vec![creator.clone()],
        is_active: true,
        current_player_index: 0,
        state_hash: initial_state_hash,
        last_action_timestamp: current_timestamp(),
        turn_count: 0,
        direction_clockwise: true,
        is_started: false,
    };

    games.insert(new_game_id, game);
    storage::stable_save((games, actions)).unwrap();

    new_game_id
}

// Function to start a game
#[ic_cdk::update]
fn start_game(game_id: u64) -> Result<(), String> {
    let (mut games, actions): (Games, GameActions) = storage::stable_restore().unwrap();
    
    if let Some(game) = games.get_mut(&game_id) {
        if game.is_started {
            return Err("Game already started".to_string());
        }
        if game.players.len() < 2 {
            return Err("Not enough players".to_string());
        }

        game.is_started = true;
        game.state_hash = hash_state(game_id, &game.players.join(","));
        game.last_action_timestamp = current_timestamp();
        
        storage::stable_save((games, actions)).unwrap();
        Ok(())
    } else {
        Err("Game not found".to_string())
    }
}

// Function to join a game
#[ic_cdk::update]
fn join_game(game_id: u64, joinee: String) -> Result<(), String> {
    let (mut games, actions): (Games, GameActions) = storage::stable_restore().unwrap();
    
    if let Some(game) = games.get_mut(&game_id) {
        if !game.is_active {
            return Err("Game is not active".to_string());
        }
        if game.players.len() >= 10 {
            return Err("Game is full".to_string());
        }

        game.players.push(joinee.clone());
        storage::stable_save((games, actions)).unwrap();
        Ok(())
    } else {
        Err("Game not found".to_string())
    }
}

// Function to submit an action in the game
#[ic_cdk::update]
fn submit_action(game_id: u64, action_hash: String, actor: String) -> Result<(), String> {
    let (mut games, mut actions): (Games, GameActions) = storage::stable_restore().unwrap();
    
    if let Some(game) = games.get_mut(&game_id) {
        if !game.is_active {
            return Err("Game is not active".to_string());
        }
        if !is_player_turn(game, &actor) {
            return Err("Not your turn".to_string());
        }

        game.state_hash = format!("{:x}", md5::compute(format!("{}{}", game.state_hash, action_hash)));
        let action = Action {
            player: actor.clone(),
            action_hash,
            timestamp: current_timestamp(),
        };
        
        actions.entry(game_id).or_default().push(action);
        update_game_state(game);

        storage::stable_save((games, actions)).unwrap();
        Ok(())
    } else {
        Err("Game not found".to_string())
    }
}

// Internal function to update the game state after an action
fn update_game_state(game: &mut Game) {
    game.turn_count += 1;
    game.current_player_index = (game.current_player_index + 1) % game.players.len();
    game.last_action_timestamp = current_timestamp();
}

// Helper function to check if it's a player's turn
fn is_player_turn(game: &Game, player: &String) -> bool {
    game.players[game.current_player_index] == *player
}

// Helper function to get the current timestamp
fn current_timestamp() -> u64 {
    ic_cdk::api::time() // Returns the time since the canister was created in nanoseconds.
}

// Helper function to generate a hash from the game state
fn hash_state(game_id: u64, seed: &str) -> String {
    format!("{:x}", md5::compute(format!("{}{}", game_id, seed)))
}

// Function to end a game
#[ic_cdk::update]
fn end_game(game_id: u64, actor: String) -> Result<(), String> {
    let (mut games, mut actions): (Games, GameActions) = storage::stable_restore().unwrap();
    
    if let Some(game) = games.get_mut(&game_id) {
        if !game.is_active {
            return Err("Game is not active".to_string());
        }
        if !is_player_turn(game, &actor) {
            return Err("Not your turn".to_string());
        }

        game.is_active = false;
        storage::stable_save((games, actions)).unwrap();
        Ok(())
    } else {
        Err("Game not found".to_string())
    }
}

// Function to get the game state
#[ic_cdk::query]
fn get_game_state(game_id: u64) -> Result<Game, String> {
    let (games, _): (Games, GameActions) = storage::stable_restore().unwrap();
    
    if let Some(game) = games.get(&game_id) {
        Ok(game.clone())
    } else {
        Err("Game not found".to_string())
    }
}

// Function to get game actions
#[query]
fn get_game_actions(game_id: u64) -> Result<Vec<Action>, String> {
    let (_, actions): (Games, GameActions) = storage::stable_restore().unwrap();
    
    if let Some(action_list) = actions.get(&game_id) {
        Ok(action_list.clone())
    } else {
        Err("Game not found".to_string())
    }
}


#[ic_cdk::query]
fn who_am_i() -> Principal{
    ic_cdk::caller()
}

// Enable Candid export
ic_cdk::export_candid!();