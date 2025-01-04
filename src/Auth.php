<?php

/**
 * Provides a method for JWT authentication
 */
class Auth {

    private int $user_id;
    private string $user_role;
 
    public function __construct (private UserGateway $user_gateway, private JWTCodec $codec) { }
 
    public function getUserId(): int {
        return $this->user_id;
    }

    public function getUserRole(): string {
        return $this->user_role;
    }

    /**
     * Checks if JWT is valid.
     * @return 'false' if a JWT token fails in any way, and 'true' otherwise
     */
    public function authenticateAccessToken(): bool {

        if (empty($_SERVER["HTTP_AUTHORIZATION"]))
        {
            return false;  // No Authorisation header at all => guest user
        }

        if ( ! preg_match("/^Bearer\s+(.*)$/", $_SERVER["HTTP_AUTHORIZATION"], $matches)) {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete authorization header"]);
            return false;
        }
        
        try {
            $data = $this->codec->decode($matches[1]);
        }
        catch(InvalidSignatureException) {
            http_response_code(401);
            echo json_encode(["message" => "Invalid signature."]);
            return false;
        }
        catch (TokenExpiredException) {
            http_response_code(401);
            echo json_encode(["message" => "Token expired."]);
            exit;
            //return false;
        }
        catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["message" => $e->getMessage()]);
            return false;
        }

        $this->user_id = $data["sub"];
        $this->user_role = $data["role"];

        return true;
    }
}