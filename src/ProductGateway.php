<?php

/**
 * Provides methods for product-related DB queries
 */
class ProductGateway {
    private PDO $conn;
    public function __construct(Database $database) {
        $this->conn = $database->getConnection();
    }

    public function getAll(int $user_id, ?bool $showHiddenProducts = false): array {

        $sql = "

            SELECT
                product.id,
                product.naslov,
                product.title,
                COALESCE(product.description, \"No description.\") as description,
                COALESCE(product.opis, \"Nema opisa proizvoda.\") as opis,
                COALESCE(GROUP_CONCAT(DISTINCT product_categories.category ORDER BY product_categories.category SEPARATOR ', '), \"None\") as category,
                COALESCE(GROUP_CONCAT(DISTINCT product_tags.tag ORDER BY product_tags.tag SEPARATOR ', '), \"None\") as tag,
                GROUP_CONCAT(product_images.url SEPARATOR ', ') as url,
                product.price,
                product.is_available,
                product.is_visible

            FROM `product`

            LEFT JOIN `products_and_categories`
            ON `product`.`id` = `products_and_categories`.`product_id`

            LEFT JOIN `product_categories`
            ON `products_and_categories`.`category_id` = `product_categories`.`id`

            LEFT JOIN `products_and_tags`
            ON `product`.`id` = `products_and_tags`.`product_id`

            LEFT JOIN `product_tags`
            ON `products_and_tags`.`tag_id` = `product_tags`.`id`

            LEFT JOIN `product_images`
            ON `product`.`id` = `product_images`.`product_id`

            GROUP BY product.id, product.title;

        ";

        $statement = $this->conn->prepare($sql);
        $statement->execute();
        $data = [];
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $row["is_visible"] = (bool) $row["is_visible"];
            $row["is_available"] = (bool) $row["is_available"];
            $data[] = $row;
        }
        return $data;
    }

    public function create(array $data) : string {
        
        $this->conn->beginTransaction();

        $sql = "
            INSERT INTO product (title, naslov, description, opis, price, is_available, is_visible)
            VALUES (:title, :naslov, :description, :opis, :price, :is_available, :is_visible);
        ";

        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":title", $data["title"], PDO::PARAM_STR);
        $statement->bindValue(":naslov", $data["naslov"], PDO::PARAM_STR);
        $statement->bindValue(":description", ($data["description"] ?? null), PDO::PARAM_STR);
        $statement->bindValue(":opis", ($data["opis"] ?? null), PDO::PARAM_STR);
        $statement->bindValue(":price", $data["price"] ?? 0, PDO::PARAM_STR);
        $statement->bindValue(":is_available", (bool) ($data["is_available"] ?? false), PDO::PARAM_BOOL);
        $statement->bindValue(":is_visible", (bool) ($data["is_visible"] ?? false), PDO::PARAM_BOOL);
        $statement->execute();

        $createdId = $this->conn->lastInsertId();
        
        $sql = "INSERT INTO product_images (product_id, url) VALUES";
        $urlsLength = count($data["url"]) - 1;
        if (!empty($data["url"])) {
            foreach($data["url"] as $i=>$u) {
                if ($urlsLength !== $i) {
                    $sql = $sql . " (" . $createdId . ", " . "\"" . $u . "\"),";
                } else {
                    $sql = $sql . " (" . $createdId . ", " . "\"" . $u . "\");";
                }
            }
        }

        $statement = $this->conn->prepare($sql);
        $statement->execute();

        $this->conn->commit();
        
        return $createdId;
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