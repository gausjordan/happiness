<?php

/**
 * Controller for handling product-related requests.
 */
class ProductController {
    
    public function __construct(
        private ProductGateway $gateway,
        private Sanitization $sanitize,
        private int $user_id,
        private string $user_role
    ) { }
    
    public function processRequest(string $method, ?string $id, ?array $urlQuery): void {
        if ($id) {
            $this->sanitize->isDigit($id);
            $this->processResourceRequest($method, $id);
        }
        else {
            $this->processCollectionRequest($method, $urlQuery);
        }
    }

    private function processResourceRequest(string $method, string $id): void {

        if ($this->user_role !== "admin" && $this->user_role !== "employee") {
            // Employees and administrators can view hidden products (true)
            $product = $this->gateway->get($id, true);
        } else {
            // Others can not
            $product = $this->gateway->get($id);
        }

        if (! $product) {
            $this->respondNotFound($id);
            return;
        }

        switch ($method) {
            
            // Anyone can browse
            case "GET":
                echo json_encode($product);
                break;

            // Admins and employees can edit
            case "PATCH":
                if (!($this->user_role === "admin" || $this->user_role === "employee")) {
                    http_response_code(401);
                    echo json_encode(["message: " => "Administrative account required."]);
                    break;
                }

                $data = (array) json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, false);

                if (!empty($data["url"])) {
                    foreach($data["url"] as $url) {
                        $fileName = $this->sanitize->sanitizeFilename($url);
                        if (!file_exists(".." . DIRECTORY_SEPARATOR . "product-images" . DIRECTORY_SEPARATOR . $fileName)) {
                            http_response_code(404);
                            $errors[] = "Product update failed. Missing image file." . $fileName;
                        }
                    }
                }

                if (! empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["errors" => $errors]);
                    break;
                }

                $tablesUpdated = $this->gateway->update($product, $data);
                echo json_encode([
                    "message" => "Product $id updated",
                    "tables updated" => $tablesUpdated
                ]);
                break;

            case "DELETE":

