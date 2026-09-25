<?php

namespace App\Enums;

enum ChartType: string
{
    case Area = 'area';
    case Bar = 'bar';
    case Bubble = 'bubble';
    case Doughnut = 'doughnut';
    case Pie = 'pie';
    case Line = 'line';
    case Polar = 'polar';
    case Radar = 'radar';
    case Scatter = 'scatter';
}
