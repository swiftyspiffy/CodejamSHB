import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

type JWT = {
    Header: JWTHeader;
    Payload: JWTPayload;
    Signature: string;
}

type JWTHeader = {
    Alg: string;
    Typ: string;
}

export type JWTPayload = {
    Exp: number;
    OpaqueUserId: string;
    UserId: string;
    ChannelId: string;
    Role: string;
    IsUnlinked: boolean;
    PubsubPerms: JWTPayloadPubsubPerms;
}

export type JWTPayloadPubsubPerms = {
    Listen: string[];
}


export class Authorization {
    /**
     * Helper method that takes in a JWT token and uses our extension secret to both
     * validate the JWT, as well as parse it and return a nice type with the identity.
     * @param jwtPayload JWT as passed by the Twitch Extension (and maybe a bad actor :D )
     * @return
     */
    public static VerifyJWT(jwtPayload: string, secret: string): [boolean, JWTPayload | null, string] {
        // JWT is made up of 3 sections, parse them
        const [isValidJWT, jwt, invalidReason] = this.parseJWT(jwtPayload);
        if (!isValidJWT) {
            return [false, null, invalidReason];
        }
        
        // Ensure we're using a JWT with HS256 (JWT at this point cannot be null)
        if (jwt!.Header.Typ != "JWT") {
            return [false, null, "invalid type value: " + jwt!.Header.Typ];
        }
        if (jwt!.Header.Alg != "HS256") {
            return [false, null, "invalid alg value: " + jwt!.Header.Alg];
        }

        // Validate the signature to make sure the request hasn't been tampered with using 
        // the payload and our secret
        if (!this.verifySignature(jwtPayload, secret)) {
            return [false, null, "generated signature did not match provided signature"];
        }

        return [true, jwt!.Payload, ""];
    }

    /**
     * Helper method that takes the jwt payload and our extension secret, and creates a HMACSHA256
     * to compare against the signature in the JWT passed from the extension, thus confirming the 
     * message was sent without being tampered.
     * @param jwtPayload JWT as passed by the Twitch extension
     * @param secret Pomodor Twitch extension secret available via env variable
     * @returns boolean representing whether valid signature or not
     */
    private static verifySignature(jwtPayload: string, secret: string): boolean {
        const preSig = jwtPayload.split(".")[0] + "." + jwtPayload.split(".")[1];
        const generatedSig = Base64.stringify(hmacSHA512(preSig, secret));
        const expectedSig = jwtPayload.split('.')[2];
        // TODO: remove these once we're confident verifySignature is working correctly
        console.log("expected sig: " + expectedSig);
        console.log("generated sig: " + generatedSig);
        return generatedSig == expectedSig;
    }

    /**
     * Helper method that takes a JWT string from a Twitch extension and parses it into a type
     * that we can use easily later.
     * @param jwtPayload Raw X-Extension-JWT from the Twitch extension
     * @returns JWT type
     */
    private static parseJWT(jwtPayload: string): [boolean, JWT | null, string] {
        if(jwtPayload.split(".").length != 3) {
            return [false, null, "payload not made up of 3 sections"];
        }
        const headerJson = JSON.parse(btoa(jwtPayload.split(".")[0]));
        const payloadJson = JSON.parse(btoa(jwtPayload.split(".")[1]));

        return [true, {
            Header: {
                Alg: headerJson.alg,
                Typ: headerJson.typ
            },
            Payload: {
                Exp: payloadJson.exp,
                OpaqueUserId: payloadJson.opaque_user_id,
                UserId: payloadJson.user_id,
                ChannelId: payloadJson.channel_id,
                Role: payloadJson.role,
                IsUnlinked: payloadJson.is_unlinked,
                PubsubPerms: {
                    Listen: payloadJson.pubsub_perms.listen
                }
            },
            Signature: jwtPayload.split(".")[2]
        } as JWT, ""];
    }
}