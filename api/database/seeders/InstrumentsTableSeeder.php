<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Instrument;

class InstrumentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $intrument = new Instrument();
        $intrument->name = 'Percussion';
        $intrument->save();
        
        $intrument = new Instrument();
        $intrument->name = 'Strings';
        $intrument->save();

        $intrument = new Instrument();
        $intrument->name = 'Wind';
        $intrument->save();

        $intrument = new Instrument();
        $intrument->name = 'Double Bass';
        $intrument->save();

        $intrument = new Instrument();
        $intrument->name = 'Keyboard';
        $intrument->save();

        $intrument = new Instrument();
        $intrument->name = 'Vocals';
        $intrument->save();

        $intrument = new Instrument();
        $intrument->name = 'Guitar';
        $intrument->save();

        $intrument = new Instrument();
        $intrument->name = 'Bass';
        $intrument->save();
    }
}
