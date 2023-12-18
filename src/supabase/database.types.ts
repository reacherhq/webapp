export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			bulk_emails: {
				Row: {
					bulk_job_id: number;
					created_at: string | null;
					email: string;
					id: number;
				};
				Insert: {
					bulk_job_id: number;
					created_at?: string | null;
					email: string;
					id?: number;
				};
				Update: {
					bulk_job_id?: number;
					created_at?: string | null;
					email?: string;
					id?: number;
				};
				Relationships: [
					{
						foreignKeyName: "bulk_emails_bulk_job_id_fkey";
						columns: ["bulk_job_id"];
						isOneToOne: false;
						referencedRelation: "bulk_jobs";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "bulk_emails_bulk_job_id_fkey";
						columns: ["bulk_job_id"];
						isOneToOne: false;
						referencedRelation: "bulk_jobs_info";
						referencedColumns: ["job_id"];
					}
				];
			};
			bulk_jobs: {
				Row: {
					created_at: string | null;
					id: number;
					payload: Json;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					id?: number;
					payload: Json;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					id?: number;
					payload?: Json;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "bulk_jobs_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			calls: {
				Row: {
					backend: string | null;
					backend_ip: string | null;
					bulk_email_id: number | null;
					created_at: string | null;
					domain: string | null;
					duration: number | null;
					endpoint: string;
					id: number;
					is_reachable:
						| Database["public"]["Enums"]["is_reachable_type"]
						| null;
					result: Json | null;
					user_id: string;
					verif_method: string | null;
					verification_id: string;
				};
				Insert: {
					backend?: string | null;
					backend_ip?: string | null;
					bulk_email_id?: number | null;
					created_at?: string | null;
					domain?: string | null;
					duration?: number | null;
					endpoint: string;
					id?: number;
					is_reachable?:
						| Database["public"]["Enums"]["is_reachable_type"]
						| null;
					result?: Json | null;
					user_id: string;
					verif_method?: string | null;
					verification_id?: string;
				};
				Update: {
					backend?: string | null;
					backend_ip?: string | null;
					bulk_email_id?: number | null;
					created_at?: string | null;
					domain?: string | null;
					duration?: number | null;
					endpoint?: string;
					id?: number;
					is_reachable?:
						| Database["public"]["Enums"]["is_reachable_type"]
						| null;
					result?: Json | null;
					user_id?: string;
					verif_method?: string | null;
					verification_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "calls_bulk_email_id_fkey";
						columns: ["bulk_email_id"];
						isOneToOne: false;
						referencedRelation: "bulk_emails";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "calls_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			customers: {
				Row: {
					id: string;
					stripe_customer_id: string | null;
				};
				Insert: {
					id: string;
					stripe_customer_id?: string | null;
				};
				Update: {
					id?: string;
					stripe_customer_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "customers_id_fkey";
						columns: ["id"];
						isOneToOne: true;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			prices: {
				Row: {
					active: boolean | null;
					currency: string | null;
					description: string | null;
					id: string;
					interval:
						| Database["public"]["Enums"]["pricing_plan_interval"]
						| null;
					interval_count: number | null;
					metadata: Json | null;
					product_id: string | null;
					trial_period_days: number | null;
					type: Database["public"]["Enums"]["pricing_type"] | null;
					unit_amount: number | null;
				};
				Insert: {
					active?: boolean | null;
					currency?: string | null;
					description?: string | null;
					id: string;
					interval?:
						| Database["public"]["Enums"]["pricing_plan_interval"]
						| null;
					interval_count?: number | null;
					metadata?: Json | null;
					product_id?: string | null;
					trial_period_days?: number | null;
					type?: Database["public"]["Enums"]["pricing_type"] | null;
					unit_amount?: number | null;
				};
				Update: {
					active?: boolean | null;
					currency?: string | null;
					description?: string | null;
					id?: string;
					interval?:
						| Database["public"]["Enums"]["pricing_plan_interval"]
						| null;
					interval_count?: number | null;
					metadata?: Json | null;
					product_id?: string | null;
					trial_period_days?: number | null;
					type?: Database["public"]["Enums"]["pricing_type"] | null;
					unit_amount?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "prices_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "prices_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "sub_and_calls";
						referencedColumns: ["product_id"];
					}
				];
			};
			products: {
				Row: {
					active: boolean | null;
					description: string | null;
					id: string;
					image: string | null;
					metadata: Json | null;
					name: string | null;
				};
				Insert: {
					active?: boolean | null;
					description?: string | null;
					id: string;
					image?: string | null;
					metadata?: Json | null;
					name?: string | null;
				};
				Update: {
					active?: boolean | null;
					description?: string | null;
					id?: string;
					image?: string | null;
					metadata?: Json | null;
					name?: string | null;
				};
				Relationships: [];
			};
			subscriptions: {
				Row: {
					cancel_at: string | null;
					cancel_at_period_end: boolean | null;
					canceled_at: string | null;
					created: string;
					current_period_end: string;
					current_period_start: string;
					ended_at: string | null;
					id: string;
					metadata: Json | null;
					price_id: string | null;
					quantity: number | null;
					status:
						| Database["public"]["Enums"]["subscription_status"]
						| null;
					trial_end: string | null;
					trial_start: string | null;
					user_id: string;
				};
				Insert: {
					cancel_at?: string | null;
					cancel_at_period_end?: boolean | null;
					canceled_at?: string | null;
					created?: string;
					current_period_end?: string;
					current_period_start?: string;
					ended_at?: string | null;
					id: string;
					metadata?: Json | null;
					price_id?: string | null;
					quantity?: number | null;
					status?:
						| Database["public"]["Enums"]["subscription_status"]
						| null;
					trial_end?: string | null;
					trial_start?: string | null;
					user_id: string;
				};
				Update: {
					cancel_at?: string | null;
					cancel_at_period_end?: boolean | null;
					canceled_at?: string | null;
					created?: string;
					current_period_end?: string;
					current_period_start?: string;
					ended_at?: string | null;
					id?: string;
					metadata?: Json | null;
					price_id?: string | null;
					quantity?: number | null;
					status?:
						| Database["public"]["Enums"]["subscription_status"]
						| null;
					trial_end?: string | null;
					trial_start?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "subscriptions_price_id_fkey";
						columns: ["price_id"];
						isOneToOne: false;
						referencedRelation: "prices";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "subscriptions_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			users: {
				Row: {
					api_token: string | null;
					avatar_url: string | null;
					billing_address: Json | null;
					full_name: string | null;
					id: string;
					payment_method: Json | null;
					sendinblue_contact_id: string | null;
				};
				Insert: {
					api_token?: string | null;
					avatar_url?: string | null;
					billing_address?: Json | null;
					full_name?: string | null;
					id: string;
					payment_method?: Json | null;
					sendinblue_contact_id?: string | null;
				};
				Update: {
					api_token?: string | null;
					avatar_url?: string | null;
					billing_address?: Json | null;
					full_name?: string | null;
					id?: string;
					payment_method?: Json | null;
					sendinblue_contact_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "users_id_fkey";
						columns: ["id"];
						isOneToOne: true;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
		};
		Views: {
			bulk_jobs_info: {
				Row: {
					created_at: string | null;
					job_id: number | null;
					number_of_emails: number | null;
					user_id: string | null;
					verified: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "bulk_jobs_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			sub_and_calls: {
				Row: {
					current_period_end: string | null;
					current_period_start: string | null;
					number_of_calls: number | null;
					product_id: string | null;
					subscription_id: string | null;
					user_id: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "users_id_fkey";
						columns: ["user_id"];
						isOneToOne: true;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
		};
		Functions: {
			bulk_job_info: {
				Args: {
					job_id: number;
				};
				Returns: {
					number_of_email: number;
					verified: number;
					created_at: string;
				}[];
			};
		};
		Enums: {
			is_reachable_type: "safe" | "invalid" | "risky" | "unknown";
			pricing_plan_interval: "day" | "week" | "month" | "year";
			pricing_type: "one_time" | "recurring";
			subscription_status:
				| "trialing"
				| "active"
				| "canceled"
				| "incomplete"
				| "incomplete_expired"
				| "past_due"
				| "unpaid";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	storage: {
		Tables: {
			buckets: {
				Row: {
					allowed_mime_types: string[] | null;
					avif_autodetection: boolean | null;
					created_at: string | null;
					file_size_limit: number | null;
					id: string;
					name: string;
					owner: string | null;
					owner_id: string | null;
					public: boolean | null;
					updated_at: string | null;
				};
				Insert: {
					allowed_mime_types?: string[] | null;
					avif_autodetection?: boolean | null;
					created_at?: string | null;
					file_size_limit?: number | null;
					id: string;
					name: string;
					owner?: string | null;
					owner_id?: string | null;
					public?: boolean | null;
					updated_at?: string | null;
				};
				Update: {
					allowed_mime_types?: string[] | null;
					avif_autodetection?: boolean | null;
					created_at?: string | null;
					file_size_limit?: number | null;
					id?: string;
					name?: string;
					owner?: string | null;
					owner_id?: string | null;
					public?: boolean | null;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			migrations: {
				Row: {
					executed_at: string | null;
					hash: string;
					id: number;
					name: string;
				};
				Insert: {
					executed_at?: string | null;
					hash: string;
					id: number;
					name: string;
				};
				Update: {
					executed_at?: string | null;
					hash?: string;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			objects: {
				Row: {
					bucket_id: string | null;
					created_at: string | null;
					id: string;
					last_accessed_at: string | null;
					metadata: Json | null;
					name: string | null;
					owner: string | null;
					owner_id: string | null;
					path_tokens: string[] | null;
					updated_at: string | null;
					version: string | null;
				};
				Insert: {
					bucket_id?: string | null;
					created_at?: string | null;
					id?: string;
					last_accessed_at?: string | null;
					metadata?: Json | null;
					name?: string | null;
					owner?: string | null;
					owner_id?: string | null;
					path_tokens?: string[] | null;
					updated_at?: string | null;
					version?: string | null;
				};
				Update: {
					bucket_id?: string | null;
					created_at?: string | null;
					id?: string;
					last_accessed_at?: string | null;
					metadata?: Json | null;
					name?: string | null;
					owner?: string | null;
					owner_id?: string | null;
					path_tokens?: string[] | null;
					updated_at?: string | null;
					version?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "objects_bucketId_fkey";
						columns: ["bucket_id"];
						isOneToOne: false;
						referencedRelation: "buckets";
						referencedColumns: ["id"];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			can_insert_object: {
				Args: {
					bucketid: string;
					name: string;
					owner: string;
					metadata: Json;
				};
				Returns: undefined;
			};
			extension: {
				Args: {
					name: string;
				};
				Returns: string;
			};
			filename: {
				Args: {
					name: string;
				};
				Returns: string;
			};
			foldername: {
				Args: {
					name: string;
				};
				Returns: unknown;
			};
			get_size_by_bucket: {
				Args: Record<PropertyKey, never>;
				Returns: {
					size: number;
					bucket_id: string;
				}[];
			};
			search: {
				Args: {
					prefix: string;
					bucketname: string;
					limits?: number;
					levels?: number;
					offsets?: number;
					search?: string;
					sortcolumn?: string;
					sortorder?: string;
				};
				Returns: {
					name: string;
					id: string;
					updated_at: string;
					created_at: string;
					last_accessed_at: string;
					metadata: Json;
				}[];
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (Database["public"]["Tables"] & Database["public"]["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
			Database["public"]["Views"])
	? (Database["public"]["Tables"] &
			Database["public"]["Views"])[PublicTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof Database["public"]["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
	? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof Database["public"]["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
	? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof Database["public"]["Enums"]
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
	? Database["public"]["Enums"][PublicEnumNameOrOptions]
	: never;
