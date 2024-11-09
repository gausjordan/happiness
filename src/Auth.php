<?php

/**
 * Provides a method for JWT authentication
 */
class Auth {

    private int $user_id;
 
    public function __construct (private UserGateway $user_gateway, private JWTCodec $codec) {}
 
    public function getUserId(): int {
        return $this->user_id;
    }

    /**
     * Checks if JWT is valid.
     * @return 'false' if a JWT token fails in any way, and 'true' otherwise
     */
    public function authenticateAccessToken(): bool {

        // TODO ... neka gleda i je li dostupan httponly secure cookie u supervarijabli COOKIES
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
            return false;
        }
        catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["message" => $e->getMessage()]);
            return false;
        }

        $this->user_id = $data["sub"];

        return true;
    }
}