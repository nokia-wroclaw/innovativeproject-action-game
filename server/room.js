module.exports = class Room {
    constructor(slots, code) {
        // TODO: slots validation
        this.slots = slots;
        this.code = code;
        this.players = [];
    }

    join(player) {
        this.players.push(player);
        console.log("Player [" + player.id + "] has joined room '" + this.code + "'");
    }

    disconnect(player_id) {
        if(!this.find_player(player_id)) return;
        this.players = this.players.filter(player => player.id != player_id);
    }

    update(player_id, data) {
        if(!this.find_player(player_id)) return;
        this.find_player(player_id).key_states = data;
    }

    find_player(player_id) {
        return this.players.find(player => player.id == player_id);
    }
}