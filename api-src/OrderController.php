<?php

class OrderController {

    public function __construct(
        private OrderGateway $gateway,
        private Sanitization $sanitize,
        private int $user_id,
        private string $user_role
    ) { }

    // '$id' parameter is a corresponding user's id, NOT the order's id itself
    public function processRequest(string $method, ?string $id, ?array $urlQuery): void {
        if ($id) {
            $this->sanitize->isDigit($id);
            $this->processResourceRequest($method, $id, $urlQuery);
        }
        else {
            $this->processCollectionRequest($method, $id, $urlQuery);
        }
    }

    private function processResourceRequest($method, $id, $urlQuery) {
        switch ($method) {
            case "GET":
                // Checks if there is something in a user's cart, not orderd yet
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
                } else {
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
        echo "All";
    }
}