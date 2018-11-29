var mongoose = require('mongoose');
var model = mongoose.model('labels',new mongoose.Schema({
    date: Date
    , url: String
    , label: String
    , image: Buffer
    , text: String
}));

exports.getModel = function() {
    return model
}