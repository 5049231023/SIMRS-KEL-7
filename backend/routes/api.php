<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PasienController;
use App\Http\Controllers\Api\KunjunganController;
use Illuminate\Support\Facades\Route;

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
});
