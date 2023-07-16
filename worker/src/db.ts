//import AWS, { DynamoDB } from "aws-sdk"

export type DBPomodoro = {
    TwitchStreamerId: string,
    TwitchUserId: string,
    PomodoroState: DBPomodoroState,
}

export enum DBPomodoroStatus {
    Active,
    Break
}

export enum DBPomodoroTaskStatus {
    Awaiting,
    InProgress,
    Completed
}

export type DBPomodoroTask = {
    Status: DBPomodoroTaskStatus,
    Title: string,
}

export type DBPomodoroState = {
    Status: DBPomodoroStatus,
    EndsAt: number,
    Tasks: DBPomodoroTask[],
}

export class Db {
    private static REGION = "us-west-2"
    private static TABLE = "Pomodoros";

    //private client: DynamoDB;

    constructor(awsAccessKey: string, awsSecretKey: string) {
        //const creds = new AWS.Credentials(awsAccessKey, awsSecretKey);
        //this.client = new DynamoDB({ credentials: creds, region: Db.REGION })
    }

    /**
     * Retrives all pomodoros associated with a specific streamer. Includes inactive pomodoros.
     * @param streamerId Twitch User ID of streamer.
     * @returns DBPomodoro
     */
    public ListStreamPomodoros(streamerId: string): [boolean, DBPomodoro[]] {
        var params = {
            ExpressionAttributeValues: {
                ':streamer': {S: streamerId},
            },
            KeyConditionExpression: 'TwitchStreamerId = :streamer',
            ProjectionExpression: 'TwitchStreamerId, TwitchUserId, PomodoroState',
            TableName: Db.TABLE,
        };

        let channelPomodoros: DBPomodoro[];
        /*
        this.client.query(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                return [false, null];
            } else {
                data.Items?.forEach(function(element, index, array) {
                    channelPomodoros.push({
                        TwitchStreamerId: streamerId,
                        TwitchUserId: element.TwitchUserId.S!,
                        PomodoroState: Db.parsePomodoroState(element.PomodoroState.S!)
                    } as DBPomodoro)
                });
            }
        });
        */
        return [true, channelPomodoros!];
    }

    public ListStreamPomodorosDemo(streamerId: string): [boolean, DBPomodoro[]] {
        const curTime = new Date();
        const pomodoroState = {
            Status: DBPomodoroStatus.Active,
            EndsAt: Math.floor(new Date(curTime.getTime() +  (5 * 60000)).getTime() / 1000),
            Tasks: [
                {
                    Status: DBPomodoroTaskStatus.InProgress,
                    Title: "My second task"
                },
                {
                    Status: DBPomodoroTaskStatus.Completed,
                    Title: "My first task",
                },
                {
                    Status: DBPomodoroTaskStatus.Awaiting,
                    Title: "My third task"
                }
            ]
        };

        const pomos: DBPomodoro[] = [
            {
                TwitchStreamerId: "410885037",
                TwitchUserId: "410885037",
                PomodoroState: pomodoroState,
            },
            {
                TwitchStreamerId: "410885037",
                TwitchUserId: "40876073",
                PomodoroState: pomodoroState,
            },
            {
                TwitchStreamerId: "410885037",
                TwitchUserId: "40876073",
                PomodoroState: pomodoroState,
            }
        ];
        return [true, pomos]
    }

    /**
     * Inserts or overwrites the user's existing pomodoro state.
     * @param input DBPomodoro
     */
    public PutStreamPomodoro(input: DBPomodoro): boolean {
        var params = {
            TableName: Db.TABLE,
            Item: {
                'TwitchStreamerId': {S: input.TwitchStreamerId},
                'TwitchUserId': {S: input.TwitchUserId},
                'PomodoroState': {S: Db.pomodoroStateIntoJson(input.PomodoroState)},
            }
        }
        /*
        this.client.putItem(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                return false;
            }
        });
        */
        return true;
    }

    public PutStreamPomodoroDemo(input: DBPomodoro): boolean {
        return true;
    }

    /**
     * Helper function that converts a pomodoro state json string to DBPomodoroState.
     * @param pomodoroState 
     * @returns DBPomodoroState
     */
    private static parsePomodoroState(pomodoroState: string): DBPomodoroState {
        // TODO: implement parsePomodoroState
        const fake: DBPomodoroState = {
            Status: DBPomodoroStatus.Active,
            EndsAt: 0,
            Tasks: [],
        }
        return fake
    }

    /**
     * Helper function that converts DBPomodoroState into json string.
     * @param input 
     * @returns string
     */
    private static pomodoroStateIntoJson(input: DBPomodoroState): string {
        // TODO: implement pomodoroStateIntoJson
        return "";
    }

}