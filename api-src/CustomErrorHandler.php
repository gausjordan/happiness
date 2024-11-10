<?php

require (dirname(__DIR__, 1) . DIRECTORY_SEPARATOR . "api" . DIRECTORY_SEPARATOR . "bootstrap.php");


class CustomErrorHandler {

    public static function handleException(Throwable $e): void {
        
        global $config;

        if ($config->hide_errors === false) {
            http_response_code(500);
            echo json_encode([
                "code"      => $e->getCode(),
                "message"   => $e->getMessage(),
                "file"      => $e->getFile(),
                "line"      => $e->getLine()
            ]);
        }
    }

    public static function handleError(
                                int $errno,
                                string $errstr,
                                string $errfile,
                                int $errline        
                                ): bool
    {
        global $config;
        if ($config->hide_errors === false) {
            throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
        } else {
            return false;
        }
    }
}