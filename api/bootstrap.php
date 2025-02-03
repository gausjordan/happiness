<?php

/**
 * Initialize the API. Tasks:
 * 
 *   - dump config.php content into an object
 *   - set up a simple auto-loader
 *   - set the default content type to JSON
 *   - set charset to utf-8
 *   - set-up custom error and exception handlers
 */

$config = require(dirname(__DIR__, 1) . DIRECTORY_SEPARATOR . "private" . DIRECTORY_SEPARATOR . "config.php");

spl_autoload_register(function ($class) {
    require dirname(__DIR__, 1) . DIRECTORY_SEPARATOR . "api-src" . DIRECTORY_SEPARATOR . $class . ".php";
});

set_error_handler("CustomErrorHandler::handleError");
set_exception_handler("CustomErrorHandler::handleException");
header("Content-type: application/json; charset=UTF-8;");
header("Access-Control-Allow-Origin: http://localhost"); // Allow requests from http://localhost
header("Access-Control-Allow-Credentials: true"); // Allow cookies and authorization headers
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS"); // Allow these HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow these headers


/*
header("Access-Control-Allow-Origin: http://localhost"); // Allow requests from http://localhost
header("Access-Control-Allow-Credentials: true"); // Allow cookies and authorization headers
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS"); // Allow these HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow these headers

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Set headers for preflight requests
    header("Access-Control-Allow-Origin: http://localhost");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    exit(0); // Exit to stop further execution
}
*/