<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KunjunganController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function index(Request $request)
    {
        $nikFilter = $request->query('nik');
        $namaFilter = $request->query('nama');

        $encounters = $this->fhir->all('encounters');
        $result = [];

        foreach ($encounters as $enc) {
            $patientRef = $enc['subject']['reference'] ?? '';
            $patientId = str_replace('Patient/', '', $patientRef);
            
            $patient = $this->fhir->find('patients', $patientId);
            
            if ($patient) {
                $enc['patient_data'] = $patient;
                
                $match = true;
                if ($nikFilter) {
                    $nikFound = false;
                    foreach ($patient['identifier'] ?? [] as $id) {
                        if ($id['system'] === 'https://fhir.kemkes.go.id/id/nik' && str_contains($id['value'], $nikFilter)) {
                            $nikFound = true;
                            break;
                        }
                    }
                    if (!$nikFound) $match = false;
                }
                
                if ($namaFilter) {
                    $nama = strtolower($patient['name'][0]['text'] ?? '');
                    if (!str_contains($nama, strtolower($namaFilter))) {
                        $match = false;
                    }
                }
                
                if ($match) {
                    $result[] = $enc;
                }
            } else {
                if (!$nikFilter && !$namaFilter) {
                    $result[] = $enc;
                }
            }
        }

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required',
            'tgl_kunjungan' => 'required',
            'poli' => 'required',
            'pelayanan' => 'required',
            'penjamin' => 'required',
            'keluhan' => 'required',
        ]);

        $classMap = [
            'Rawat Jalan' => 'AMB',
            'Rawat Inap' => 'IMP',
            'IGD' => 'EMER'
        ];
        
        $code = $classMap[$request->pelayanan] ?? 'AMB';
        
        $patient = $this->fhir->find('patients', $request->patient_id);
        $patientName = $patient ? ($patient['name'][0]['text'] ?? 'Unknown') : 'Unknown';

        $id = 'enc-' . time() . '-' . rand(1000, 9999);
        $poliSlug = Str::slug($request->poli);

        $encounter = [
            'resourceType' => 'Encounter',
            'id' => $id,
            'status' => 'finished',
            'class' => [
                'system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                'code' => $code,
                'display' => $request->pelayanan
            ],
            'subject' => [
                'reference' => "Patient/{$request->patient_id}",
                'display' => $patientName
            ],
            'period' => [
                'start' => $request->tgl_kunjungan
            ],
            'serviceType' => [
                'coding' => [
                    [
                        'system' => 'http://simrs-kel7.local/poli',
                        'code' => $poliSlug,
                        'display' => $request->poli
                    ]
                ]
            ],
            'reasonCode' => [
                ['text' => $request->keluhan]
            ],
            'extension' => [
                [
                    'url' => 'http://simrs-kel7.local/ext/penjamin',
                    'valueString' => $request->penjamin
                ]
            ]
        ];

        $this->fhir->save('encounters', $id, $encounter);

        return response()->json($encounter, 201);
    }
}
