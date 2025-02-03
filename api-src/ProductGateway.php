<?php

/**
 * Provides methods for product-related DB queries
 */
class ProductGateway {
    private PDO $conn;
    public function __construct(Database $database) {
        $this->conn = $database->getConnection();
    }

    public function getAll(int $user_id, ?bool $hideHiddenProducts = false, ?array $urlQuery = null, ?bool $count = false): array {

        // In case those variable don't get initialized via $urlQuery array
        $products_and_categories = null;
        $products_and_tags = null;
        $limit = null;

        // Use PHP's variable variables to assign all of them
        if ($urlQuery) {
            foreach ($urlQuery as $key => $value) {
                $$key = $value;
            }
        }

        // In counting mode, ignore the limit
        if ($count) { $limit = "0,1000"; }

        // Future SQL query may or may not need the WHERE clause (whether there is at least one variable present)
        if ($products_and_categories || $products_and_tags || $hideHiddenProducts) {
            $injectWhere = "WHERE ";
        } else {
            $injectWhere = "";
        }

        // Also, literal "AND" keyword(s) may be required
        $injectAndNo1 = $products_and_categories ? " AND " : "";
        $injectAndNo2 = $products_and_tags || $products_and_categories ? " AND " : "";

        $sql = "SELECT " .
            ($count ? "COUNT(DISTINCT product.id) AS productCount " : 
                "product.id,
                product.naslov,
                product.title,
                COALESCE(product.description, \"No description.\") as description,
                COALESCE(product.opis, \"Nema opisa proizvoda.\") as opis,
                COALESCE(GROUP_CONCAT(DISTINCT product_categories.category ORDER BY products_and_categories.id SEPARATOR ', '), \"None\") as category,
                COALESCE(GROUP_CONCAT(DISTINCT product_tags.tag ORDER BY products_and_tags.id SEPARATOR ', '), \"None\") as tag,
                GROUP_CONCAT(DISTINCT product_images.url ORDER BY product_images.id SEPARATOR ', ') as url,
                product.price,
                product.is_available,
                product.is_visible ") . 
            "FROM `product`
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
            $injectWhere .
            ($products_and_categories ? "FIND_IN_SET(`products_and_categories`.category_id, :prod_n_categ) " : "") .
            ($products_and_tags ? $injectAndNo1 . "FIND_IN_SET(`products_and_tags`.`tag_id`, :prod_n_tags)" : "") .
            ($hideHiddenProducts ? $injectAndNo2 . "`is_visible` = 1" : "") .
            ($count ? "" : " GROUP BY product.id, product.title ") .
            ($limit ? " LIMIT :limit_from,:limit_size;" : " LIMIT 0, 200;");

            $statement = $this->conn->prepare($sql);
            $products_and_categories ? $statement->bindValue(":prod_n_categ", $products_and_categories, PDO::PARAM_STR) : "";
            $products_and_tags ? $statement->bindValue(":prod_n_tags", $products_and_tags, PDO::PARAM_STR) : "";
            $limit ? $statement->bindValue(":limit_from", $limit[0], PDO::PARAM_INT) : "";
            $limit ? $statement->bindValue(":limit_size", $limit[2], PDO::PARAM_INT) : "";
            $statement->execute();

            if ($count) {
            $data[] = $statement->fetch(PDO::FETCH_ASSOC);
        } else {
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
        }

        return $data;
    }

    public function getTags() : array {
        $sql = "SELECT `product_tags`.id AS tag_id, `product_tags`.tag AS tagname_hr, `product_tags`.tag_english AS tagname_en FROM product_tags";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCategories() : array {
        $sql = "SELECT `product_categories`.id AS category_id, `product_categories`.category AS categoryname_hr, `product_categories`.category_english AS categoryname_en FROM product_categories";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function create(array $data) : string {

        $failure = false;
        
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
            $tagsNumber = $tagCounter;
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
                $statement->bindValue(":tag_name", ($data["tag"][$tagsNumber-$tagCounter] ?? null), PDO::PARAM_STR);
                $statement->bindValue(":product_id", ($createdId ?? null), PDO::PARAM_INT);
                $statement->execute();
                $tagCounter--;
            }
        }

        if (!empty($data["category"])) {
            $categoryCounter = sizeof($data["category"]) - 1;
            $categoryNumber = $categoryCounter;
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
                $statement->bindValue(":category_name", ($data["category"][$categoryNumber-$categoryCounter] ?? null), PDO::PARAM_STR);
                $statement->bindValue(":product_id", ($createdId ?? null), PDO::PARAM_INT);
                $statement->execute();
                $categoryCounter--;
            }
        }

        // $this->conn->rollBack();
        $this->conn->commit();
        return $createdId;        

    }


    public function get(string $productId, ?bool $hideHiddenProducts = false) : array | false {
        $sql = "

            SELECT
                product.id,
                product.naslov,
                product.title,
                COALESCE(product.description, \"No description.\") as description,
                COALESCE(product.opis, \"Nema opisa proizvoda.\") as opis,
                COALESCE(GROUP_CONCAT(DISTINCT product_categories.category ORDER BY products_and_categories.id SEPARATOR ', '), \"None\") as category,
                COALESCE(GROUP_CONCAT(DISTINCT product_tags.tag ORDER BY products_and_tags.id SEPARATOR ', '), \"None\") as tag,
                GROUP_CONCAT(DISTINCT product_images.url ORDER BY product_images.id SEPARATOR ', ') as url,
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

            ($hideHiddenProducts ? " AND `is_visible` = 1 GROUP BY product.id, product.title;"
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
        return $data ? $data[0] : false;
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
        $statement->bindValue(":id", $old["id"], PDO::PARAM_INT);
        $statement->bindValue(":title", $new["title"] ?? $old["title"], PDO::PARAM_STR);
        $statement->bindValue(":naslov", $new["naslov"] ?? $old["naslov"], PDO::PARAM_STR);
        $statement->bindValue(":description", $new["description"] ?? $old["description"], PDO::PARAM_STR);
        $statement->bindValue(":opis", $new["opis"] ?? $old["opis"], PDO::PARAM_STR);
        $statement->bindValue(":price", $new["price"] ?? $old["price"], PDO::PARAM_STR);
        $statement->bindValue(":is_available", $new["is_available"] ?? $old["is_available"], PDO::PARAM_BOOL);
        $statement->bindValue(":is_visible", $new["is_visible"] ?? $old["is_visible"], PDO::PARAM_BOOL);
        $statement->execute();
        $productsRowCount = $statement->rowCount();
        
        if (isset($new["tag"]) && ($old["tag"] !== $new["tag"])) {
            $sql = "DELETE FROM products_and_tags WHERE products_and_tags.product_id = :product_id" ;
            $statement = $this->conn->prepare($sql);
            $statement->bindValue(":product_id", $old["id"], PDO::PARAM_INT);
            $statement->execute();
            $tagCounter = sizeof($new["tag"]) - 1;
            $tagNumber = $tagCounter;
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
                $statement->bindValue(":tag_name", ($new["tag"][$tagNumber-$tagCounter] ?? null), PDO::PARAM_STR);
                $statement->bindValue(":product_id", ($old["id"] ?? null), PDO::PARAM_INT);
                $statement->execute();
                $tagCounter--;
            }
            $productsRowCount++;
        }

        if (isset($new["category"]) && $old["category"] !== $new["category"]) {
            $sql = "DELETE FROM products_and_categories WHERE products_and_categories.product_id = :product_id" ;
            $statement = $this->conn->prepare($sql);
            $statement->bindValue(":product_id", $old["id"], PDO::PARAM_INT);
            $statement->execute();
            $categoryCounter = sizeof($new["category"]) - 1;
            $categoryNumber = $categoryCounter;
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
                $statement->bindValue(":category_name", ($new["category"][$categoryNumber-$categoryCounter] ?? null), PDO::PARAM_STR);
                $statement->bindValue(":product_id", ($old["id"] ?? null), PDO::PARAM_INT);
                $statement->execute();
                $categoryCounter--;
            }
            $productsRowCount++;
        }

        if (isset($new["url"]) && $old["url"] !== $new["url"]) {
            $sql = "DELETE FROM product_images WHERE product_id = :product_id" ;
            $statement = $this->conn->prepare($sql);
            $statement->bindValue(":product_id", $old["id"], PDO::PARAM_INT);
            $statement->execute();

            if ($new["url"] !== []) {
                $urlsLength = count($new["url"]) - 1;
                $sql = "INSERT INTO product_images (product_id, url) VALUES";
                foreach($new["url"] as $i=>$u) {
                    if ($urlsLength !== $i) {
                        $sql = $sql . " (" . $old["id"] . ", " . "\"" . $u . "\"),";
                    } else {
                        $sql = $sql . " (" . $old["id"] . ", " . "\"" . $u . "\");";
                    }
                }
                // echo $sql;
                $statement = $this->conn->prepare($sql);
                $statement->execute();
            }
            $productsRowCount++;
        }

        $this->conn->commit();
        return $productsRowCount;

    }


    public function delete(string $id) : int {
        $sql = "DELETE FROM product WHERE id = :id";
        $statement = $this->conn->prepare($sql);
        $statement->bindValue(":id", $id, PDO::PARAM_INT);
        $statement->execute();
        return $statement->rowCount();
    }
}