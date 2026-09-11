<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use Illuminate\Http\Request;

class IGDController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function antrian()
    {
        $encounters = $this->fhir->all('encounters') ?? [];
        $result = [];

        foreach ($encounters as $enc) {
            if (($enc['class']['code'] ?? '') === 'EMER') {
                $patientRef = $enc['subject']['reference'] ?? '';
                $patientId = str_replace('Patient/', '', $patientRef);
                $patient = $this->fhir->find('patients', $patientId);

                $pasienData = null;
                if ($patient) {
                    $nik = '';
                    $norm = '';
                    foreach ($patient['identifier'] ?? [] as $id) {
                        if (($id['system'] ?? '') === 'https://fhir.kemkes.go.id/id/nik') $nik = $id['value'] ?? '';
                        if (($id['system'] ?? '') === 'https://fhir.kemkes.go.id/id/norm') $norm = $id['value'] ?? '';
                    }
                    $jk = ($patient['gender'] ?? '') === 'male' ? 'L' : (($patient['gender'] ?? '') === 'female' ? 'P' : '');
                    $pasienData = [
                        'id' => $patient['id'] ?? $patientId,
                        'no_rm' => $norm ?: ($patient['id'] ?? $patientId),
                        'nik' => $nik,
                        'nama' => $patient['name'][0]['text'] ?? '',
                        'jenis_kelamin' => $jk,
                        'tgl_lahir' => $patient['birthDate'] ?? '',
                        'alamat' => $patient['address'][0]['line'][0] ?? '',
                        'no_telp' => $patient['telecom'][0]['value'] ?? ''
                    ];
                }

                $penjamin = '';
                $triageLevel = '';
                foreach ($enc['extension'] ?? [] as $ext) {
                    if (str_contains($ext['url'] ?? '', 'penjamin')) {
                        $penjamin = $ext['valueString'] ?? '';
                    }
                    if (str_contains($ext['url'] ?? '', 'triage')) {
                        $triageLevel = $ext['valueString'] ?? '';
                    }
                }

                $result[] = [
                    'id' => $enc['id'] ?? '',
                    'tgl_kunjungan' => $enc['period']['start'] ?? '',
                    'poli' => $enc['serviceType']['coding'][0]['display'] ?? '',
                    'keluhan' => $enc['reasonCode'][0]['text'] ?? '',
                    'pelayanan' => $enc['class']['display'] ?? '',
                    'penjamin' => $penjamin,
                    'status' => $enc['status'] ?? '',
                    'triage_level' => $triageLevel,
                    'pasien' => $pasienData
                ];
            }
        }

        usort($result, function ($a, $b) {
            $tA = $a['triage_level'] ?: 'Z';
            $tB = $b['triage_level'] ?: 'Z';
            return strcmp($tA, $tB);
        });

        return response()->json($result);
    }

    public function triage(Request $request, $id)
    {
        $request->validate(['triage_level' => 'required|in:P1,P2,P3,P4,P5']);
        $encounter = $this->fhir->find('encounters', $id);
        if (!$encounter) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $extensions = $encounter['extension'] ?? [];
        $triageIndex = -1;
        foreach ($extensions as $i => $ext) {
            if (str_contains($ext['url'] ?? '', 'triage')) {
                $triageIndex = $i;
                break;
            }
        }

        if ($triageIndex >= 0) {
            $extensions[$triageIndex]['valueString'] = $request->triage_level;
        } else {
            $extensions[] = [
                'url' => 'http://simrs-kel7.local/ext/triage',
                'valueString' => $request->triage_level
            ];
        }

        $encounter['extension'] = $extensions;
        $encounter['status'] = 'in-progress';
        
        $this->fhir->save('encounters', $id, $encounter);
        
        return response()->json($encounter);
    }

    public function selesai($id)
    {
        $encounter = $this->fhir->find('encounters', $id);
        if (!$encounter) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $encounter['status'] = 'finished';
        $this->fhir->save('encounters', $id, $encounter);
        
        return response()->json($encounter);
    }
}
