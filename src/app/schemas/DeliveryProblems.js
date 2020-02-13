import mongoose from 'mongoose';

const DeliveryProblemsSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    delivery_id: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DeliveryProblems', DeliveryProblemsSchema);
