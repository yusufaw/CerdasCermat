/**
 * Created by ucup_aw on 19/02/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = Schema({
    username: String,
    password: String,
    email: String,
    registered:{
        type: Date, default: Date.now
    },
    jumlah_main: {
        type: Number, default: 0
    },
    jumlah_menang:{
        type: Number, default: 0
    },
    jumlah_poin:{
        type: Number, default: 0
    },
    avatar:{
        type: String, default: 'content/images/user.png                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 '
    }
});

module.exports = mongoose.model('User', userSchema);