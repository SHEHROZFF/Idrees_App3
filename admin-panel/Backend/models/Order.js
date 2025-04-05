// models/Order.js
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        subjectName: { type: String, required: true },
        subjectCode: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    status: {
      type: String,
      required: true,
      default: 'completed',
      enum: ['pending', 'completed', 'cancelled'],
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;








// // models/Order.js

// const mongoose = require('mongoose');

// const orderSchema = mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: 'User',
//     },
//     orderItems: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           required: true,
//           ref: 'Product',
//         },
//         // examName: { type: String, required: false },
//         subjectName: { type: String, required: true },
//         subjectCode: { type: String, required: true },
//         price: { type: Number, required: true },
//         image: { type: String, required: true },
//         quantity: { type: Number, required: true, default: 1 },
//       },
//     ],
//     totalPrice: {
//       type: Number,
//       required: true,
//       default: 0.0,
//     },
//     paymentMethod: {
//       type: String,
//       required: true,
//     },
//     isPaid: {
//       type: Boolean,
//       required: true,
//       default: false,
//     },
//     paidAt: {
//       type: Date,
//     },
//     paymentResult: {
//       id: { type: String },
//       status: { type: String },
//       update_time: { type: String },
//       email_address: { type: String },
//     },
//     status: {
//       type: String,
//       required: true,
//       default: 'completed', // Set default status to 'completed'
//       enum: ['pending', 'completed', 'cancelled'], // Define allowed statuses
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Order = mongoose.model('Order', orderSchema);

// module.exports = Order;











// // models/Order.js

// const mongoose = require('mongoose');

// const orderSchema = mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     orderItems: [
//       {
//         product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//         examName: { type: String, required: true },
//         subjectName: { type: String, required: true },
//         subjectCode: { type: String, required: true },
//         price: { type: Number, required: true },
//         image: { type: String, required: true },
//       },
//     ],
//     totalPrice: { type: Number, required: true },
//     paymentMethod: { type: String, required: true },
//     isPaid: { type: Boolean, required: true, default: false },
//     paidAt: { type: Date },
//     paymentResult: {
//       id: { type: String },
//       status: { type: String },
//     },
//     isDelivered: { type: Boolean, required: true, default: false },
//     deliveredAt: { type: Date },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Order = mongoose.model('Order', orderSchema);

// module.exports = Order;
