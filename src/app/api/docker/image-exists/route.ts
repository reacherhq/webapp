import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET(): Promise<Response> {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return Response.json({ error: "User not found" }, { status: 401 });
	}

	const dockerUrl = `https://hub.docker.com/v2/repositories/reachertrial/backend-${user.id}/tags/latest`;

	try {
		await axios.get(dockerUrl);
		return Response.json({ ok: true });
	} catch (error) {
		return Response.json("Docker image Found", { status: 404 });
	}
}
