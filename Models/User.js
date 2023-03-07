import mongoose from 'mongoose';
import { generateHashedPassword } from '../utils/encryption.js';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';


const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: [true, `Missing field 'email'`], unique: true, trim: true },
    firstName: { type: String, required: [true, `Missing field 'firstName'`], trim: true },
    lastName: { type: String, required: [true, `Missing field 'lastName'`], trim: true },
    balance: { type: Number, default: 0, min: 0 },
    salt: { type: String },
    pass: { type: String },
    tokenDate: { type: Date, default: new Date() }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

userSchema.method({
  authenticate: function (password) {
    return generateHashedPassword(this.salt, password) === this.pass;
  },
  clean: function () {
    const user = this.toObject();
    delete user.salt;
    delete user.pass;
    delete user.__v;

    return user;
  }
});

userSchema.plugin(aggregatePaginate);
const User = mongoose.model('User', userSchema);

export default User;
