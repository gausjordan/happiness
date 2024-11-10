<?php

declare(strict_types=1);

require __DIR__ . DIRECTORY_SEPARATOR . "bootstrap.php";

// Only allow one (POST) method
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    header("Allow: POST");
    exit;
}

// Request body must contain a "username" and a "password"
$data = (array) json_decode(file_get_contents("php://input"), true);

if ( ! array_key_exists("username", $data) || ! array_key_exists("password", $data)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing login credentials"]);
    exit;
}

$database = new Database($config->host,
    $config->dbName,
    $config->username,
    $config->password);

$user_gateway = new UserGateway($database);

$user = $user_gateway->getByUsername($data["username"]);

// If user fails to get authenticated - quit. Otherwise, $user variable stays set.
if ( ($user === false) || !password_verify( $data["password"], $user["password_hash"]) ) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid authentication"]);
    exit;
}

// If a user is still valid, as well as his credentials, issue a refresh token
$codec = new JWTCodec($config->secret_key);

// "tokens.php" encodes AND prints out BOTH access/refresh tokens, and
// sets up variables to be used as arguments in the following two lines
require __DIR__ . DIRECTORY_SEPARATOR . "tokens.php";

$refresh_token_gateway = new RefreshTokenGateway($database, $config->secret_key);

// Store a freshly made refresh token in a database
$refresh_token_gateway->create($refresh_token, $refresh_token_expiry);