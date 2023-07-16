import { Authorization, JWTPayload } from "./auth";
import { DBPomodoro, DBPomodoroState, DBPomodoroStatus, Db } from "./db";

export interface Env {
	EXTENSION_SECRET: string
	AWS_ACCESS_KEY: string
	AWS_SECRET_KEY: string
}

const ENFORCE_JWT = false;
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
		const [isValidJWT, authorization, notValidJWTReason] = ENFORCE_JWT 
			? Authorization.VerifyJWT(request.headers.get(HEADER_EXTENSION_JWT)!, env.EXTENSION_SECRET)
			: [true, { Exp: 123123123,
				OpaqueUserId: "user-123123123",
				UserId: "40876073",
				ChannelId: "410885037",
				Role: "user",
				IsUnlinked: false,
				PubsubPerms: {} } as JWTPayload, ""];
		if (!isValidJWT) {
			console.log("invalid jwt: " + notValidJWTReason);
			return this.ret(false, notValidJWTReason);
		}

		// we can safely cast to non-null since we've already checked for error
		const auth = authorization!

		// create dynamo dao
		const dbClient = new Db(env.AWS_ACCESS_KEY, env.AWS_SECRET_KEY);

		// switch on action to determine what action we'll take
		console.log("handling action: " + action);
		switch(action) {
			case "list_pomodoros":
				return await this.handleListPomodoros(dbClient, auth);
			case "put_pomodoro":
				return await this.handlePutPomodoro(dbClient, auth, request);
			default:
				return this.ret(false, {
					msg: "unknown action: " + action,
					authorization: authorization
				});
		}
	},

	/**
	 * Helper method handles the action of putting a Twitch user's pomodoro into the database (`put_pomodoro`), which
	 * also means overwriting an existing entry. This method will also handle dispathcing updates to the Twitch pubsub
	 * to notify all extensions in a given channel of a change in a given pomodoro.
	 * @param dbClient 
	 * @param auth 
	 * @returns 
	 */
	async handlePutPomodoro(dbClient: Db, auth: JWTPayload, request: Request): Promise<Response> {
		// force the extension to send POST request
		if(request.method != "POST") {
			return this.ret(false, "request must be POST");
		}

		// force the extension to send form body
		if(request.headers.get("content-type") != "form") {
			return this.ret(false, "expected body content-type of form");
		}

		const form = await request.formData();
		const putStreamPomodoroWasSuccessful = dbClient.PutStreamPomodoroDemo({
			TwitchStreamerId: auth.ChannelId,
			TwitchUserId: auth.UserId,
			PomodoroState: this.parseFormDataForPutPomodoro(form)
		} as DBPomodoro);
		if(!putStreamPomodoroWasSuccessful) {
			console.log("put stream pomodoro was unsuccessful");
			return this.ret(false, "failed to put stream pomodoro");
		}
		// TODO: implement Twitch pubsub notification for modified pomodoro
		return this.ret(true, {
			msg: "successful",
			authorization: auth
		});
	},

	/**
	 * Helper method handles the action of getting pomodoros (`get_pomodoros`), which returns active pomodoros for
	 * a specified channel.
	 * @param dbClient DynamoDB client wrapper.
	 * @param auth Authorization data as provided by Twitch extension.
	 * @returns Resposne
	 */
	async handleListPomodoros(dbClient: Db, auth: JWTPayload): Promise<Response> {
		const [listStreamPomodorosWasSuccessful, dbPomodoros] = dbClient.ListStreamPomodorosDemo(auth.ChannelId);
		if (!listStreamPomodorosWasSuccessful) {
			console.log("list stream pomodoros was unsuccessful");
			return this.ret(false, "failed to get stream pomodoros");
		}
		// TODO: filter out pomodoros that have since expired before returning them
		return this.ret(true, {
			msg: dbPomodoros,
			authorization: auth
		});
	},

	/**
	 * Helper method that converts a FromData type (which is what the Twitch Extension request is presented to us
	 * as), and converts it to a DBPomodoroState, which we can then pass to our database client.
	 * @param form Awaited form data coming from the request.
	 * @returns DBPomodoroState
	 */
	parseFormDataForPutPomodoro(form: FormData): DBPomodoroState {
		// TODO: Implement parseFormDataForPomodoro
		const fake: DBPomodoroState = {
            Status: DBPomodoroStatus.Active,
            EndsAt: 0,
            Tasks: [],
        }
        return fake
	},

	/**
	 * Helper method that determines whether the request is valid and should be handled or not.
	 * @param request https://developers.cloudflare.com/workers/runtime-apis/request/
	 * @returns boolean: whether or not request is valid, string: reason for invalid
	 */
	validateRequest(request: Request): [boolean, string, string] {
		// check jwt exists
		if (request.headers.get(HEADER_EXTENSION_JWT) == null && ENFORCE_JWT) {
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
					"content-type": "application/json;charset=UTF-8",
					"access-control-allow-origin": "*",
					"access-control-allow-methods": "*",
					"access-control-allow-headers": "*"
				}
			}
		)
	}
};
