<?php

    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');

    error_reporting(E_ALL);
    ini_set('output_buffering', 'Off');
    ini_set('display_startup_errors', 'On');
    ini_set('error_log', 'toilet.log');
    
    // error_log();
    
?>