<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function authorize($ability, $model = null)
    {
        if ($model === null) {
            return true;
        }

        $policy = auth()->user()->{$ability}($model);

        if (!$policy) {
            abort(403, 'This action is unauthorized.');
        }

        return true;
    }
}
