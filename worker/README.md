### Overview
Worker is a Cloudflare Worker that handles API calls from Pomodoro extension. The worker is a typescript application that expects a request from the Twitch Extension (that is to say, requests should have a valid JWT via Authorization header). Based on the request, the worker will either return existing Pomodoros for presentation, or will add/update an existing pomodoro.

### Local Setup
1. If you haven't already, clone the CodejamSHB project.
2. `cd` into the worker directory (`CodejamSHB/worker`)
3. Run `npm install` to get project dependencies
4. Create a new file `.dev.vars`, and add the contents `EXTENSION_SECRET = "<extension_secret>" (get <extension_secret> value from swifty)

### Daily Flow
1. `cd` into the worker directory (`CodejamSHB/worker`)
2. Start the local development server: `npx wrangler dev`. If successful, you should get a message indicating its listening on 127.0.0.1, and some key options. Also, there should be a message indicating EXTENSION_SECRET variable is binded.
3. Hit the `b` key, and your browser should launch a tab with the localhost endpoint.
4. Make changes to the `src/` directory and save. The changes should automatically be live, so a refresh will show them.
