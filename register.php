<?php
    // configuration (sensitive) data
    $config = require(__DIR__ . DIRECTORY_SEPARATOR . "private" . DIRECTORY_SEPARATOR . "config.php" );

    require "src\Database.php";

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $database = new Database($config->host,
        $config->dbName,
        $config->username,
        $config->password);

        $conn = $database->getConnection();

        $sql = "INSERT INTO user (username, firstName, lastName, password_hash)
                VALUES (:userName, :firstName, :lastName, :password_hash)";
    
        $stmt = $conn->prepare($sql);
    
        $stmt->bindValue(":firstName", $_POST["firstName"], PDO::PARAM_STR);
        $stmt->bindValue(":lastName", $_POST["lastName"], PDO::PARAM_STR);
        $stmt->bindValue(":userName", $_POST["userName"], PDO::PARAM_STR);
        $stmt->bindValue(":password_hash", password_hash($_POST["password"], PASSWORD_DEFAULT), PDO::PARAM_STR);
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
                <label for="firstName">
                    First Name
                    <input name="firstName" id="firstName">
                </label>
                <label for="lastName">
                    Last Name
                    <input name="lastName" id="lastName">
                </label>
                <label for="userName">
                    Username
                    <input name="userName" id="name">
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