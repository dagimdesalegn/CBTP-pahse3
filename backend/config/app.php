<?php

return [

    'app' => [
        'name' => env('APP_NAME', 'Laravel'),
        'env' => env('APP_ENV', 'production'),
        'debug' => env('APP_DEBUG', false),
        'url' => env('APP_URL', 'http://localhost'),
        'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost')),
    ],

];