                if ($this->user_role !== "admin" && $this->user_role !== "employee") {
                    http_response_code(403);
                    echo json_encode(["Message: " => "Administrative account required."]);
                    break;
                } else {
                    $product = $this->gateway->get($id, true);
                    if (!$product) {
                        http_response_code(404);
                        echo json_encode(["Message: " => "Product $id does not exist."]);
                        break;
                    }
                    
                    $rows = $this->gateway->delete($id);
                    echo json_encode([
                        "message" => "Product $id deleted",
                        "rows" => $rows
                    ]);
                    break;
                }
            default:
                $this->respondMethodNotAllowed("GET, PATCH, DELETE");
        }
    }


    private function processCollectionRequest(string $method, ?array $urlQuery): void {
        switch ($method) {

            case "GET":

                // Employees and administrators can view hidden products (true)
                if ($this->user_role === "admin" || $this->user_role === "employee") {
                    
                    // Fetching items only
                    if ($urlQuery === null || ($urlQuery && !array_key_exists("structure", $urlQuery))) {

                        echo json_encode([
                            // Get all the required data (obeying given limits)
                            "products" => $this->gateway->getAll($this->user_id, false, $urlQuery),
                            
                            // Count how many items meet the given conditions had there been no limit set
                            "metadata" => $this->gateway->getAll($this->user_id, false, $urlQuery, true),
                        ]);
                    }
                    
                    else {

                        // Fetching data structure (all of the categories and all of the tags)
                        echo json_encode([
                            "tags" => $this->gateway->getTags(),
                            "categories" => $this->gateway->getCategories()
                        ]);
                    }

                    break;

                // Guests and users can not
                } else {
                    
                    // Fetching items only
                    if ($urlQuery === null || ($urlQuery && !array_key_exists("structure", $urlQuery))) {
                        echo json_encode([
                            // Get all the required data (obeying given limits) & hide hidden items
                            "products" => $this->gateway->getAll($this->user_id, true, $urlQuery),
                            // Count how many visible items meet the given conditions had there been no limit set 
                            "metadata" => $this->gateway->getAll($this->user_id, true, $urlQuery, true),
                        ]);
                    }
                    else
                    {
                        // Fetching data structure (all of the categories and all of the tags)
                        echo json_encode([
                            "tags" => $this->gateway->getTags(),
                            "categories" => $this->gateway->getCategories()
                        ]);
                    }

                    break;
                }

            case "POST":

                $data = (array) json_decode(file_get_contents("php://input"), true);
                
                $errors = $this->getValidationErrors($data);
                
                if (! empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["errors" => $errors]);
                    break;
                }

                if ($this->user_role == "guest" || $this->user_role == "user") {
                    http_response_code(403);
                    echo json_encode(["Message: " => "Administrative account required."]);
                    break;
                }

                $failure = false;

                foreach($data["url"] as $url) {
                    $fileName = $this->sanitize->sanitizeFilename($url);
                    if (!file_exists(".." . DIRECTORY_SEPARATOR . "product-images" . DIRECTORY_SEPARATOR . $fileName)) {
                        http_response_code(404);
                        echo json_encode(["Message: " => "Product insertion failed. Missing image " . $fileName]);
                        $failure = true;
                        break;
                        exit;
                    }
                }

                if (!$failure) {
                    $id = $this->gateway->create($data);
                    $this->respondCreated($id);
                }

                break;
                            
            default:
                $this->respondMethodNotAllowed("GET, POST");
        }
    }

    public function processImageRequest(string $method, ?string $id) {

        if ($this->user_role !== "employee" && $this->user_role !== "admin") {
            http_response_code(403);
            echo json_encode(["message: " => "Administrative account required."]);
            exit;
        }

        switch ($method) {
            
            case "POST":
                
                define('ALLOWED_TYPES', ['image/jpeg']);

                if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                    http_response_code(400);
                    echo json_encode(["Message: " => "No file uploaded or upload error."]);
                    exit;
                }

                $file = $_FILES['file'];

                $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($fileInfo, $file['tmp_name']);
                finfo_close($fileInfo);
            
                if (!in_array($mimeType, ALLOWED_TYPES)) {
                    http_response_code(400);
                    echo json_encode(["Message: " => "Invalid file type. Only JPEG images are allowed."]);
                    exit;
                }

                if ($file['size'] > 10 * 1024 * 1024) {
                    http_response_code(400);
                    echo json_encode(["error" => "File size exceeds the 10 MB limit."]);
                    exit;
                }

                $rawFilename = $this->sanitize->sanitizeFilename($file['name']);
                $fileName = uniqid(substr($rawFilename, 0, strripos($rawFilename, '.')) . "_", false) . '.jpg';

                if (!move_uploaded_file($file['tmp_name'], ".." . DIRECTORY_SEPARATOR . "product-images" . DIRECTORY_SEPARATOR . $fileName)) {
                    http_response_code(400);
                    echo json_encode(["Message: " => "Unable to save uploaded file."]);
                    exit;
                } else {
                    http_response_code(201);
                    echo json_encode(["Message: " => "Image resource " . $fileName . " created."]);
                    exit;
                }
                break;
            
            case "DELETE":
                
                $fileName = $this->sanitize->sanitizeFilename($id);
                if (!file_exists(".." . DIRECTORY_SEPARATOR . "product-images" . DIRECTORY_SEPARATOR . $fileName)) {
                    http_response_code(404);
                    echo json_encode(["Message: " => "File not found."]);
                    exit;
                }
                if (!unlink(".." . DIRECTORY_SEPARATOR . "product-images" . DIRECTORY_SEPARATOR . $fileName)) {
                    http_response_code(500);
                    echo json_encode(["Message: " => "An error occurred while attempting to delete the file."]);
                    exit;
                } else {
                    http_response_code(200);
                    echo json_encode(["Message: " => "Image resource " . $fileName . " deleted."]);
                    exit;
                }
                break;
            
            case "GET":
                echo($id);
                $fileName = $this->sanitize->sanitizeFilename($id);
                
                if (!file_exists(".." . DIRECTORY_SEPARATOR . "product-images" . DIRECTORY_SEPARATOR . $fileName)) {
                    http_response_code(404);
                    echo json_encode(["Message: " => "File not found."]);
                    exit;
                } else {
                    http_response_code(200);
                    echo json_encode(["Message: " => "File exists."]);
                    exit;
                }
            
            default:
                $this->respondMethodNotAllowed("POST, DELETE");
        }

    }


    private function sanitizeString(string $string) : string {
        return htmlspecialchars($string);
    }


    private function getValidationErrors(array $data, bool $is_new = true): array {

        $errors = [];

        if ($is_new && (empty($data["title"]) || empty($data["naslov"]) ) ) {
            $errors[] = "'title' and 'naslov' are required.";
        }

        if ($is_new == true && empty($data["price"])) {
            if (!isset($data["price"])) {
                $errors[] = "Price is required.";
            }
        }

        if (array_key_exists("price", $data)) {
            if (filter_var($data["price"], FILTER_VALIDATE_FLOAT) === false) {
                $errors[] = "Price must be a number.";
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