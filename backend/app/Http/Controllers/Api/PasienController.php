<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use App\Services\SatuSehatService;
use Illuminate\Http\Request;

class PasienController extends Controller
{
    protected FhirRepository $fhir;
    protected SatuSehatService $satusehat;

    public function __construct(FhirRepository $fhir, SatuSehatService $satusehat)
    {
        $this->fhir = $fhir;
        $this->satusehat = $satusehat;
    }

    public function cekNik($nik)
    {
        $patients = $this->fhir->all('patients');
        
        // 1. Cek terlebih dahulu di data pasien lokal
        foreach ($patients as $patient) {
            $identifiers = $patient['identifier'] ?? [];
            foreach ($identifiers as $id) {
                if ($id['system'] === 'https://fhir.kemkes.go.id/id/nik' && (string)$id['value'] === (string)$nik) {
                    // Extract helper fields from FHIR Patient
                    $norm = '';
                    $ihsNumber = '';
                    $nikVal = '';
                    foreach ($patient['identifier'] as $ident) {
                        if ($ident['system'] === 'http://simrs-kel7.local/norm') $norm = $ident['value'];
                        if ($ident['system'] === 'https://fhir.kemkes.go.id/id/ihs-number') $ihsNumber = $ident['value'];
                        if ($ident['system'] === 'https://fhir.kemkes.go.id/id/nik') $nikVal = $ident['value'];
                    }

                    $gender = $patient['gender'] ?? 'male';
                    $jk = ($gender === 'male' || $gender === 'Laki-laki') ? 'Laki-laki' : 'Perempuan';

                    return response()->json([
                        'status' => 'found',
                        'source' => 'lokal',
                        'data' => [
                            'id' => $patient['id'],
                            'no_rm' => $norm ?: $patient['id'],
                            'ihs_number' => $ihsNumber,
                            'nik' => $nikVal,
                            'nama' => $patient['name'][0]['text'] ?? '',
                            'tgl_lahir' => $patient['birthDate'] ?? '',
                            'jenis_kelamin' => $jk,
                            'no_telp' => $patient['telecom'][0]['value'] ?? '',
                            'alamat' => $patient['address'][0]['text'] ?? ($patient['address'][0]['line'][0] ?? ''),
                        ],
                        'fhir_resource' => $patient,
                        'message' => 'Pasien telah terdaftar di database rekam medis lokal'
                    ]);
                }
            }
        }
        
        // 2. Jika belum terdaftar di SIMRS lokal, cari langsung ke SATUSEHAT Kemenkes (Live / Sandbox Dummy)
        $satusehatResult = $this->satusehat->getPatientByNik($nik);
        if ($satusehatResult['found'] ?? false) {
            $p = $satusehatResult['data'];
            return response()->json([
                'status' => 'found',
                'source' => 'satusehat',
                'sub_source' => $satusehatResult['source'],
                'data' => [
                    'id' => null, // Belum memiliki nomor RM lokal
                    'no_rm' => null,
                    'ihs_number' => $p['ihs_number'],
                    'nik' => $p['nik'],
                    'nama' => $p['nama'],
                    'tgl_lahir' => $p['tgl_lahir'],
                    'jenis_kelamin' => $p['jenis_kelamin'],
                    'no_telp' => $p['no_telp'] ?? '',
                    'alamat' => $p['alamat'] ?? '',
                ],
                'fhir_resource' => $satusehatResult['fhir_resource'] ?? null,
                'message' => 'Data pasien ditemukan di platform SATUSEHAT (' . 
                    ($satusehatResult['source'] === 'satusehat_live' ? 'Live API Kemenkes' : 'Data Dummy Sandbox Kemenkes') . ')'
            ]);
        }

        return response()->json(['status' => 'not_found', 'found' => false]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nik' => 'required',
            'nama' => 'required',
            'tgl_lahir' => 'required',
            'jenis_kelamin' => 'required',
            'alamat' => 'required',
        ]);

        $telepon = $request->telepon ?? $request->no_telp ?? '';

        // Cek apakah NIK sudah terdaftar sebelumnya
        $existingPatients = $this->fhir->all('patients') ?? [];
        foreach ($existingPatients as $ep) {
            foreach ($ep['identifier'] ?? [] as $id) {
                if ($id['system'] === 'https://fhir.kemkes.go.id/id/nik' && (string)$id['value'] === (string)$request->nik) {
                    $ep['name'][0]['text'] = $request->nama;
                    $ep['birthDate'] = $request->tgl_lahir;
                    $ep['address'][0]['text'] = $request->alamat;
                    if (!empty($telepon)) {
                        $ep['telecom'][0]['value'] = $telepon;
                    }
                    $normVal = $ep['id'];
                    $this->fhir->save('patients', $normVal, $ep);

                    return response()->json([
                        'pasien' => [
                            'id' => $normVal,
                            'no_rm' => $normVal,
                            'ihs_number' => $ep['identifier'][2]['value'] ?? 'IHS-AUTO',
                            'nama' => $request->nama,
                        ],
                        'fhir_resource' => $ep,
                    ], 200);
                }
            }
        }

        // Generate nomor RM yang terjamin unik
        do {
            $norm = 'RM-' . date('Y') . '-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while ($this->fhir->find('patients', $norm));

        $ihs = ($request->filled('ihs_number') && $request->ihs_number !== '-' && $request->ihs_number !== 'IHS-AUTO')
            ? $request->ihs_number
            : ('P' . str_pad(rand(0, 9999999999), 10, '0', STR_PAD_LEFT));

        // Map jenis_kelamin to FHIR gender
        $jk = $request->jenis_kelamin;
        $fhirGender = ($jk === 'L' || $jk === 'Laki-laki' || $jk === 'male') ? 'male' : 'female';

        $patient = [
            'resourceType' => 'Patient',
            'id' => $norm,
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/norm', 'value' => $norm],
                ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => (string)$request->nik],
                ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => $ihs]
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => $request->nama]
            ],
            'gender' => $fhirGender,
            'birthDate' => $request->tgl_lahir,
            'telecom' => [
                ['system' => 'phone', 'value' => $telepon, 'use' => 'mobile']
            ],
            'address' => [
                ['use' => 'home', 'text' => $request->alamat]
            ]
        ];

        $this->fhir->save('patients', $norm, $patient);

        return response()->json([
            'pasien' => [
                'id' => $norm,
                'no_rm' => $norm,
                'ihs_number' => $ihs,
                'nama' => $request->nama,
            ],
            'fhir_resource' => $patient,
        ], 201);
    }
}

