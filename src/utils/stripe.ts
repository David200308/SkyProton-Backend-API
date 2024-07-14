import Stripe from 'stripe';
import { CreateStripePaymentSessionSchema } from '../schemas/payment';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2024-06-20',
});

export const createStripePaymentSession = async (data: CreateStripePaymentSessionSchema) => {
	const amount = data.amount * 100;

	return stripe.checkout.sessions.create(
		{
			success_url: `${process.env.BACKEND_URL}/payment/stripe/callback/${data.paymentId}/{CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.BACKEND_URL}/payment/stripe/callback/${data.paymentId}`,
			invoice_creation: {
				enabled: true,
			},
			allow_promotion_codes: true,
			payment_method_types: ['card'],
			locale: 'auto',
			mode: 'payment',
			phone_number_collection: { enabled: true },
			line_items: [
				{
					quantity: 1,
					price_data: {
						currency: data.currency,
						unit_amount: amount,
						tax_behavior: 'inclusive',
						product_data: {
							name: "Payment",
						},
					},
				},
			],
		},
		{ apiKey: process.env.STRIPE_SECRET_KEY ?? '' }
	);
};
