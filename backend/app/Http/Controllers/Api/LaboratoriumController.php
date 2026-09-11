<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use Illuminate\Http\Request;

class LaboratoriumController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function index(Request $request)
    {
        $status = $request->query('status');
        $labOrders = $this->fhir->all('lab_orders') ?? [];

        if ($status) {
            $labOrders = array_filter($labOrders, function ($l) use ($status) {
                return ($l['status'] ?? '') === $status;
            });
        }

        usort($labOrders, function ($a, $b) {
            $dateA = $a['created_at'] ?? '';
            $dateB = $b['created_at'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return response()->json(array_values($labOrders));
    }

    public function store(Request $request)
    {
        $request->validate([
            'encounter_id' => 'required',
            'patient_id' => 'required',
            'patient_nama' => 'required',
            'jenis_pemeriksaan' => 'required',
            'catatan_dokter' => 'required'
        ]);

        $id = 'lab-' . time() . '-' . rand(1000, 9999);
        $labOrder = [
            'id' => $id,
            'encounter_id' => $request->encounter_id,
            'patient_id' => $request->patient_id,
            'patient_nama' => $request->patient_nama,
            'jenis_pemeriksaan' => $request->jenis_pemeriksaan,
            'catatan_dokter' => $request->catatan_dokter,
            'status' => 'ordered',
            'created_at' => date('Y-m-d'),
            'hasil' => null,
            'completed_at' => null
        ];

        $this->fhir->save('lab_orders', $id, $labOrder);

        return response()->json($labOrder, 201);
    }

    public function hasil(Request $request, $id)
    {
        $request->validate(['hasil' => 'required']);
        $labOrder = $this->fhir->find('lab_orders', $id);
        if (!$labOrder) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $labOrder['hasil'] = $request->hasil;
        $labOrder['status'] = 'completed';
        $labOrder['completed_at'] = date('Y-m-d');
        
        $this->fhir->save('lab_orders', $id, $labOrder);

        return response()->json($labOrder);
    }
}
