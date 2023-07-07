## Pomodoro Twitch Overlay Extension

### Checking out the code
git clone https://github.com/swiftyspiffy/CodejamSHB.git

### TESTING
#### Against a Live Stream
1. To test this Twitch extension, install the extension on your channel:
https://dashboard.twitch.tv/extensions/8xxy5f8gt4p0iwbvvj4r7tzb1f7yht-0.0.1

2. Start a broadcast on your channel/stream. This is typically done with OBS and using your account's stream key
  - OBS: https://obsproject.com/
  - Stream key: https://dashboard.twitch.tv/u/<MY_USERNAME>/settings/stream

3. In terminal, `cd` into root directory (`pomodoro`)

4. Start the app, make sure SSL is enabled. On windows, this looks like
```
set HTTPS=true&&npm start
```

5. Open your stream, on the right side, click the little button, and Approve/Enable. The extension should be shown over the stream.

#### Locally Without Stream
1. In terminal, `cd` into root directory (`pomodoro`)

2. Start the app
```
npm start
```