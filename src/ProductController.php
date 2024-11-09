<?php

/**
 * Controller for handling product-related requests.
 */
class ProductController {
    
    public function __construct(private ProductGateway $gateway, private int $user_id) {}
    
    // If there was any 'id' provided in the URL, then it was a resource request
    // Otherwise it's considered a collection request
    public function processRequest(string $method, ?string $id): void {
        
        if ($id) {
            $this->processResourceRequest($method, $id);
        }
        else {
            $this->processCollectionRequest($method);
        }
    }

    private function processResourceRequest(string $method, string $id): void {
        
        $product = $this->gateway->getForUser($this->user_id, $id);

        if (! $product) {
            $this->respondNotFound($id);
            return;
        }

        switch ($method) {

            case "GET":
                echo json_encode($product);
                break;

            case "PATCH":
                $data = (array) json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, false);
                
                if (! empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["errors" => $errors]);
                    break;
                }

                $rows = $this->gateway->updateForUser($this->user_id, $product, $data);
                echo json_encode([
                    "message" => "Product $id updated",
                    "rows" => $rows
                ]);
                break;

            case "DELETE":
                $rows = $this->gateway->deleteForUser($this->user_id, $id);
                echo json_encode([
                    "message" => "Product $id deleted",
                    "rows" => $rows
                ]);
                break;

            default:
                $this->respondMethodNotAllowed("GET, PATCH, DELETE");
        }
    }

    private function processCollectionRequest(string $method): void {
        switch ($method) {

            case "GET": 
                echo json_encode($this->gateway->getAllForUser($this->user_id));
                break;

            case "POST":
                $data = (array) json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data);
                
                if (! empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["errors" => $errors]);
                    break;
                }

                $id = $this->gateway->createForUser($this->user_id, $data);
                
                $this->respondCreated($id);
                break;
            
            default:
                $this->respondMethodNotAllowed("GET, POST");
        }
    }

    private function getValidationErrors(array $data, bool $is_new = true): array {

        $errors = [];

        if ($is_new && empty($data["name"])) {
            $errors[] = "name is required";
        }

        if (array_key_exists("size", $data)) {
            if (filter_var($data["size"], FILTER_VALIDATE_INT) === false) {
                $errors[] = "size must be an integer";
            }
        }

        return $errors;
    }

    private function respondMethodNotAllowed(string $allowedMethods): void {
        http_response_code(405);
        header("Allow: $allowedMethods");
    }

    private function respondNotFound(string $id): void {
        http_response_code(404);
        echo json_encode(["message" => "Product with id $id not found."]);
    }

    private function respondCreated(string $id) : void {
        http_response_code(201);
                echo json_encode([
                    "message" => "Product created",
                    "id" => $id
                ]);
    }
    
}