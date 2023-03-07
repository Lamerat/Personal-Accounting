import mongoose from 'mongoose';
import moment from 'moment';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';


const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: [true, `Missing field 'user`] },
    number: { type: String, required: [true, `Missing field 'number'`], trim: true },
    name: { type: String, required: [true, `Missing field 'name'`], trim: true },
    expMonth: { type: Number, min: 1, max: 12, required: [true, `Missing field 'expMonth'`] },
    expYear: { type: Number, min: moment().year(), required: [true, `Missing field 'expYear'`] },
    cvv: { type: String, required: [true, `Missing field 'cvv'`] },
    brand: { type: String, required: [true, `Missing field 'type'`], trim: true },
    last4: { type: String, required: [true, `Missing field 'last4'`], trim: true },
    salt: { type: String, required: [true, `Missing field 'salt'`], trim: true },
    metadata: { type: mongoose.SchemaTypes.Mixed },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);


cardSchema.plugin(aggregatePaginate);
const Card = mongoose.model('Card', cardSchema);

export default Card;
