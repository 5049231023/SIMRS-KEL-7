<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PasienController;
use App\Http\Controllers\Api\KunjunganController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\IGDController;
use App\Http\Controllers\Api\FarmasiController;
use App\Http\Controllers\Api\LaboratoriumController;
use App\Http\Controllers\Api\KasirController;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('fhir.auth');
    Route::get('/me', [AuthController::class, 'me'])->middleware('fhir.auth');
});

Route::middleware('fhir.auth')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/pasien/cek-nik/{nik}', [PasienController::class, 'cekNik']);
    Route::post('/pasien', [PasienController::class, 'store']);
    Route::get('/kunjungan', [KunjunganController::class, 'index']);
    Route::post('/kunjungan', [KunjunganController::class, 'store']);
    Route::put('/kunjungan/{id}/ttv', [KunjunganController::class, 'updateTtv']);
    Route::put('/kunjungan/{id}/pemeriksaan', [KunjunganController::class, 'pemeriksaan']);

    // IGD
    Route::get('/igd/antrian', [IGDController::class, 'antrian']);
    Route::put('/igd/triage/{id}', [IGDController::class, 'triage']);
    Route::put('/igd/selesai/{id}', [IGDController::class, 'selesai']);

    // Farmasi
    Route::get('/farmasi/resep', [FarmasiController::class, 'index']);
    Route::post('/farmasi/resep', [FarmasiController::class, 'store']);
    Route::put('/farmasi/resep/{id}', [FarmasiController::class, 'dispense']);

    // Laboratorium
    Route::get('/lab/permintaan', [LaboratoriumController::class, 'index']);
    Route::post('/lab/permintaan', [LaboratoriumController::class, 'store']);
    Route::put('/lab/permintaan/{id}', [LaboratoriumController::class, 'hasil']);

    // Kasir
    Route::get('/kasir/tagihan', [KasirController::class, 'index']);
    Route::post('/kasir/tagihan', [KasirController::class, 'store']);
    Route::put('/kasir/tagihan/{id}', [KasirController::class, 'bayar']);
});
