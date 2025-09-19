<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Table Status Channel
Broadcast::channel('floor-tables', function ($user) {
    // You can add conditions, e.g., only certain roles can listen
    return $user !== null;
});

// Order History Channel
Broadcast::channel('order-histories', function ($user) {
    return $user !== null;
});

// Lock Table Channel
Broadcast::channel('table-locked', function ($user) {
    return $user !== null;
});

// Unlock Table Channel
Broadcast::channel('table-unlocked', function ($user) {
    return $user !== null;
});
