const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true
  },
    lastName: {
        type: String,
        required: true
  },
    phone: String,
    createdAt: {
        type: Date,
        default: Date.now
  }
});
UserSchema.pre('save',async function(){
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password,12);
})

UserSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
};
module.exports = mongoose.model('User', UserSchema);