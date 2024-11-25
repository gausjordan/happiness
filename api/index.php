<?php

declare(strict_types=1);
require __DIR__ . DIRECTORY_SEPARATOR . "bootstrap.php";

$raw = $_SERVER["REQUEST_URI"];
$urlPath = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$urlQuery = parse_url($_SERVER["REQUEST_URI"], PHP_URL_QUERY);
$uri = explode("/" , $urlPath);

if ($uri[2] == "products") {
    $database = new Database(
        $config->host, $config->dbName,
        $config->username, $config->password);

    $user_gateway = new UserGateway($database);
    $codec = new JWTCodec($config->secret_key);
    $auth = new Auth($user_gateway, $codec);
    
    if (! $auth->authenticateAccessToken()) { exit; }
    
    $user_id = $auth->getUserId();
    $user_role = $auth->getUserRole();
    $id = $uri[3] ?? null;
    
    $product_gateway = new ProductGateway($database);
    $controller = new ProductController($product_gateway, $user_id, $user_role);
    $controller->processRequest($_SERVER["REQUEST_METHOD"], $id);    

} else {
    http_response_code(404);
    exit;
}