<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SatuSehatService;
use Illuminate\Http\Request;

class SatuSehatController extends Controller
{
    protected SatuSehatService $satusehat;

    public function __construct(SatuSehatService $satusehat)
    {
        $this->satusehat = $satusehat;
    }

    /**
     * Cek status koneksi dan konfigurasi SATUSEHAT Fasyankes
     */
    public function status()
    {
        return response()->json($this->satusehat->getStatus());
    }

    /**
     * Dapatkan daftar pasien dummy resmi Kemenkes untuk kemudahan pengetesan
     */
    public function dummyPatients()
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->satusehat->getDummyPatients()
        ]);
    }
}
