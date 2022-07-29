const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const User = require('./user')
const app = express()
const port = 4000

require('dotenv').config()
mongoose.connect(process.env.BASEDEDATOS)
app.use(express.json())

const singToken = _id => jwt.sign({ _id }, process.env.STRINGSECRET)


app.post('/register', async (req, res) => {
    const { body }  = req
    console.log({ body })
    try {
        const isUser = await User.findOne( {email: body.email})
        if(isUser){
            return res.status(403).send('Usuario ya existente')
        }
        const salt = await bcrypt.genSalt()
        const hashed = await bcrypt.hash(body.password, salt);
        const user = await User.create( { email: body.email, password: hashed, salt})
        const signed = singToken(user._id)
        res.status(201).send(signed)
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
})

app.listen(port, () => {
    console.log('listening in port 4000')
})