import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env from backend directory is loaded regardless of process.cwd()
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID?.trim() || 'rzp_test_placeholder';
const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || 'rzp_test_secret';

/**
 * Centralized Razorpay SDK Client
 */
const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/**
 * Fetch/create a new Razorpay order through the Razorpay Orders API
 * @param {Object} params
 * @param {number} params.amount - Order amount in paise (Rupees * 100)
 * @param {string} [params.currency='INR'] - Currency code
 * @param {string} params.receipt - Internal order receipt tracking string
 * @param {Object} [params.notes={}] - Key-value metadata notes attached to the order
 * @returns {Promise<Object>} Razorpay Order response object
 */
export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  return await razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes,
  });
};

/**
 * Fetch existing order information directly from Razorpay API
 * @param {string} orderId - Razorpay order ID (e.g. order_xxx)
 * @returns {Promise<Object>} Order details from Razorpay
 */
export const fetchRazorpayOrder = async (orderId) => {
  return await razorpay.orders.fetch(orderId);
};

/**
 * Fetch payment information directly from Razorpay API
 * @param {string} paymentId - Razorpay payment ID (e.g. pay_xxx)
 * @returns {Promise<Object>} Payment details from Razorpay
 */
export const fetchRazorpayPayment = async (paymentId) => {
  return await razorpay.payments.fetch(paymentId);
};

/**
 * Fetch payments associated with a specific Razorpay order
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Object>} List of payments for the order
 */
export const fetchRazorpayOrderPayments = async (orderId) => {
  return await razorpay.orders.fetchPayments(orderId);
};

export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID?.trim() || keyId;
export const getRazorpayKeySecret = () => process.env.RAZORPAY_KEY_SECRET?.trim() || keySecret;

export default razorpay;
