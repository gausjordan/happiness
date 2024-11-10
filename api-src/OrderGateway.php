<?php

class OrderGateway {
    private PDO $conn;
    public function __construct(Database $database) {
        $this->conn = $database->getConnection();
    }
 
    // ..#..
    public function getUnfinishedOrder($id) {
               
        $sql = "
            SELECT `orders`.id AS order_id, `product`.id AS product_id, quantity, title, naslov, price, is_available, is_visible, MIN(`product_images`.url) AS url FROM `orders`
            LEFT JOIN `user` ON `orders`.`user_id` = `user`.`id`
            LEFT JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
            LEFT JOIN `product` ON product_id = `product`.id
            INNER JOIN `product_images` ON `product`.id = `product_images`.`product_id`
            WHERE `orders`.`dateOrdered` IS NULL AND is_available = 1 AND is_visible = 1
            AND
            user_id = :user_id
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
                SELECT order_id, product_id, quantity, price_charged, dateOrdered, dateReceived, is_shipped, is_paid, is_returned, is_refunded
                FROM `orders`
                INNER JOIN `user` ON `orders`.`user_id` = `user`.`id`
                INNER JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
                WHERE `dateOrdered` IS NOT NULL
                AND order_id = :order_id
                AND user_id = :user_id;
            ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":order_id", $id, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data;
    }


    public function getSingleOrderDetailsForAdmin($id, $user_id, $user_role) {
        $sql = "
        # Fetch one order by id, with all the product details
            SELECT order_id, product_id, quantity, price_charged, dateOrdered, dateReceived, is_shipped, is_paid, is_returned, is_refunded, comment
            FROM `orders`
            INNER JOIN `user` ON `orders`.`user_id` = `user`.`id`
            INNER JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
            WHERE `dateOrdered` IS NOT NULL
            AND order_id = :order_id;
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":order_id", $id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $data;
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

        echo $sql;

        $stmt = $this->conn->prepare($sql);

        if (in_array("search", array_keys($urlQuery))) {
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