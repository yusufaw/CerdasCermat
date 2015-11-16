/**
 * Created by ucup_aw on 07/02/15.
 */

var mongoose = require('mongoose');
var random = require('mongoose-random');
var Schema = mongoose.Schema;
var questionSchema = Schema({
    question: String,
    choice: [String],
    answer: String,
    no: {
        type: [Number], default: 0
    },
    d:{
        type: Date, default: Date.now
    },
    contributor: String
}).plugin(random, { path: 'r' });

module.exports = mongoose.model('Question', questionSchema);
