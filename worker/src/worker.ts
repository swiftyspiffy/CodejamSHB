import { Authorization, AuthorizationResponse } from "./auth";

export interface Env {
	EXTENSION_SECRET: string
}

const HEADER_EXTENSION_JWT = "X-Extension-Jwt";
const PARAM_ACTION = "action";

export default {
	/**
	 * Entry function for the worker. This is like a "main" in java, or whatever.
	 * @param request https://developers.cloudflare.com/workers/runtime-apis/request/
	 * @param env Environment variables (must sync with deployed env vars)
	 * @param ctx https://developers.cloudflare.com/workers/runtime-apis/request/#the-request-context
	 * @returns https://developers.cloudflare.com/workers/runtime-apis/response/
	 */
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// sanity check the request coming in
		const [isValidRequest, unsuccessfulReason] = this.validateRequest(request);
		if (!isValidRequest) {
			return this.ret(false, unsuccessfulReason);
		}
		
		// sanity check and parse the JWT token (we know jwt header exists because request validation passed)
		const [isValidJWT, authorization] = Authorization.ValidateJWT(request.headers.get(HEADER_EXTENSION_JWT)!);
		if (!isValidJWT) {
			return this.ret(false, "invalid JWT");
		}

		return this.ret(true, {
			msg: "you authorized!",
			authorization: authorization,
		});
	},


	/**
	 * Helper method that determines whether the request is valid and should be handled or not.
	 * @param request https://developers.cloudflare.com/workers/runtime-apis/request/
	 * @returns boolean: whether or not request is valid, string: reason for invalid
	 */
	validateRequest(request: Request): [boolean, string] {
		// check jwt exists
		if (request.headers.get(HEADER_EXTENSION_JWT) == null) {
			return [false, "no jwt header provided"];
		}
		// check that an action exists
		const { searchParams } = new URL(request.url);
		const action = searchParams.get('action');
		if(typeof action == 'undefined' || !action) {
			return [false, "action parameter was not set or empty"];
		}

		return [true, ""];
	},

	/**
	 * Helper method that creates a structured json response for our worker.
	 * @param successful Whther or not the request was handled successfully
	 * @param data "any" kind of data (mostly a string, but could be complex type too)
	 * @returns https://developers.cloudflare.com/workers/runtime-apis/response/
	 */
	ret(successful: boolean, data: any): Response {
		const structuredResponse = {
			successful: successful,
			message: data,
		};
		return new Response(
			JSON.stringify(structuredResponse, null, 2),
			{
				headers: {
					"content-type": "application/json;charset=UTF-8"
				}
			}
		)
	}
};
