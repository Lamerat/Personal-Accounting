import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import settings from '../config/settings.js';

const typeEnum = Object.keys(settings.operationType);

const operationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: typeEnum, required: [true, `Missing field 'user`] },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: [true, `Missing field 'user`] },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card', default: null },
    amount: { type: Number, required: [true, `Missing field 'amount'`] },
    description: { type: String, required: [true, `Missing field 'description'`], trim: true },
    recipient: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: null }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);


operationSchema.plugin(aggregatePaginate);
const Operation = mongoose.model('Operation', operationSchema);

export default Operation;
