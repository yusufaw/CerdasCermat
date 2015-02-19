/**
 * Created by ucup_aw on 07/02/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var questionSchema = Schema({
    question: String,
    answer: String
});

module.exports = mongoose.model('Question', questionSchema);
