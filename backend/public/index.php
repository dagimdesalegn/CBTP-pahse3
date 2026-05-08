<?php

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader for
| our application. We just need to utilize it! We'll require it into the
| script here so that we do not have to worry about manual loading any of
| our classes later on. It feels nice to relax.
|
*/

require __DIR__.'/../vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Bootstrap The Application
|--------------------------------------------------------------------------
|
| Next, we need to bootstrap the Laravel application. The bootstrap file
| will be loaded and in turn will bootstrap the rest of the application
| and get it ready for receiving requests from the browser.
|
*/

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = \Illuminate\Http\Request::capture()
)->send();

$kernel->terminate($request, $response);
