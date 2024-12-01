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
                GROUP_CONCAT(DISTINCT product_categories.category ORDER BY product_categories.category SEPARATOR ', ') as category,
                GROUP_CONCAT(DISTINCT product_tags.tag ORDER BY product_tags.tag SEPARATOR ', ') as tag,
                GROUP_CONCAT(DISTINCT product_images.url SEPARATOR ', ') as url,
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
            ON `product`.`id` = `product_images`.`product_id` " . 

            ($showHiddenProducts ? "WHERE `is_visible` = 1 GROUP BY product.id, product.title;"
                                : "GROUP BY product.id, product.title;");

        $statement = $this->conn->prepare($sql);
        $statement->execute();
        $data = [];
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $row["is_visible"] = (bool) $row["is_visible"];
            $row["is_available"] = (bool) $row["is_available"];
            $row["price"] = (float) $row["price"];
            $row["tag"] = $row["tag"] == null ? [] : explode(", ", $row["tag"]);
            $row["url"] = $row["url"] == null ? [] : explode(", ", $row["url"]);
            $row["category"] = $row["category"] == null ? [] : explode(", ", $row["category"]);
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
        
        if (!empty($data["url"])) {
            $urlsLength = count($data["url"]) - 1;
            $sql = "INSERT INTO product_images (product_id, url) VALUES";
            foreach($data["url"] as $i=>$u) {
                if ($urlsLength !== $i) {
                    $sql = $sql . " (" . $createdId . ", " . "\"" . $u . "\"),";
                } else {
                    $sql = $sql . " (" . $createdId . ", " . "\"" . $u . "\");";
                }
            }
            $statement = $this->conn->prepare($sql);
            $statement->execute();
        }

        if (!empty($data["tag"])) {
            $tagCounter = sizeof($data["tag"]) - 1;
            while ($tagCounter >= 0) {
                $sql = "
                    INSERT INTO products_and_tags (product_id, tag_id)
                    VALUES(:product_id, (
                                            SELECT tag_id t
                                            FROM products_and_tags pat
                                            INNER JOIN product_tags pt
                                            ON pat.tag_id = pt.id
                                            WHERE tag = :tag_name
                                            LIMIT 1)
                                        );
                ";
        
                $statement = $this->conn->prepare($sql);
                $statement->bindValue(":tag_name", ($data["tag"][$tagCounter] ?? null), PDO::PARAM_STR);
                $statement->bindValue(":product_id", ($createdId ?? null), PDO::PARAM_INT);
                $statement->execute();
                $tagCounter--;
            }
        }

        if (!empty($data["category"])) {
            $categoryCounter = sizeof($data["category"]) - 1;
            while ($categoryCounter >= 0) {
                $sql = "
                    INSERT INTO products_and_categories (product_id, category_id)
                    VALUES(:product_id, (
                                            SELECT category_id
                                            FROM products_and_categories pac
                                            INNER JOIN product_categories pc
                                            ON pac.category_id = pc.id
                                            WHERE pc.category = :category_name
                                            LIMIT 1)
                                        );
                ";
        
                $statement = $this->conn->prepare($sql);
                $statement->bindValue(":category_name", ($data["category"][$categoryCounter] ?? null), PDO::PARAM_STR);
                $statement->bindValue(":product_id", ($createdId ?? null), PDO::PARAM_INT);
                $statement->execute();
                $categoryCounter--;
            }
        }

        $this->conn->rollBack();
        // $this->conn->commit();
        return $createdId;        

    }

    public function get(string $productId, ?bool $showHiddenProducts = false) : array | false {
        $sql = "

            SELECT
                product.id,
                product.naslov,
                product.title,
                COALESCE(product.description, \"No description.\") as description,
                COALESCE(product.opis, \"Nema opisa proizvoda.\") as opis,
                COALESCE(GROUP_CONCAT(DISTINCT product_categories.category ORDER BY product_categories.category SEPARATOR ', '), \"None\") as category,
                COALESCE(GROUP_CONCAT(DISTINCT product_tags.tag ORDER BY product_tags.tag SEPARATOR ', '), \"None\") as tag,
                GROUP_CONCAT(DISTINCT product_images.url SEPARATOR ', ') as url,
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
            WHERE `product`.`id` = :productId " .

            ($showHiddenProducts ? " AND `is_visible` = 1 GROUP BY product.id, product.title;"
                               : "GROUP BY product.id, product.title;");

        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":productId", $productId, PDO::PARAM_STR);
        $statement->execute();
        //$statement->debugDumpParams();
        $data = [];
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $row["is_visible"] = (bool) $row["is_visible"];
            $row["is_available"] = (bool) $row["is_available"];
            $row["price"] = (float) $row["price"];
            $row["tag"] = $row["tag"] == null ? [] : explode(", ", $row["tag"]);
            $row["url"] = $row["url"] == null ? [] : explode(", ", $row["url"]);
            $row["category"] = $row["category"] == null ? [] : explode(", ", $row["category"]);
            $data[] = $row;
        }
        return $data;
    }

    public function update(array $old, array $new): int {

        $this->conn->beginTransaction();

        $sql = "
            UPDATE product
                SET title = :title,
                    naslov = :naslov,
                    description = :description,
                    opis = :opis,
                    price = :price,
                    is_available = :is_available,
                    is_visible = :is_visible
            WHERE product.id = :id;
        ";

        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":id", $old[0]["id"], PDO::PARAM_INT);
        $statement->bindValue(":title", $new["title"] ?? $old[0]["title"], PDO::PARAM_STR);
        $statement->bindValue(":naslov", $new["naslov"] ?? $old[0]["naslov"], PDO::PARAM_STR);
        $statement->bindValue(":description", $new["description"] ?? $old[0]["description"], PDO::PARAM_STR);
        $statement->bindValue(":opis", $new["opis"] ?? $old[0]["opis"], PDO::PARAM_STR);
        $statement->bindValue(":price", $new["price"] ?? $old[0]["price"], PDO::PARAM_STR);
        $statement->bindValue(":is_available", $new["is_available"] ?? $old[0]["is_available"], PDO::PARAM_BOOL);
        $statement->bindValue(":is_visible", $new["is_visible"] ?? $old[0]["is_visible"], PDO::PARAM_BOOL);
        $statement->execute();
        $productsRowCount = $statement->rowCount();

        // TODO - include: image, category, and tag updates
        if (!empty($new["url"])) {
            echo sizeof($new["url"]);
        }

        $this->conn->commit();
        return $productsRowCount;
    }

    public function delete(int $user_id, string $id) : int {
        $sql = "DELETE FROM product WHERE id = :id AND user_id = :user_id";
        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":id", $id, PDO::PARAM_INT);
        $statement->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $statement->execute();
        return $statement->rowCount();
    }
}