<?php

declare(strict_types=1);

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
} catch (Exception) {
    // TODO - handle each error differently
    http_response_code(409);
    echo json_encode(["message" => "Invalid token"]);
    exit;
}

$database = new Database($config->host,
    $config->dbName,
    $config->username,
    $config->password);

$refresh_token_gateway = new RefreshTokenGateway($database, $config->secret_key);

$refresh_token_gateway->delete($data["token"]);