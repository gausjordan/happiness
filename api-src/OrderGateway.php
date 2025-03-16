<?php

class OrderGateway {
    private PDO $conn;
    public function __construct(Database $database) {
        $this->conn = $database->getConnection();
    }
 
    // TODO: Return more than 0 rows on a blank order
    public function getUnfinishedOrder($id) {
               
        $sql = "
            SELECT `orders`.id AS order_id, `product`.id AS product_id, quantity, title, naslov, price, is_available, is_visible, MIN(`product_images`.url) AS url FROM `orders`
            LEFT JOIN `user` ON `orders`.`user_id` = `user`.`id`
            LEFT JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
            LEFT JOIN `product` ON `order_items`.`product_id` = `product`.id
            LEFT JOIN `product_images` ON `product`.id = `product_images`.`product_id`
            WHERE `orders`.`dateOrdered` IS NULL
            AND
            user_id = :user_id
            AND (CASE 
        WHEN `product`.id IS NOT NULL THEN `product`.is_available = 1 AND `product`.is_visible = 1
        ELSE 1
    END)
            GROUP BY `orders`.id, `product`.id, quantity, title, naslov, price, is_available, is_visible;
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":user_id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        return $data;
    }
    

    public function getSingleOrderDetailsForUser($id, $user_id, $user_role) {
    
        $sql = "
            # Fetch one order by id, with all the product details
                SELECT order_id, product_id, quantity, price_charged
                FROM `orders`
                INNER JOIN `user` ON `orders`.`user_id` = `user`.`id`
                INNER JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
                WHERE order_id = :order_id
                AND user_id = :user_id;
            ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":order_id", $id, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $stmt->execute();

        $data = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        return $data;
    }


    public function addItemToAnOrder($product_id, $user_id) {
        
        $sql = "SELECT `product`.price FROM `product` WHERE `product`.id = :product_id;"; 
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":product_id", $product_id, PDO::PARAM_INT);
        $stmt->execute();
        $current_price = $stmt->fetchColumn();

        $sql = "SELECT `orders`.id FROM `orders` WHERE `orders`.user_id = :user_id AND `orders`.dateOrdered IS NULL;"; 
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $stmt->execute();
        $order_id = $stmt->fetchColumn();

        // Assumption: there IS a row (in the orders table) for this particular user.
        // Front-end should always check for that. If it doesn't, for whatever reason, quit silently.
        if ($current_price == null || $order_id == null) {
            http_response_code(422);
            exit;
        }

