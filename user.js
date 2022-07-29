const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const esquema = new Schema({
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    salt: {
        type: String,
        require: true,
    },
  });

const User = mongoose.model('User', esquema)

module.exports = User