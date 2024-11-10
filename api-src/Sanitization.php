<?php

class Sanitization {

    // Converts a string of '&'-separated key=value pairs into an array
    function unpackQueries($urlQuery) : array | null {
        if ($urlQuery == null || $urlQuery == "") {
            return null;
        }
        parse_str($urlQuery, $result);

        foreach ($result as $r => $value) {
            if ($value == null || $value == "") {
                http_response_code(400);
                echo(json_encode([
                    "message" => "Invalid query format."
                ]));
                exit;
            }
        }
        return $result;
    }

    // Check query validity
    function checkProductQueries($urlQuery) {
        if($urlQuery) {

            $validQueries = [
                "products_and_categories",
                "products_and_tags",
                "limit"
            ];

            foreach ($urlQuery as $key => $value) {
                // if ($key !== "products_and_categories" && $key !== "products_and_tags" && $key !== "limit") {
                if (!in_array($key, $validQueries, true)) {
                    echo(json_encode([ "message" => "Invalid query key(s)." ]));
                    http_response_code(400);
                    exit;
                }
            }
            return $urlQuery;
        }
    }


    function validateQueries($urlQuery, $validQueries) {
        if($urlQuery) {

            foreach ($urlQuery as $key => $value) {
                if (!in_array($key, $validQueries, true)) {
                    echo(json_encode([ "message" => "Invalid query key(s)." ]));
                    http_response_code(400);
                    exit;
                }
            }
            return $urlQuery;
        }
    }
    

    function isDigit($id) {
        if (!ctype_digit($id)) {
            http_response_code(404);
            echo json_encode(["message" => "Product id must be a number."]);
            exit;
        }
    }

    // Check characters one by one and replace diacritics (if any) with base chars
    function replaceDiacritics($matches) {
        $map = [
                    'š' => 's', 'đ' => 'd', 'č' => 'c', 'ć' => 'c', 'ž' => 'z',
                    'Š' => 'S', 'Đ' => 'D', 'Č' => 'C', 'Ć' => 'C', 'Ž' => 'Z'
                ];
        return $map[$matches[0]] ?? $matches[0];
    }

    function sanitizeFilename(string $filename) : string {
        $filename = mb_ereg_replace("([^(a-zA-Z0-9šđčćž\s\d\-_~,\[\]\(\).])", '', $filename, 'i');
        $filename = mb_ereg_replace("([\.]{2,})", '', $filename);
        $output = preg_replace_callback('/[šđčćžŠĐČĆŽ]/u', [$this, 'replaceDiacritics'], $filename);
        return $output;
    }


}