        $sql = "
            INSERT INTO `order_items` (order_id, product_id, quantity, price_charged)
            VALUES ($order_id, :product_id, 1, $current_price)
            ON DUPLICATE KEY UPDATE quantity = quantity + 1, price_charged = price_charged + $current_price;
        ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":product_id", $product_id, PDO::PARAM_INT);
        $stmt->execute();
    }


    public function getSingleOrderDetailsForAdmin($id, $user_id, $user_role) {

        $sql = "
        # Fetch one order by id, with all the product details
            SELECT order_id, product_id, quantity, price_charged
            FROM `orders`
            INNER JOIN `user` ON `orders`.`user_id` = `user`.`id`
            INNER JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
            # WHERE `dateOrdered` IS NOT NULL
            AND order_id = :order_id;
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":order_id", $id, PDO::PARAM_INT);
        $stmt->execute();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        return $data;
    }

    public function getSingleOrderMetadata($id) : array | null {
        $sql = "SELECT * FROM orders WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        return $data ?? null;
    }

    public function updateSingleOrderMetadata($oldOrder, $newData) {
        $id = $oldOrder[0]["id"];
        $is_shipped = $oldOrder[0]["is_shipped"];
        $is_paid = $oldOrder[0]["is_paid"];
        $is_returned = $oldOrder[0]["is_returned"];
        $is_refunded = $oldOrder[0]["is_refunded"];
        $is_archived = $oldOrder[0]["is_archived"];
        $dateOrdered = $oldOrder[0]["dateOrdered"];
        $dateReceived  = $oldOrder[0]["dateReceived"];

        $sql = "UPDATE
                    orders
                SET
                    dateOrdered = :dateOrdered,
                    dateReceived = :dateReceived,
                    is_shipped = :is_shipped,
                    is_paid = :is_paid,
                    is_returned = :is_returned,
                    is_refunded = :is_refunded,
                    is_archived = :is_archived
                WHERE
                    id = :id;";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);

        // If there is a date key - to be updated to 'null'
        if (array_key_exists("dateOrdered", $newData) && $newData["dateOrdered"] == null) {
            $stmt->bindValue(":dateOrdered", null, PDO::NULL_NATURAL);
        } else {
            $stmt->bindValue(":dateOrdered", $newData["dateOrdered"] ?? $dateOrdered, PDO::PARAM_STR);
        }
        if (array_key_exists("dateReceived", $newData) && $newData["dateReceived"] == null) {
            $stmt->bindValue(":dateReceived", null, PDO::NULL_NATURAL);
        } else {
            $stmt->bindValue(":dateReceived", $newData["dateReceived"] ?? $dateReceived, PDO::PARAM_STR);
        }

        $stmt->bindValue(":is_shipped", $newData["is_shipped"] ?? $is_shipped, PDO::PARAM_INT);
        $stmt->bindValue(":is_paid", $newData["is_paid"] ?? $is_paid, PDO::PARAM_INT);
        $stmt->bindValue(":is_returned", $newData["is_returned"] ?? $is_returned, PDO::PARAM_INT);
        $stmt->bindValue(":is_refunded", $newData["is_refunded"] ?? $is_refunded, PDO::PARAM_INT);
        $stmt->bindValue(":is_archived", $newData["is_archived"] ?? $is_archived, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }


    public function getOrdersOwnerId($id) : int | null {
        $sql = "SELECT user_id FROM orders WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result["user_id"] ?? null;
    }


    public function getAllOrdersByUser($id) {
        $sql = "
            # Fetch all orders made by the current user
            SELECT order_id, dateOrdered, dateReceived, is_shipped, is_paid, is_returned, is_refunded, SUM(price_charged) AS price FROM `orders`
            INNER JOIN `user` ON `orders`.`user_id` = `user`.`id`
            INNER JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
            WHERE user_id = :user_id
            AND `dateOrdered` IS NOT NULL
            GROUP BY order_id
            ORDER BY dateOrdered DESC;
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":user_id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        return $data;
    }


    public function deleteUnfinishedOrder($id) {
        $sql = "DELETE FROM `orders` WHERE `user_id` = :id AND `dateOrdered` IS NULL";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function deleteOrderItem($id, $item) {
        $sql = "DELETE FROM order_items WHERE `order_id` = :order_id AND `product_id` = :product_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":order_id", $id, PDO::PARAM_INT);
        $stmt->bindValue(":product_id", $item, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }


    public function createNewOrder($id) {
        $sql = "INSERT INTO orders (user_id) VALUES (:id);";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }


    public function listAllOrders(?array $urlQuery) {
        
        $limit = null;
        $orderByAsc = null;
        $orderByDesc = null;
        $visibility = " WHERE is_archived = 0 ";
        $search = null;
        
        if (isset($urlQuery)) {
            if (in_array("order-by-asc", array_keys($urlQuery))) {
                $orderByAsc = " ORDER BY " . $urlQuery["order-by-asc"] . " ASC ";
            }
            if (in_array("order-by-desc", array_keys($urlQuery))) {
                $orderByDesc = " ORDER BY " . $urlQuery["order-by-desc"] . " DESC ";
            }
            if (in_array("show-all", array_keys($urlQuery))) {
                $visibility = null;
            }
            if (in_array("limit", array_keys($urlQuery))) {
                $limits = explode(',', $urlQuery["limit"]);
                if(count($limits) == 2) {
                    $limitFrom = $limits[0];
                    $limitLen = $limits[1];
                    $limit = " LIMIT $limitFrom, $limitLen ";
                }
            }
            if (isset($urlQuery["search"])) {
                if ($visibility) {
                    $search = " 
                        AND (username LIKE :search_string1 OR
                        firstName LIKE :search_string2 OR
                        lastName LIKE :search_string3) 
                    ";
                } else {
                    $search = " 
                        WHERE (username LIKE :search_string1 OR
                        firstName LIKE :search_string2 OR
                        lastName LIKE :search_string3)  
                    ";
                }
            }
        }

        $sql_base = "
            SELECT order_id, user.username, user.firstName, user.lastName, dateOrdered, dateReceived, is_shipped, is_paid, is_returned, is_refunded, is_archived, SUM(price_charged) AS price, comment FROM `orders`
            INNER JOIN `user` ON `orders`.`user_id` = `user`.`id`
            INNER JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
        ";

        $sql_group_by = " GROUP BY order_id ";

        $sql = $sql_base . $visibility . $search . $sql_group_by . $orderByAsc . $orderByDesc . $limit;

        //echo $sql;

        $stmt = $this->conn->prepare($sql);

        if (isset($urlQuery) && in_array("search", array_keys($urlQuery))) {
            $bindSearchValue = '%' . $urlQuery["search"] . '%';
            $stmt->bindValue(":search_string1", $bindSearchValue, PDO::PARAM_STR);
            $stmt->bindValue(":search_string2", $bindSearchValue, PDO::PARAM_STR);
            $stmt->bindValue(":search_string3", $bindSearchValue, PDO::PARAM_STR);
        }

        $stmt->execute();

        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        return $data;
    }

    
}