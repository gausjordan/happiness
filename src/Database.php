<?php

/**
 * A class used to connect to the database
 *
 * This class provides a method to get a new (or reuse existing) PDO connection
 *
 */
class Database {

    private ?PDO $conn = null;

    public function __construct(
            private string $host,
            private string $dbName,
            private string $username,
            private string $password
        )
    { }

    public function getConnection(): PDO {

        if ($this->conn === null) {
            
            $dataSourceName = "mysql:host={$this->host};
                            dbname={$this->dbName}; 
                            charset=utf8;";
            $this->conn = new PDO($dataSourceName,
                        $this->username, $this->password,
                            [
                                PDO::ATTR_EMULATE_PREPARES => false,
                                PDO::ATTR_STRINGIFY_FETCHES => false,
                                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                            ]
                        );
        }
        
        return $this->conn;
    }
}