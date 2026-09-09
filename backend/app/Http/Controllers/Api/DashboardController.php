<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class DashboardController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function stats(Request $request)
    {
        $encounters = $this->fhir->all('encounters');
        
        $totalKunjungan = count($encounters);
        $rawatInap = 0;
        $igd = 0;

        foreach ($encounters as $enc) {
            $code = Arr::get($enc, 'class.code');
            if ($code === 'IMP') {
                $rawatInap++;
            } elseif ($code === 'EMER') {
                $igd++;
            }
        }

        $bor = min(($rawatInap / 50) * 100, 100);

        return response()->json([
            'totalKunjungan' => $totalKunjungan,
            'bor' => round($bor, 2),
            'rawatInap' => $rawatInap,
            'igd' => $igd
        ]);
    }
}
