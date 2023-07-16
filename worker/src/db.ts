import AWS, { DynamoDB } from "aws-sdk"

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

    private client: DynamoDB;

    constructor(awsAccessKey: string, awsSecretKey: string) {
        const creds = new AWS.Credentials(awsAccessKey, awsSecretKey);
        this.client = new DynamoDB({ credentials: creds, region: Db.REGION })
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
        return [true, channelPomodoros!];
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
        this.client.putItem(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                return false;
            }
        });
        return true;
    }

    /**
     * Helper function that converts a pomodoro state json string to DBPomodoroState.
     * @param pomodoroState 
     * @returns DBPomodoroState
     */
    private static parsePomodoroState(pomodoroState: string): DBPomodoroState {
        const obj = JSON.parse(pomodoroState)
        let tasks: DBPomodoroTask[];
        obj.tasks.forEach((task: { status: string; title: any }) => {
            tasks.push({
                Status: task.status == "AWAITING" 
                    ? DBPomodoroTaskStatus.Awaiting 
                    : task.status == "IN_PROGRESS" 
                        ? DBPomodoroTaskStatus.InProgress 
                        : DBPomodoroTaskStatus.Completed,
                Title: task.title
            } as DBPomodoroTask)
        });
        const state: DBPomodoroState = {
            Status: obj["status"] == "ACTIVE" ? DBPomodoroStatus.Active : DBPomodoroStatus.Break,
            EndsAt: parseInt(obj["ends_at"]),
            Tasks: tasks!,
        }
        return state;
    }

    /**
     * Helper function that converts DBPomodoroState into json string.
     * @param input 
     * @returns string
     */
    private static pomodoroStateIntoJson(input: DBPomodoroState): string {
        
        return JSON.stringify(input);
    }

}