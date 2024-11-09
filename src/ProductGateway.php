<?php

/**
 * Provides methods for product-related DB queries
 */
class ProductGateway {

    private PDO $conn;
    public function __construct(Database $database) {
        $this->conn = $database->getConnection();
    }

    public function getAllForUser(int $user_id): array {
        $sql = "SELECT * FROM product WHERE user_id = :user_id ORDER BY name";
        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $statement->execute();
        $data = [];
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $row["is_available"] = (bool) $row["is_available"];
            $data[] = $row;
        }
        return $data;
    }

    public function createForUser(int $user_id, array $data) : string {
        $sql = "INSERT INTO product (name, size, is_available, user_id)
                VALUES (:name, :size, :is_available, :user_id)";
        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":name", $data["name"], PDO::PARAM_STR);
        $statement->bindValue(":size", $data["size"] ?? 0, PDO::PARAM_INT);
        $statement->bindValue(":is_available", (bool) ($data["is_available"] ?? false), PDO::PARAM_BOOL);
        $statement->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $statement->execute();
        return $this->conn->lastInsertId();
    }

    public function getForUser(int $user_id, string $id) : array | false {
        $sql = "SELECT * FROM product WHERE id = :id AND user_id = :user_id";
        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":id", $id, PDO::PARAM_INT);
        $statement->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $statement->execute();

        $data = $statement->fetch(PDO::FETCH_ASSOC);
        if ($data !== false) {
            $data["is_available"] = (bool) $data["is_available"];
        }
        return $data;
    }

    public function updateForUser(int $user_id, array $current, array $new): int {
        $sql = "UPDATE product
                SET name = :name, size = :size, is_available = :is_available
                WHERE id = :id AND user_id = :user_id";
        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":name", $new["name"] ?? $current["name"], PDO::PARAM_STR);
        $statement->bindValue(":size", $new["size"] ?? $current["size"], PDO::PARAM_INT);
        $statement->bindValue(":is_available", $new["is_available"] ?? $current["is_available"], PDO::PARAM_BOOL);
        $statement->bindValue(":id", $current["id"], PDO::PARAM_INT);
        $statement->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $statement->execute();
        return $statement->rowCount();
    }

    public function deleteForUser(int $user_id, string $id) : int {
        $sql = "DELETE FROM product WHERE id = :id AND user_id = :user_id";
        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":id", $id, PDO::PARAM_INT);
        $statement->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $statement->execute();
        return $statement->rowCount();
    }
}