<?php

/**
 * Provides encode, decode and validate functionality.
 *
 * @throws InvalidArgumentException
 * @throws InvalidSignatureException
 * @throws TokenExpiredException
 * 
 */
class JWTCodec {

    public function __construct(private string $key) { }


    /** Encodes the payload to a JWT using a secret $key */
    public function encode(array $payload): string {
        
        // Header is always the same
        $header = $this->base64urlEncode(
            json_encode([
            "typ" => "JWT",
            "alg" => "HS256"
            ])
        );

        $payload = $this->base64urlEncode(
            json_encode($payload)
        );

        // Hashes the head and the payload
        $signature = $this->base64urlEncode(
            hash_hmac("sha256",
                $header . "." . $payload,
                $this->key,
                true)
        );

        // Returns a valid, dot separated, JWT
        return $header . "." . $payload . "." . $signature;
    }


    /** Decodes a JWT provided */
    public function decode(string $token): array {

        if (preg_match("/^(?<header>.+)\.(?<payload>.+)\.(?<signature>.+)$/", $token, $matches) !== 1) {
            throw new InvalidArgumentException("Invalid token format.");
        }

        // Generates a hash of the decoded JWT's payload, ignoring it's provided hash
        $signature = hash_hmac("sha256",
                $matches["header"] . "." . $matches["payload"],
                $this->key,
                true);
        
        $signature_from_token = $this->base64urlDecode($matches["signature"]);

        // Compares a generated hash to the one provided in a token
        if ( ! hash_equals($signature, $signature_from_token)) {
            throw new InvalidSignatureException("Invalid signature.");
        }

        // From this point on we trust the token (it may still be outdated)
        $payload = json_decode($this->base64urlDecode($matches["payload"]), true);

        if ($payload["exp"] < time()) {
            throw new TokenExpiredException;
        }
        
        // JWT is valid
        return $payload;
    }


    private function base64urlDecode(string $text): string {
        return base64_decode(
            str_replace(
                ["-", "_"],
                ["+", "/"],
                $text)
        );
    }

    
    private function base64urlEncode(string $text): string {
        return str_replace(
            ["+", "/", "="],
            ["-", "_", ""],
            base64_encode($text)
        );
    }
}