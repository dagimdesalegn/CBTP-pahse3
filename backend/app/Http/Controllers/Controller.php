<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;

abstract class Controller
{
    protected function authorize($ability, $model = null)
    {
        if ($model === null) {
            return true;
        }

        Gate::authorize($ability, $model);

        return true;
    }
}
