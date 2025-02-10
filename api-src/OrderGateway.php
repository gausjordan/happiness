<?php

class OrderGateway {
    private PDO $conn;
    public function __construct(Database $database) {
        $this->conn = $database->getConnection();
    }

    public function getUnfinishedOrder($id) {
        $sql = "
        # Fetch the most recent unfinished order, if there is one
            SELECT order_id, product_id, quantity  FROM `orders`
            INNER JOIN `user` ON `orders`.`user_id` = `user`.`id`
            INNER JOIN `order_items` ON `orders`.`id` = `order_items`.`order_id`
            WHERE `dateOrdered` IS NULL
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

    public function deleteUnfinishedOrder($id) {
        $sql = "DELETE FROM `orders` WHERE `user_id` = :id AND `dateOrdered` IS NULL";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        $stmt->rowCount();
    }

    
}