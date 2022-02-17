const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const buyerSchema = new mongoose.Schema({
    firstname : {
        type:String,
        required:true
    },
    lastname : {
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type:Number,
        required:true,
        unique: true
    },
    password: {
        type:String,
        required:true
    },
    confirmpassword: {
        type:String,
        required:true
    },
    address: {
        type:String,
        required:true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
})

//converting password into hash
buyerSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
       
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})

//we need to create collections

const Buyer = new mongoose.model("Buyer", buyerSchema);

module.exports = Buyer;