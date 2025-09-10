<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('floor-tables', function ($user) {
    // You can add conditions, e.g., only certain roles can listen
    return $user !== null;
});
