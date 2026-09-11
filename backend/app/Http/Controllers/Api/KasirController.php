<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use Illuminate\Http\Request;

class KasirController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function index(Request $request)
    {
        $status = $request->query('status');
        $invoices = $this->fhir->all('invoices') ?? [];

        if ($status) {
            $invoices = array_filter($invoices, function ($i) use ($status) {
                return ($i['status'] ?? '') === $status;
            });
        }

        usort($invoices, function ($a, $b) {
            $dateA = $a['created_at'] ?? '';
            $dateB = $b['created_at'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return response()->json(array_values($invoices));
    }

    public function store(Request $request)
    {
        $request->validate([
            'encounter_id' => 'required',
            'patient_id' => 'required',
            'patient_nama' => 'required',
            'items' => 'required|array',
            'items.*.deskripsi' => 'required',
            'items.*.jumlah' => 'required|numeric'
        ]);

        $total = 0;
        foreach ($request->items as $item) {
            $total += $item['jumlah'];
        }

        $id = 'inv-' . time() . '-' . rand(1000, 9999);
        $invoice = [
            'id' => $id,
            'encounter_id' => $request->encounter_id,
            'patient_id' => $request->patient_id,
            'patient_nama' => $request->patient_nama,
            'items' => $request->items,
            'total' => $total,
            'status' => 'unpaid',
            'metode_bayar' => null,
            'created_at' => date('Y-m-d'),
            'paid_at' => null
        ];

        $this->fhir->save('invoices', $id, $invoice);

        return response()->json($invoice, 201);
    }

    public function bayar(Request $request, $id)
    {
        $request->validate([
            'metode_bayar' => 'required|in:Tunai,BPJS Kesehatan,Asuransi'
        ]);

        $invoice = $this->fhir->find('invoices', $id);
        if (!$invoice) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $invoice['metode_bayar'] = $request->metode_bayar;
        $invoice['status'] = 'paid';
        $invoice['paid_at'] = date('Y-m-d');
        
        $this->fhir->save('invoices', $id, $invoice);

        return response()->json($invoice);
    }
}
