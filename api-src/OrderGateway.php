<?php

class OrderGateway {
    private PDO $conn;
    public function __construct(Database $database) {
        $this->conn = $database->getConnection();
    }

    public function getUnfinishedOrder($id) {
        
        // echo $id;
        
        $sql = "
        # Fetch the most recent unfinished order, if there is one
            SELECT order_id, product_id, quantity  FROM `orders`
            LEFT JOIN `user` ON `orders`.`user_id` = `user`.`id`
            LEFT JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
            WHERE `orders`.`dateOrdered` IS NULL
            AND
            user_id = :user_id;
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

    
}