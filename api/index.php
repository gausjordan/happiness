<?php

declare(strict_types=1);
require __DIR__ . DIRECTORY_SEPARATOR . "bootstrap.php";

// DEBUG BLOCK

// http_response_code(401);
// echo(json_encode(["message" => "Access token expired."]));
// exit;

// -----------


$raw = $_SERVER["REQUEST_URI"];
$urlPath = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$urlQuery = parse_url($_SERVER["REQUEST_URI"], PHP_URL_QUERY);
$uri = explode("/" , $urlPath);

$database = new Database(
    $config->host, $config->dbName,
    $config->username, $config->password);

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    exit;
}

$user_id = 0;           // No one is logged in for now
$user_role = "guest";   // And has a role of "guest" by default

switch ($uri[2]) {

    case "products" : {

        // Authentication
        $user_gateway = new UserGateway($database);
        $codec = new JWTCodec($config->secret_key);
        $auth = new Auth($user_gateway, $codec);

        if ($auth->authenticateAccessToken()) {
            $user_id = $auth->getUserId();
            $user_role = $auth->getUserRole();
        }
        
        $product_gateway = new ProductGateway($database);
        $controller = new ProductController($product_gateway, $user_id, $user_role);


        // Routing
        if (empty($uri[3]))
        {
            // No product id => either "get all" or "post one"
            $controller->processRequest($_SERVER["REQUEST_METHOD"], null);    
        } 
        else if ($uri[3] !== "images")
        {
            // Does have an id, and it's not "image" => product resource request
            $controller->processRequest($_SERVER["REQUEST_METHOD"], $uri[3]);
        }
        else if ($uri[3] == "images")
        {
            // Either a POST or a DELETE request on a "products/image" resource
            // POST request won't have na id, a DELETE request will
            $id = $uri[4] ?? null;
            $controller->processImageRequest($_SERVER["REQUEST_METHOD"], $id);  
        }
        break;
    }
    default: {
        echo(json_encode([ "message" => "Endpoint not found." ]));
        http_response_code(404);
        exit;
    }
}