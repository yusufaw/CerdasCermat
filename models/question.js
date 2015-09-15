/**
 * Created by ucup_aw on 07/02/15.
 */

var mongoose = require('mongoose');
var random = require('mongoose-random');
var Schema = mongoose.Schema;
var questionSchema = Schema({
    question: String,
    A : String,
    B : String,
    C : String,
    D : String,
    answer: String
}).plugin(random, { path: 'r' });

module.exports = mongoose.model('Question', questionSchema);
