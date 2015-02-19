/**
 * Created by ucup_aw on 19/02/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = Schema({
    username: String,
    password: String,
    registered:{
        type: Date, default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);