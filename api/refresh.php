<?php

declare(strict_types=1);

header("Access-Control-Allow-Origin: http://localhost"); // Allow requests from http://localhost
header("Access-Control-Allow-Credentials: true"); // Allow cookies and authorization headers
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS"); // Allow these HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow these headers

require __DIR__ . DIRECTORY_SEPARATOR . "bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    header("Allow: POST");
    exit;
}

$data = (array) json_decode(file_get_contents("php://input"), true);

if ( ! array_key_exists("token", $data) ) {
    http_response_code(400);
    echo json_encode(["message" => "Missing token"]);
    exit;
}

$codec = new JWTCodec($config->secret_key);

try {
    $payload = $codec->decode($data["token"]);
    // var_dump($payload);
} catch (Exception) {
    // TODO - handle each error differently
    http_response_code(409);
    echo json_encode(["message" => "Invalid token"]);
    exit;
}

$user_id = $payload["sub"];

$database = new Database($config->host,
    $config->dbName,
    $config->username,
    $config->password);

$refresh_token_gateway = new RefreshTokenGateway($database, $config->secret_key);

$refresh_token = $refresh_token_gateway->getByToken($data["token"]);

if ($refresh_token === false) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid token (not on the whitelist)"]);
    exit;
}

$user_gateway = new UserGateway($database);

$user = $user_gateway->getByUserId($user_id);

if ($user === false) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid authentication"]);
    exit;
}

require __DIR__ . DIRECTORY_SEPARATOR . "tokens.php";

$refresh_token_gateway->delete($data["token"]);

$refresh_token_gateway->create($refresh_token, $refresh_token_expiry);