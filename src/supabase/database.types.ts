export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
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
						referencedColumns: ["bulk_job_id"];
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
				Relationships: [];
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
					error: Json | null;
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
					error?: Json | null;
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
					error?: Json | null;
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
				Relationships: [];
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
				Relationships: [];
			};
		};
		Views: {
			bulk_jobs_info: {
				Row: {
					bulk_job_id: number | null;
					created_at: string | null;
					invalid: number | null;
					last_call_time: string | null;
					number_of_emails: number | null;
					risky: number | null;
					safe: number | null;
					unknown: number | null;
					user_id: string | null;
					verified: number | null;
				};
				Relationships: [];
			};
			commercial_license_trial: {
				Row: {
					calls_last_day: number | null;
					calls_last_minute: number | null;
					first_call_in_past_24h: string | null;
					user_id: string | null;
				};
				Relationships: [];
			};
			sub_and_calls: {
				Row: {
					cancel_at: string | null;
					current_period_end: string | null;
					current_period_start: string | null;
					number_of_calls: number | null;
					product_id: string | null;
					status:
						| Database["public"]["Enums"]["subscription_status"]
						| null;
					subscription_id: string | null;
					user_id: string | null;
				};
				Relationships: [];
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
			get_bulk_results: {
				Args: {
					id_param: number;
				};
				Returns: {
					id: number;
					email: string;
					is_reachable: Database["public"]["Enums"]["is_reachable_type"];
					result: Json;
					verified_at: string;
				}[];
			};
			get_user_calls_count: {
				Args: {
					created_at_param: string;
				};
				Returns: number;
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
					user_metadata: Json | null;
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
					user_metadata?: Json | null;
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
					user_metadata?: Json | null;
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
			s3_multipart_uploads: {
				Row: {
					bucket_id: string;
					created_at: string;
					id: string;
					in_progress_size: number;
					key: string;
					owner_id: string | null;
					upload_signature: string;
					user_metadata: Json | null;
					version: string;
				};
				Insert: {
					bucket_id: string;
					created_at?: string;
					id: string;
					in_progress_size?: number;
					key: string;
					owner_id?: string | null;
					upload_signature: string;
					user_metadata?: Json | null;
					version: string;
				};
				Update: {
					bucket_id?: string;
					created_at?: string;
					id?: string;
					in_progress_size?: number;
					key?: string;
					owner_id?: string | null;
					upload_signature?: string;
					user_metadata?: Json | null;
					version?: string;
				};
				Relationships: [
					{
						foreignKeyName: "s3_multipart_uploads_bucket_id_fkey";
						columns: ["bucket_id"];
						isOneToOne: false;
						referencedRelation: "buckets";
						referencedColumns: ["id"];
					}
				];
			};
			s3_multipart_uploads_parts: {
				Row: {
					bucket_id: string;
					created_at: string;
					etag: string;
					id: string;
					key: string;
					owner_id: string | null;
					part_number: number;
					size: number;
					upload_id: string;
					version: string;
				};
				Insert: {
					bucket_id: string;
					created_at?: string;
					etag: string;
					id?: string;
					key: string;
					owner_id?: string | null;
					part_number: number;
					size?: number;
					upload_id: string;
					version: string;
				};
				Update: {
					bucket_id?: string;
					created_at?: string;
					etag?: string;
					id?: string;
					key?: string;
					owner_id?: string | null;
					part_number?: number;
					size?: number;
					upload_id?: string;
					version?: string;
				};
				Relationships: [
					{
						foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey";
						columns: ["bucket_id"];
						isOneToOne: false;
						referencedRelation: "buckets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey";
						columns: ["upload_id"];
						isOneToOne: false;
						referencedRelation: "s3_multipart_uploads";
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
				Returns: string[];
			};
			get_size_by_bucket: {
				Args: Record<PropertyKey, never>;
				Returns: {
					size: number;
					bucket_id: string;
				}[];
			};
			list_multipart_uploads_with_delimiter: {
				Args: {
					bucket_id: string;
					prefix_param: string;
					delimiter_param: string;
					max_keys?: number;
					next_key_token?: string;
					next_upload_token?: string;
				};
				Returns: {
					key: string;
					id: string;
					created_at: string;
				}[];
			};
			list_objects_with_delimiter: {
				Args: {
					bucket_id: string;
					prefix_param: string;
					delimiter_param: string;
					max_keys?: number;
					start_after?: string;
					next_token?: string;
				};
				Returns: {
					name: string;
					id: string;
					metadata: Json;
					updated_at: string;
				}[];
			};
			operation: {
				Args: Record<PropertyKey, never>;
				Returns: string;
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
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
	: PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
			PublicSchema["Views"])
	? (PublicSchema["Tables"] &
			PublicSchema["Views"])[PublicTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof PublicSchema["Tables"]
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
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
	? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof PublicSchema["Tables"]
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
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
	? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof PublicSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
	? PublicSchema["Enums"][PublicEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
	? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;
