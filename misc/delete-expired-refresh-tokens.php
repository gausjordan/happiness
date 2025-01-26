<?php

declare(strict_types=1);

spl_autoload_register(function ($class) {
    require dirname(__FILE__) . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR . $class . ".php";
});

$config = require(dirname(__FILE__) . DIRECTORY_SEPARATOR . "config.php" );

$database = new Database($config->host,
                         $config->dbName,
                         $config->username,
                         $config->password);

$refresh_token_gateway = new RefreshTokenGateway($database, $config->secret_key);

echo $refresh_token_gateway->deleteExpired(), "\n";