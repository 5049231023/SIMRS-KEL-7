<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use Illuminate\Http\Request;

class PasienController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function cekNik($nik)
    {
        $patients = $this->fhir->all('patients');
        
        foreach ($patients as $patient) {
            $identifiers = $patient['identifier'] ?? [];
            foreach ($identifiers as $id) {
                if ($id['system'] === 'https://fhir.kemkes.go.id/id/nik' && $id['value'] === $nik) {
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
                        'data' => [
                            'id' => $patient['id'],
                            'no_rm' => $norm,
                            'ihs_number' => $ihsNumber,
                            'nik' => $nikVal,
                            'nama' => $patient['name'][0]['text'] ?? '',
                            'tgl_lahir' => $patient['birthDate'] ?? '',
                            'jenis_kelamin' => $jk,
                            'no_telp' => $patient['telecom'][0]['value'] ?? '',
                            'alamat' => $patient['address'][0]['text'] ?? '',
                        ],
                        'fhir_resource' => $patient,
                    ]);
                }
            }
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
        $norm = 'RM-' . date('Y') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $ihs = 'P' . str_pad(rand(0, 9999999999), 10, '0', STR_PAD_LEFT);

        // Map jenis_kelamin to FHIR gender
        $jk = $request->jenis_kelamin;
        $fhirGender = ($jk === 'L' || $jk === 'Laki-laki' || $jk === 'male') ? 'male' : 'female';
        $displayJk = ($fhirGender === 'male') ? 'Laki-laki' : 'Perempuan';

        $patient = [
            'resourceType' => 'Patient',
            'id' => $norm,
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/norm', 'value' => $norm],
                ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => $request->nik],
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

