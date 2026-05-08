<?php

return [

    'sanctum' => [
        'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
            '%s%s',
            'localhost,localhost:3000,localhost:8000,127.0.0.1,127.0.0.1:8000,127.0.0.1:3000,',
            env('APP_URL') ? str_replace(['http://', 'https://'], '', env('APP_URL')) : ''
        ))),

        'expiration' => null,

        'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

        'middleware' => [
            'authenticate_session' => \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
            'encrypt_cookies' => \Illuminate\Cookie\Middleware\EncryptCookies::class,
        ],
    ],

];
