<?php

declare(strict_types=1);
require __DIR__ . DIRECTORY_SEPARATOR . "bootstrap.php";

$raw = $_SERVER["REQUEST_URI"];
$urlPath = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$urlQuery = parse_url($_SERVER["REQUEST_URI"], PHP_URL_QUERY);
$uri = explode("/" , $urlPath);

/*
// DEBUG .txt logger
$myfile = fopen("indexlog.txt", "a") or die("Unable to open file!");
$txt = $raw . "\n";
fwrite($myfile, $txt);
fclose($myfile);
*/

$database = new Database(
    $config->host, $config->dbName,
    $config->username, $config->password);

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    exit;
}

// Authentication
$user_id = 0;           // No one is logged for the moment
$user_role = "guest";   // And 'no one' has a role of a "guest" by default

$user_gateway = new UserGateway($database);
$codec = new JWTCodec($config->secret_key);
$auth = new Auth($user_gateway, $codec);
$sanitize = new Sanitization();

if ($auth->authenticateAccessToken()) {
    $user_id = $auth->getUserId();
    $user_role = $auth->getUserRole();
}



switch ($uri[2]) {

    case "products" : {

        $product_gateway = new ProductGateway($database);
        $productController = new ProductController($product_gateway, $sanitize, $user_id, $user_role);


        // Routing
        if (empty($uri[3]))
        {
            // Inspect and transform URL queries
            $urlQuery = $sanitize->unpackQueries($urlQuery);
            $urlQuery = $sanitize->validateQueries($urlQuery, ["search", "order", "direction", "lang", "products_and_categories", "products_and_tags", "limit", "structure"]);

            // No product id => either a "get all" or a "post one"
            $productController->processRequest($_SERVER["REQUEST_METHOD"], null, $urlQuery);
        } 
        else if ($uri[3] !== "images")
        {
            // URI does have an id, and it's not "image" => it's a product resource request
            $productController->processRequest($_SERVER["REQUEST_METHOD"], $uri[3], $urlQuery);
        }
        else if ($uri[3] == "images")
        {
            // Either a POST or a DELETE request on a "products/image" resource, POST won't have na id, DELETE will
            $id = $uri[4] ?? null;
            $productController->processImageRequest($_SERVER["REQUEST_METHOD"], $id);  
        }
        break;
    }


    case "users" : {

        $user_gateway = new UserGateway($database);
        $user_controller = new UserController($user_gateway, $sanitize, $user_id, $user_role);

        // Inspect and transform URL queries
        $urlQuery = $sanitize->unpackQueries($urlQuery);
        $urlQuery = $sanitize->validateQueries($urlQuery, ["search", "limit"]);

        $user_controller->processRequest($_SERVER["REQUEST_METHOD"], $uri[3] ?? null, $urlQuery);

        break;
    }
    

    case "orders" : {
        
        $order_gateway = new OrderGateway($database);
        $order_controller = new OrderController($order_gateway, $sanitize, $user_id, $user_role);

        // Inspect and transform URL queries
        $urlQuery = $sanitize->unpackQueries($urlQuery);
        $urlQuery = $sanitize->validateQueries($urlQuery, ["quantity", "order_item_id", "delete-item", "all-by-user", "unfinished", "limit", "order-by-asc", "order-by-desc", "show-all", "search"]);
        $order_controller->processRequest($_SERVER["REQUEST_METHOD"], $uri[3] ?? null, $urlQuery);

        break;
    }


    default: {
        echo(json_encode([ "message" => "Endpoint not found." ]));
        http_response_code(404);
        exit;
    }

}
