<?php

declare(strict_types=1);
require __DIR__ . DIRECTORY_SEPARATOR . "bootstrap.php";

$raw = $_SERVER["REQUEST_URI"];                                     // Gets raw server request
$urlPath = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);        // Removes GET parameters
$urlQuery = parse_url($_SERVER["REQUEST_URI"], PHP_URL_QUERY);      // Extracts parameters only
$uri = explode("/" , $urlPath);                                     // Converts a string to an array

if ($uri[2] != "products") {                                         
    http_response_code(404);                                        // Rejects unsupported routings
    exit;
}

$database = new Database(
                $config->host, $config->dbName,
                $config->username, $config->password);              // Connects to the database

$user_gateway = new UserGateway($database);                         // User-related DB queries
$codec = new JWTCodec($config->secret_key);                         // Encode, decode and validate
$auth = new Auth($user_gateway, $codec);                            // JWT authentication

if (! $auth->authenticateAccessToken()) {
    exit;                                                           // Exits if token is invalid
}

$user_id = $auth->getUserId();

$id = $uri[3] ?? null;

$product_gateway = new ProductGateway($database);                   // Product-related DB queries
$controller = new ProductController($product_gateway, $user_id);    // Product request controller

$controller->processRequest($_SERVER["REQUEST_METHOD"], $id);       // Execute product request