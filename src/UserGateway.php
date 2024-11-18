<?php

/**
 * Provides methods for user-related DB queries
 */
class UserGateway {

    private PDO $conn;
    public function __construct(Database $database) {
        $this->conn = $database->getConnection();
    }

    public function getByUsername(string $username): array | false {
        $sql = "SELECT * FROM `user` INNER JOIN `user_roles` ON user.role = user_roles.id WHERE username = :username";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":username", $username, PDO::PARAM_STR);
        $stmt->execute();
        $output = $stmt->fetch(PDO::FETCH_ASSOC);
        return $output;
    }

    public function getByUserId(int $id): array | false {
        // $sql = "SELECT * FROM user WHERE id = :id";
        $sql = "SELECT * FROM `user` INNER JOIN `user_roles` ON user.role = user_roles.id WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}