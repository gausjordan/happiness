<?php

$payload = [
    "sub" => $user["id"],
    // "name" => $user["username"],
    "name" => $user["firstName"],
    "role" => $user["description"],
    "exp" => time() + 90000000000000 // TODO: Change this
    // "exp" => time() + 5 // TODO: Change this
];

$access_token = $codec->encode($payload);

$refresh_token_expiry = time() + 432000;

$refresh_token = $codec->encode([
    "sub" => $user["id"],
    "exp" => $refresh_token_expiry
]);

echo json_encode([
    "access_token" => $access_token,
    "refresh_token" => $refresh_token
]);