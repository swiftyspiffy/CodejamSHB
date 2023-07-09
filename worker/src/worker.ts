import { Authorization, JWTPayload } from "./auth";

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
		// for debugging, dump headers
		console.log(new Map(request.headers));
		// sanity check the request coming in, also parse the action being requested
		console.log("validating request");
		const [isValidRequest, action, notValidRequestReason] = this.validateRequest(request);
		if (!isValidRequest) {
			console.log("invalid request: " + notValidRequestReason);
			return this.ret(false, notValidRequestReason);
		}
		
		// sanity check and parse the JWT token (we know jwt header exists because request validation passed)
		console.log("verifying jwt");
		const [isValidJWT, authorization, notValidJWTReason] = Authorization.VerifyJWT(request.headers.get(HEADER_EXTENSION_JWT)!, env.EXTENSION_SECRET);
		if (!isValidJWT) {
			console.log("invalid jwt: " + notValidJWTReason);
			return this.ret(false, notValidJWTReason);
		}

		// switch on action to determine what action we'll take
		console.log("handling action: " + action);
		switch(action) {
			case "get_pomodoros":
				// TODO: handle action.get_pomodoros
				return this.ret(true, {
					msg: "pomodors would be here",
					authorization: authorization
				});
			case "put_pomodoro":
				// TODO: handle action.put_pomodoro
				return this.ret(true, {
					msg: "confirmation of put pomodoro here",
					authorization: authorization
				});
			case "update_pomodoro":
				// TODO: handle action.update_pomodoro
				return this.ret(true, {
					msg: "confirmation of updated pomodoro here",
					authorization: authorization
				});
			default:
				return this.ret(false, {
					msg: "unknown action: " + action,
					authorization: authorization
				});
		}
	},


	/**
	 * Helper method that determines whether the request is valid and should be handled or not.
	 * @param request https://developers.cloudflare.com/workers/runtime-apis/request/
	 * @returns boolean: whether or not request is valid, string: reason for invalid
	 */
	validateRequest(request: Request): [boolean, string, string] {
		// check jwt exists
		if (request.headers.get(HEADER_EXTENSION_JWT) == null) {
			return [false, "", "no jwt header provided"];
		}
		// check that an action exists
		const { searchParams } = new URL(request.url);
		const action = searchParams.get('action');
		if(typeof action == 'undefined' || !action) {
			return [false, "", "action parameter was not set or empty"];
		}

		return [true, action, ""];
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
