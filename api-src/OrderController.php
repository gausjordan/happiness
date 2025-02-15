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

                // Checks if there is something in a user's cart, but not yet orderd
                // There should always be only one incomplete order in the database
                // '$id' parameter is a corresponding user's id here, NOT the order's id
                if (isset($urlQuery) && array_key_exists("unfinished", $urlQuery)) {
                    if ($id !== $this->user_id && $this->user_role !== "admin" && $this->user_role !== "employee") {
                        http_response_code(403);
                        echo json_encode(["Message: " => "Only admins can access another's order."]);
                        exit;
                    }
                    $result = $this->gateway->getUnfinishedOrder($id);
                    if (sizeof($result) != 0) {
                        echo json_encode($result);
                        return $result;
                    } else {
                        http_response_code(404);
                        echo json_encode(["Message: " => "No incomplete orders available for this user."]);
                        return null;
                    }

                // Get a list of all completed orders ever made by user with id = $id
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
                
                // If no parameters were given, we get order details by order's id
                else {

                    // A user can only access one's own order
                    if ($this->user_role !== 'admin' && $this->user_role !== 'employee') {

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
                        
                    // Admins and employees get to see anyone's order, plus internal comments, if any
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
                // Prevent sales records deletion unless unfinalized
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
        
        if ($this->user_role !== "admin" && $this->user_role !== "employee") {
            http_response_code(403);
            echo json_encode(["Message: " => "Valid credentials required."]);
            exit;
        }

        switch ($method) {
            
            case "GET":

                if (isset($urlQuery) && array_key_exists("unfinished", $urlQuery)) {
                    $result = $this->gateway->getUnfinishedOrder($id);
                    if (sizeof($result) != 0) {
                        echo json_encode($result);
                        return $result;
                    } else {
                        http_response_code(404);
                        echo json_encode(["Message: " => "No incomplete orders available for this user."]);
                        return null;
                    }
                }

                break;
            
            
            default:
                break;
        
        }

    }
}