<?php


/**
 * Controller for handling user management.
 */
class UserController {
    
    public function __construct(
        private UserGateway $gateway,
        private Sanitization $sanitize,
        private int $user_id,
        private string $user_role
    ) { }


    public function processRequest(string $method, ?string $id, ?array $urlQuery): void {
        
        if ($this->user_role !== "admin") {
            echo(json_encode([ "message" => "Admin account required." ]));
            exit;
        }
        
        if ($id) {
            $this->sanitize->isDigit($id);
            $this->processResourceRequest($method, $id);
        }
        else {
            $this->processCollectionRequest($method, $urlQuery);
        }
    }
    


    function processCollectionRequest($method) {
        
        switch ($method) {

            case "GET":
                echo json_encode( $this->gateway->getAllUsers() );
                break;

            case "POST":
                $data = (array) json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data);

                if (! empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["errors" => $errors]);
                    break;
                }

                $id = $this->gateway->createUser($data);

                if ($id) {
                    http_response_code(201);
                    echo json_encode(["message" => "User {$id} created."]);
                } else {
                    http_response_code(422);
                    echo json_encode(["message" => "User creation failed."]);
                }

                break;

            default :
                http_response_code(405);
                header("Allow: GET, POST");
                break;                
        }
    }



    function processResourceRequest($method, $id) {
        
        switch ($method) {

            case "GET":
                $user = $this->gateway->getByUserId($id);
                if ($user) {
                    echo json_encode($user);
                } else {
                    http_response_code(404);
                    echo json_encode(["Message: " => "User $id does not exist."]);
                    break;
                }
            break;

            case "PATCH":
                $user = $this->gateway->getByUserId($id);
                if (!$user) {
                    http_response_code(404);
                    echo json_encode(["Message: " => "User $id does not exist."]);
                    break;
                }

                $data = (array) json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, true);
                
                if(!$errors) {
                    $rowsUpdated = $this->gateway->updateUser($user, $data);
                    if ($rowsUpdated > 0) {
                        echo json_encode([
                            "message" => "User " .  $user["id"] . " updated. ($rowsUpdated row affected)."
                        ]);
                    } else {
                        echo json_encode([
                            "message" => "No changes were made to user " .  $user["id"] . "."
                        ]);
                    }
                }
                break;

            case "DELETE":

                $user = $this->gateway->getByUserId($id);
                
                if(!$user) {
                    http_response_code(404);
                    echo json_encode(["Message: " => "User $id does not exist."]);
                    break;
                } else {
                    $rows = $this->gateway->deleteUser($user["id"]);
                    echo json_encode([
                        "message" => "Product $id deleted",
                        "rows" => $rows
                    ]);
                }

                break;

            default:
                http_response_code(405);
                header("Allow: GET, PATCH, DELETE");
                break;
        }
    }

    private function getValidationErrors(array $data, ?bool $isDoingAnUpdate = false): array {

        $errors = [];
        $requiredFields = [
            "firstName",
            "lastName",
            "addressStreet",
            "addressNumber",
            "postalCode",
            "city",
            "country",
            "role"
        ];

        $regex = '/^[a-zA-Z0-9\s\-\'\.\,ŠšĐđČčĆćŽž\?\!_\*\"\#]+$/';

        // Creating a new user
        if (!$isDoingAnUpdate) {

            foreach ($requiredFields as $field) {
                if (empty($data[$field]) ) {
                    $errors[] = "$field is required.";
                } else {
                    if (!preg_match($regex, $data[$field])) {
                        $errors[] = "Invalid characters in '$field'.";
                    }
                }
            }

            if (array_key_exists("role", $data)) {
                if(!filter_var($data['role'], FILTER_VALIDATE_INT)) {
                    $errors[] = "Invalid user role designation.";
                }
            } else {
                $errors[] = "User's role is required.";
            }
        
            if (array_key_exists("email", $data)) {
                if(!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "Invalid e-mail address.";
                }
            } else {
                $errors[] = "E-mail address is required.";
            }

            if (array_key_exists("password", $data)) {
                $passChars = '/^[a-zA-Z0-9\sŠšĐđČčĆćŽž~\`\!\@\#\$\%\^\&\*\(\)\-\'\_\+\=\{\}\[\]\|\\\;\:\"\<\>\,\.\/\?]+$/';
                if (!preg_match($passChars, $data['password'])) {
                    $errors[] = "Invalid characters in a password.";
                }
            } else {
                $errors[] = "Password is required.";
            }

            if (array_key_exists("username", $data)) {
                $usernameChars = '/^[a-zA-Z0-9]+$/';
                if (!preg_match($usernameChars, $data['username'])) {
                    $errors[] = "Invalid characters in a username.";
                }
            } else {
                $errors[] = "Username is required.";
            }
 
        // Updating an existing user
        } else {  

            foreach ($requiredFields as $field) {
                if (!empty($data[$field]) ) {
                    if (!preg_match($regex, $data[$field])) {
                        $errors[] = "Invalid characters in '$field'.";
                    }
                }
            }

            if (array_key_exists("role", $data)) {
                if(!filter_var($data['role'], FILTER_VALIDATE_INT)) {
                    $errors[] = "Invalid user role designation.";
                }
            }
        
            if (array_key_exists("email", $data)) {
                if(!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "Invalid e-mail address.";
                }
            }

            if (array_key_exists("password", $data)) {
                $passChars = '/^[a-zA-Z0-9\sŠšĐđČčĆćŽž~\`\!\@\#\$\%\^\&\*\(\)\-\'\_\+\=\{\}\[\]\|\\\;\:\"\<\>\,\.\/\?]+$/';
                if (!preg_match($passChars, $data['password'])) {
                    $errors[] = "Invalid characters in a password.";
                }
            }

            if (array_key_exists("username", $data)) {
                $usernameChars = '/^[a-zA-Z0-9]+$/';
                if (!preg_match($usernameChars, $data['username'])) {
                    $errors[] = "Invalid characters in a username.";
                }
            }
        }

        return $errors;
    }



}