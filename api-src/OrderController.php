<?php

class OrderController {


    public function __construct(
        private OrderGateway $gateway,
        private Sanitization $sanitize,
        private int $user_id,
        private string $user_role
    ) { }

    public function processRequest(string $method, ?string $id, ?array $urlQuery): void {
        if ($id) {
            $this->sanitize->isDigit($id);
            $id = intval($id);
            $this->processResourceRequest($method, $id, $urlQuery);
        }
        else {
            $this->processCollectionRequest($method, $id, $urlQuery);
        }
    }

    private function processResourceRequest($method, $id, $urlQuery) {
        
        if ($this->user_role == "guest") {
            http_response_code(403);
            echo json_encode(["Message: " => "Valid credentials required."]);
            exit;
        }

        switch ($method) {
            
            case "GET":

                // Checks whether there is a opened 'cart' (order) which is not yet completed
                // '$id' parameter is a corresponding user's id, NOT the order's id
                // Also, there should always be only one incomplete order in the database
                if (isset($urlQuery) && array_key_exists("unfinished", $urlQuery)) {
                    if ($id !== $this->user_id && $this->user_role !== "admin" && $this->user_role !== "employee") {
                        http_response_code(403);
                        echo json_encode(["Message: " => "Only admins can access another user's order."]);
                        exit;
                    }
                    $result = $this->gateway->getUnfinishedOrder($id);
                    if (sizeof($result) != 0) {
                        echo json_encode($result);
                        return $result;
                    } else {
                        http_response_code(204);
                        echo json_encode(["Message: " => "No incomplete orders available for this user."]);
                        return null;
                    }

                // Get a list of all completed orders ever made by a user with id = $id
                // '$id' parameter is a corresponding user's id, NOT the order's id
                } else if (isset($urlQuery) && array_key_exists("all-by-user", $urlQuery)) {

                    if ($this->user_role !== "admin" && $this->user_role !== "employee") {
                        http_response_code(403);
                        echo json_encode(["Message: " => "Only admins can access another's order."]);
                        exit;
                    }

                    $result = $this->gateway->getAllOrdersByUser($id);
                    
                    if (sizeof($result) != 0) {
                        echo json_encode($result);
                        return $result;
                    } else {
                        http_response_code(404);
                        echo json_encode(["Message: " => "No orders made by this user."]);
                        return null;
                    }
                }
                
                // If no query parameters were given, we get order details by order's id
                else {

                    // A user can only access one's own order
                    if ($this->user_role !== 'admin' && $this->user_role !== 'employee') {
                        
                        // Find out which user (by id) made the order that we want
                        $ordersOwnerId = $this->gateway->getOrdersOwnerId($id);

                        if ($ordersOwnerId !== $this->user_id) {
                            http_response_code(403);
                            echo json_encode(["Message: " => "Only admins can access another's order details."]);
                            exit;
                        }

                        if ( $ordersOwnerId === null ) {
                            http_response_code(404);
                            echo json_encode(["Message: " => "Order id $id was not found."]);
                            return null;
                        }
                        
                        $result = $this->gateway->getSingleOrderDetailsForUser($id, $this->user_id, $this->user_role);

                        if ($result) {
                            echo json_encode($result);
                            return $result;                        
                        } else {
                            http_response_code(404);
                            echo json_encode(["Message: " => "Order id $id for user id $this->user_id was not found."]);
                            return null;
                        }
                        
                    // Admins and employees get to see anyone's order, plus internal comments, if there are any
                    } else if ($this->user_role == 'admin' || $this->user_role !== 'employee') {
                        $result = $this->gateway->getSingleOrderDetailsForAdmin($id, $this->user_id, $this->user_role);
                        if ($result) {
                            echo json_encode($result);
                            return $result;                        
                        } else {
                            http_response_code(404);
                            echo json_encode(["Message: " => "Order id $id does not exist."]);
                            return null;
                        }
                    }
                }
                break;

            case "DELETE":
                // Prevent sales record deletion unless unfinalized, finalized orders should be immutable
                // '$id' parameter is a corresponding user's id, NOT the order's id
                if (!$this->gateway->getUnfinishedOrder($id)) {
                    http_response_code(404);
                    echo json_encode(["Message: " => "No incomplete orders available for this user."]);
                } else {
                    if ($this->gateway->deleteUnfinishedOrder($id)) {
                        echo json_encode(["Message: " => "Unfinalized order for user $id deleted."]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["Message: " => "Error deleting an incomplete order."]);
                    }
                }
                break;
            default:

                break; 
        }
    }

    private function processCollectionRequest($method, $id, $urlQuery) {
        
        switch ($method) {
            
            case "GET":

                // Get all of the orders, made by all users, ever. Admins and employees only.
                if ($this->user_role !== "admin" && $this->user_role !== "employee") {
                    http_response_code(403);
                    echo json_encode(["Message: " => "Valid high level credentials required."]);
                    exit;
                }

                $result = null;
                
                $result = $this->gateway->listAllOrders($urlQuery);
                echo json_encode($result);


                break;
            
            case "POST":

                $data = (array) json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data);

                if ($this->user_role !== "user" && $this->user_role !== "employee" && $this->user_role !== "admin") {
                    $errors[] = "Placing an order requires a user account.";
                }
                
                if (! empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["errors" => $errors]);
                    break;
                }
                
                $result = $this->gateway->createNewOrder($this->user_id);
                echo json_encode(["Message: " => "New order created for user $this->user_id. $result row affected."]);

                break;
                            
            default:
                break;
        
        }
    }

    function getValidationErrors($data) {
                
    }
}