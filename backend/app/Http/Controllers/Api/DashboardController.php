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

        $antreanPerawat = 0;
        $antreanDokter = 0;
        $selesaiHariIni = 0;

        foreach ($encounters as $enc) {
            $code = Arr::get($enc, 'class.code');
            if ($code === 'IMP') {
                $rawatInap++;
            } elseif ($code === 'EMER') {
                $igd++;
            }

            $alur = Arr::get($enc, '_workflow.status_alur');
            if ($alur === 'siap_dokter') {
                $antreanDokter++;
            } elseif ($alur === 'selesai' || Arr::get($enc, 'status') === 'finished') {
                $selesaiHariIni++;
            } else {
                $antreanPerawat++;
            }
        }

        $bor = min(($rawatInap / 50) * 100, 100);

        $resep = $this->fhir->all('prescriptions') ?? [];
        $resepPending = count(array_filter($resep, fn($r) => Arr::get($r, 'status') === 'pending'));

        $lab = $this->fhir->all('lab_orders') ?? [];
        $labPending = count(array_filter($lab, fn($l) => Arr::get($l, 'status') === 'ordered'));

        $tagihan = $this->fhir->all('invoices') ?? [];
        $tagihanPending = count(array_filter($tagihan, fn($t) => Arr::get($t, 'status') === 'unpaid'));

        return response()->json([
            'total_kunjungan' => $totalKunjungan,
            'bor' => round($bor, 2),
            'rawat_inap' => $rawatInap,
            'igd' => $igd,
            'antrean_perawat' => $antreanPerawat,
            'antrean_dokter' => $antreanDokter,
            'selesai_hari_ini' => $selesaiHariIni,
            'resep_pending' => $resepPending,
            'lab_pending' => $labPending,
            'tagihan_pending' => $tagihanPending
        ]);
    }
}
