<?php

namespace App\Events;

use App\Models\Tenant\FloorTable;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TableUnlocked implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $table;

    /**
     * Create a new event instance.
     */
    public function __construct(FloorTable $table)
    {
        $this->table = $table;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('table-unlocked'),
        ];
    }

    public function broadcastAs()
    {
        return 'TableUnlocked';
    }

}
