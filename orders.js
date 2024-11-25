const cuid = require('cuid')

const db = require('./db')

const Order = db.model('Order', {
  _id: { type: String, default: cuid },
  buyerEmail: { type: String, required: true },
  products: [{
    type: String,
    ref: 'Product', // ref will automatically fetch associated products for us
    index: true,
    required: true
  }],
  status: {
    type: String,
    index: true,
    default: 'CREATED',
    enum: ['CREATED', 'PENDING', 'COMPLETED']
  }
})

/**
 * List orders
 * @param {Object} options
 * @returns {Promise<Array>}
 */
async function list(options = {}) {

  const { offset = 0, limit = 25, productId, status } = options;

  const productQuery = productId ? {
    products: productId
  } : {}

  const statusQuery = status ? {
    status: status
  } : {}

  const query = {
    ...productQuery,
    ...statusQuery
  }

  const orders = await Order.find(query)
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit)

  return orders
}

/**
 * Get an order
 * @param {Object} order
 * @returns {Promise<Object>}
 */
async function get (_id) {
  // using populate will automatically fetch the associated products.
  // if you don't use populate, you will only get the product ids
  const order = await Order.findById(_id)
    .populate('products')
    .exec()
  
  return order
}

/**
 * Create an order
 * @param {Object} order
 * @returns {Promise<Object>}
 */
async function create (fields) {
  const order = await new Order(fields).save()
  await order.populate('products')
  return order
}


/**
 * Edit an existing order
 * @param {String} _id
 * @param {Object} change
 * @returns {Promise<Object>}
 */
async function edit(_id, change) {
  const order = await Order.findById(_id);
  if (!order) throw new Error(`Order with ID ${_id} not found`);

  Object.assign(order, change); // Update the fields with the changes
  await order.save(); // Save the updated order to the database

  return order;
}

/**
 * Delete an existing order
 * @param {String} _id
 * @returns {Promise<void>}
 */
async function destroy(_id) {
  const result = await Order.deleteOne({ _id });
  if (result.deletedCount === 0) {
    throw new Error(`Order with ID ${_id} not found`);
  }
}


module.exports = {
  create,
  get,
  list,
  edit,
  destroy,
};

