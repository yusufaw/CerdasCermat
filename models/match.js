/**
 * Created by ucup_aw on 24/09/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var matchSchema = Schema({
    u: [String],
    p: {
        type: [Number], default: 0
    },
    d:{
        type: Date, default: Date.now
    }
});

module.exports = mongoose.model('Match', matchSchema);