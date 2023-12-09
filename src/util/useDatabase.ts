import { User } from "@supabase/gotrue-js";
import type { Stripe } from "stripe";

import { toDateTime } from "./helpers";
import { stripe } from "./stripeServer";
import type {
	SupabaseCustomer,
	SupabasePrice,
	SupabaseProduct,
	SupabaseSubscription,
} from "./supabaseClient";
import { supabaseAdmin } from "./supabaseServer";

// This entire file should be removed and moved to supabase-admin
// It's not a react hook, so it shouldn't have useDatabase format
// It should also properly catch and throw errors
export const upsertProductRecord = async (
	product: Stripe.Product
): Promise<void> => {
	const productData: SupabaseProduct = {
		id: product.id,
		active: product.active,
		name: product.name,
		description: product.description,
		image: product.images?.[0] ?? null,
		metadata: product.metadata,
	};

	const { error } = await supabaseAdmin
		.from("products")
		.insert([productData], { upsert: true });
	if (error) throw error;
};

export const upsertPriceRecord = async (price: Stripe.Price): Promise<void> => {
	const priceData: SupabasePrice = {
		id: price.id,
		product_id:
			typeof price.product === "string"
				? price.product
				: price.product.id,
		active: price.active,
		currency: price.currency,
		description: price.nickname,
		type: price.type,
		unit_amount: price.unit_amount,
		interval: price.recurring?.interval ?? null,
		interval_count: price.recurring?.interval_count ?? null,
		trial_period_days: price.recurring?.trial_period_days ?? null,
		metadata: price.metadata,
	};

	const { error } = await supabaseAdmin
		.from("prices")
		.insert([priceData], { upsert: true });
	if (error) throw error;
};

export const createOrRetrieveCustomer = async (user: User): Promise<string> => {
	const { email, id: uuid } = user;
	const { data, error } = await supabaseAdmin
		.from<SupabaseCustomer>("customers")
		.select("stripe_customer_id")
		.eq("id", uuid)
		.single();

	if (error) {
		// No customer record found, let's create one.
		const customerData: Stripe.CustomerCreateParams = {
			metadata: {
				supabaseUUID: uuid,
			},
		};

		if (email) customerData.email = email;

		const customer = await stripe.customers.create(customerData);

		// Now insert the customer ID into our Supabase mapping table.
		const { error: supabaseError } = await supabaseAdmin
			.from("customers")
			.insert([{ id: uuid, stripe_customer_id: customer.id }]);

		if (supabaseError) throw supabaseError;

		return customer.id;
	}

	if (!data)
		throw new Error("No data retrieved in createOrRetrieveCustomer.");

	return data.stripe_customer_id;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
export const copyBillingDetailsToCustomer = async (
	uuid: string,
	payment_method: Stripe.PaymentMethod
): Promise<void> => {
	const customer = payment_method.customer;
	const { name, phone, address } = payment_method.billing_details;
	if (!customer) {
		throw new Error("No customer in copyBillingDetailsToCustomer.");
	}
	await stripe.customers.update(
		typeof customer === "string" ? customer : customer.id,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Seems like discrepancy in Stripe types.
		{ name, phone, address }
	);

	const { error } = await supabaseAdmin
		.from("users")
		.update({
			billing_address: address,
			payment_method: payment_method[payment_method.type],
		})
		.eq("id", uuid);

	if (error) throw error;
};

export const manageSubscriptionStatusChange = async (
	subscriptionId: string,
	customerId: string,
	createAction = false
): Promise<void> => {
	// Get customer's UUID from mapping table.
	const { data, error: noCustomerError } = await supabaseAdmin
		.from<SupabaseCustomer>("customers")
		.select("id")
		.eq("stripe_customer_id", customerId)
		.single();
	if (noCustomerError) throw noCustomerError;
	if (!data) {
		throw new Error("No data on manageSubscriptionStatusChange.");
	}
	const { id: uuid } = data;

	const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
		expand: ["default_payment_method"],
	});
	// Upsert the latest status of the subscription object.
	const subscriptionData: SupabaseSubscription = {
		id: subscription.id,
		user_id: uuid,
		metadata: subscription.metadata,
		status: subscription.status,
		price_id: subscription.items.data[0].price.id,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore FIXME Stripe types.
		quantity: subscription.quantity, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		cancel_at_period_end: subscription.cancel_at_period_end,
		cancel_at: subscription.cancel_at
			? toDateTime(subscription.cancel_at)
			: null,
		canceled_at: subscription.canceled_at
			? toDateTime(subscription.canceled_at)
			: null,
		current_period_start: toDateTime(subscription.current_period_start),
		current_period_end: toDateTime(subscription.current_period_end),
		created: toDateTime(subscription.created),
		ended_at: subscription.ended_at
			? toDateTime(subscription.ended_at)
			: null,
		trial_start: subscription.trial_start
			? toDateTime(subscription.trial_start)
			: null,
		trial_end: subscription.trial_end
			? toDateTime(subscription.trial_end)
			: null,
	};

	const { error } = await supabaseAdmin
		.from("subscriptions")
		.insert([subscriptionData], { upsert: true });
	if (error) throw error;

	// For a new subscription copy the billing details to the customer object.
	// NOTE: This is a costly operation and should happen at the very end.
	if (createAction && subscription.default_payment_method) {
		if (typeof subscription.default_payment_method === "string") {
			throw new Error(
				"Expected Stripe.PaymentMethod in manageSubscriptionStatusChange, got string."
			);
		}
		await copyBillingDetailsToCustomer(
			uuid,
			subscription.default_payment_method
		);
	}
};
