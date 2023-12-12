import { Tables } from "./database.types";

export interface PriceWithProduct extends Tables<"prices"> {
	products: Tables<"products">;
}

export interface SubscriptionWithPrice extends Tables<"subscriptions"> {
	prices: PriceWithProduct;
}
