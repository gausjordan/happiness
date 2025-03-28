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
        $sql = "SELECT user.id AS id, username, firstName, lastName, email, phone, addressStreet, addressNumber, postalCode, city, country, role, password_hash, description FROM `user` INNER JOIN `user_roles` ON user.role = user_roles.id WHERE username = :username";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":username", $username, PDO::PARAM_STR);
        $stmt->execute();
        $output = $stmt->fetch(PDO::FETCH_ASSOC);
        return $output;
    }

    public function getByUserId(int $id): array | false {
        $sql = "SELECT user.id AS id, username, firstName, lastName, email, phone, addressStreet, addressNumber, postalCode, city, country, role, password_hash, description FROM `user` INNER JOIN `user_roles` ON user.role = user_roles.id WHERE user.id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createUser(array $data) : string | null {

        $sql = "INSERT INTO user (username, firstName, lastName, email, phone, addressStreet, addressNumber, postalCode, city, country, role, password_hash) VALUES (:username, :firstName, :lastName, :email, :phone, :addressStreet, :addressNumber, :postalCode, :city, :country, 2, :password_hash)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":username", $data["username"], PDO::PARAM_STR);
        $stmt->bindValue(":firstName", $data["firstName"], PDO::PARAM_STR);
        $stmt->bindValue(":lastName", $data["lastName"], PDO::PARAM_STR);
        $stmt->bindValue(":email", $data["email"], PDO::PARAM_STR);
        $stmt->bindValue(":phone", $data["phone"] ?? null, PDO::PARAM_STR);
        $stmt->bindValue(":addressStreet", $data["addressStreet"], PDO::PARAM_STR);
        $stmt->bindValue(":addressNumber", $data["addressNumber"], PDO::PARAM_STR);
        $stmt->bindValue(":postalCode", $data["postalCode"], PDO::PARAM_INT);
        $stmt->bindValue(":city", $data["city"], PDO::PARAM_STR);
        $stmt->bindValue(":country", $data["country"], PDO::PARAM_STR);
        $stmt->bindValue(":password_hash", password_hash($data["password"], PASSWORD_DEFAULT), PDO::PARAM_STR);
        $stmt->execute();
        
        $createdId = $this->conn->lastInsertId();

        return $createdId;
    }


    public function updateUser(array $user, array $data) : int | null {

        $sql = "
            UPDATE user
                SET
                    username = :username,
                    firstName = :firstName,
                    lastName = :lastName,
                    email = :email,
                    phone = :phone,
                    addressStreet = :addressStreet,
                    addressNumber = :addressNumber,
                    postalCode = :postalCode,
                    city = :city,
                    country = :country,
                    role = :role,
                    password_hash = :password_hash
            WHERE user.id = :id;
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $user["id"], PDO::PARAM_STR);
        $stmt->bindValue(":username", $data["username"] ?? $user["username"], PDO::PARAM_STR);
        $stmt->bindValue(":firstName", $data["firstName"] ?? $user["firstName"], PDO::PARAM_STR);
        $stmt->bindValue(":lastName", $data["lastName"] ?? $user["lastName"], PDO::PARAM_STR);
        $stmt->bindValue(":email", $data["email"] ?? $user["email"], PDO::PARAM_STR);
        $stmt->bindValue(":phone", $data["phone"] ?? null, PDO::PARAM_STR);
        $stmt->bindValue(":addressStreet", $data["addressStreet"] ?? $user["addressStreet"], PDO::PARAM_STR);
        $stmt->bindValue(":addressNumber", $data["addressNumber"] ?? $user["addressNumber"], PDO::PARAM_STR);
        $stmt->bindValue(":postalCode", $data["postalCode"] ?? $user["postalCode"], PDO::PARAM_INT);
        $stmt->bindValue(":city", $data["city"] ?? $user["city"], PDO::PARAM_STR);
        $stmt->bindValue(":country", $data["country"] ?? $user["country"], PDO::PARAM_STR);
        $stmt->bindValue(":role", $data["role"] ?? $user["role"], PDO::PARAM_STR);
        $stmt->bindValue(":password_hash", !empty($data["password"]) ? password_hash($data["password"], PASSWORD_DEFAULT) : $user["password_hash"], PDO::PARAM_STR);

        $stmt->execute();
        
        return $stmt->rowCount();
    }


    public function getAllUsers(): array | false {
        $sql = "SELECT id, username, firstName, lastName, email, phone, addressStreet, addressNumber, postalCode, city, country, role FROM `user`";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }
        return $data;
    }

    public function deleteUser($id): int | false {
        $sql = "DELETE FROM user WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();        
        return $stmt->rowCount();
    }
}