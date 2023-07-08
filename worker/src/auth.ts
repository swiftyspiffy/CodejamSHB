export type AuthorizationResponse = {
    Exp: number;
    OpaqueUserId: string;
    UserId: string;
    ChannelId: string;
    Role: string;
    IsLinked: boolean;
}

export class Authorization {
    /**
     * Helper method that takes in a JWT token and uses our extension secret to both
     * validate the JWT, as well as parse it and return a nice type with the identity.
     * @param jwtPayload JWT as passed by the Twitch Extension (and maybe a bad actor :D )
     * @return
     */
    public static ValidateJWT(jwtPayload: string): [boolean, AuthorizationResponse] {
        // TODO: implement JWT validation and parsing
        return [true, {
            Exp: 123,
            OpaqueUserId: "",
            UserId: "",
            ChannelId: "",
            Role: "",
            IsLinked: true,
        } as AuthorizationResponse];
    }
}