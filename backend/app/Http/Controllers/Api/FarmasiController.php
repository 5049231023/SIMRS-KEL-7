<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use Illuminate\Http\Request;

class FarmasiController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function index(Request $request)
    {
        $status = $request->query('status');
        $prescriptions = $this->fhir->all('prescriptions') ?? [];

        if ($status) {
            $prescriptions = array_filter($prescriptions, function ($p) use ($status) {
                return ($p['status'] ?? '') === $status;
            });
        }

        usort($prescriptions, function ($a, $b) {
            $dateA = $a['created_at'] ?? '';
            $dateB = $b['created_at'] ?? '';
            return strcmp($dateB, $dateA); // desc
        });

        return response()->json(array_values($prescriptions));
    }

    public function store(Request $request)
    {
        $request->validate([
            'encounter_id' => 'required',
            'patient_id' => 'required',
            'patient_nama' => 'required',
            'dokter' => 'required',
            'items' => 'required|array',
            'items.*.nama_obat' => 'required',
            'items.*.jumlah' => 'required',
            'items.*.aturan' => 'required'
        ]);

        $id = 'rx-' . time() . '-' . rand(1000, 9999);
        $prescription = [
            'id' => $id,
            'encounter_id' => $request->encounter_id,
            'patient_id' => $request->patient_id,
            'patient_nama' => $request->patient_nama,
            'dokter' => $request->dokter,
            'items' => $request->items,
            'status' => 'pending',
            'created_at' => date('Y-m-d'),
            'dispensed_at' => null
        ];

        $this->fhir->save('prescriptions', $id, $prescription);

        return response()->json($prescription, 201);
    }

    public function dispense($id)
    {
        $prescription = $this->fhir->find('prescriptions', $id);
        if (!$prescription) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $prescription['status'] = 'dispensed';
        $prescription['dispensed_at'] = date('Y-m-d');
        
        $this->fhir->save('prescriptions', $id, $prescription);

        return response()->json($prescription);
    }
}
