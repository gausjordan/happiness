<?php
    // configuration (sensitive) data
    $config = require(__DIR__ . DIRECTORY_SEPARATOR . "config.php" );

    require "src\Database.php";

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $database = new Database($config->host,
        $config->dbName,
        $config->username,
        $config->password);

        $conn = $database->getConnection();

        $sql = "INSERT INTO user (name, username, password_hash, salt)
                VALUES (:name, :username, :password_hash, :salt)";
    
        $stmt = $conn->prepare($sql);
    
        // $api_key = bin2hex(random_bytes(16));

        function randomSalt($length) {
            $charset='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            $str = '';
            $count = strlen($charset);
            while ($length--) {
            $str .= $charset[mt_rand(0, $count-1)];
            }
            return $str;
        }

        $stmt->bindValue(":name", $_POST["name"], PDO::PARAM_STR);
        $stmt->bindValue(":username", $_POST["username"], PDO::PARAM_STR);
        $stmt->bindValue(":password_hash", password_hash($_POST["password"], PASSWORD_DEFAULT), PDO::PARAM_STR);
        $stmt->bindValue(":salt", randomSalt(16), PDO::PARAM_STR);
        $stmt->execute();

        exit;
    }


?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Register</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
    </head>
    <body>
        <main class="container">
            <h1>Register</h1>
            <form method="post">
                <label for="name">
                    Name
                    <input name="name" id="name">
                </label>
                <label for="username">
                    Username
                    <input name="username" id="name">
                </label>
                <label for="password">
                    Password
                    <input type="password" name="password" id="password">
                </label>
                <button>
                    Register
                </button>
            </form>
        </main>    
    </body>
</html>