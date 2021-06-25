const { Schema, model } = require('mongoose');


const Doc = new Schema({
    _id: String,
    html: String,
    css: String,
    js: String
});

module.exports = model('Doc', Doc);