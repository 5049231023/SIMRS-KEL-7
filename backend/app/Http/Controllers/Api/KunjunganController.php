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

        $flatResult = [];
        foreach ($result as $enc) {
            $patient = $enc['patient_data'] ?? [];
            $patientId = str_replace('Patient/', '', $enc['subject']['reference'] ?? '');
            
            $pasienData = null;
            if ($patient) {
                $nik = '';
                $norm = '';
                foreach ($patient['identifier'] ?? [] as $id) {
                    if ($id['system'] === 'https://fhir.kemkes.go.id/id/nik') $nik = $id['value'];
                    if ($id['system'] === 'https://fhir.kemkes.go.id/id/norm') $norm = $id['value'];
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

            $triage = '';
            $statusAlur = $enc['_workflow']['status_alur'] ?? ($enc['status'] === 'finished' ? 'selesai' : 'menunggu_perawat');
            $tandaVital = $enc['_workflow']['tanda_vital'] ?? null;
            $pemeriksaanDokter = $enc['_workflow']['pemeriksaan_dokter'] ?? null;

            foreach ($enc['extension'] ?? [] as $ext) {
                if (str_contains($ext['url'] ?? '', 'penjamin')) {
                    $penjamin = $ext['valueString'] ?? '';
                }
                if (str_contains($ext['url'] ?? '', 'triage')) {
                    $triage = $ext['valueString'] ?? '';
                }
            }

            if ($tandaVital && empty($triage) && !empty($tandaVital['triage_level'])) {
                $triage = $tandaVital['triage_level'];
            }

            $alamat = $patient['address'][0]['text'] ?? $patient['address'][0]['line'][0] ?? '';

            if ($pasienData) {
                $pasienData['alamat'] = $alamat;
            }

            $flatResult[] = [
                'id' => $enc['id'] ?? '',
                'tgl_kunjungan' => $enc['period']['start'] ?? '',
                'poli' => $enc['serviceType']['coding'][0]['display'] ?? '',
                'keluhan' => $enc['reasonCode'][0]['text'] ?? '',
                'pelayanan' => $enc['class']['display'] ?? '',
                'penjamin' => $penjamin,
                'status' => $enc['status'] ?? '',
                'triage_level' => $triage,
                'status_alur' => $statusAlur,
                'tanda_vital' => $tandaVital,
                'pemeriksaan_dokter' => $pemeriksaanDokter,
                'pasien' => $pasienData
            ];
        }

        return response()->json($flatResult);
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

        $statusAlur = 'menunggu_perawat';

        $encounter = [
            'resourceType' => 'Encounter',
            'id' => $id,
            'status' => 'in-progress',
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
            ],
            '_workflow' => [
                'status_alur' => $statusAlur,
                'tanda_vital' => null,
                'pemeriksaan_dokter' => null
            ]
        ];

        $this->fhir->save('encounters', $id, $encounter);

        return response()->json($encounter, 201);
    }

    public function updateTtv(Request $request, $id)
    {
        $encounter = $this->fhir->find('encounters', $id);
        if (!$encounter) {
            return response()->json(['message' => 'Kunjungan tidak ditemukan'], 404);
        }

        $request->validate([
            'tekanan_darah' => 'nullable|string',
            'suhu' => 'nullable|string',
            'nadi' => 'nullable|string',
            'pernapasan' => 'nullable|string',
            'berat_badan' => 'nullable|string',
            'tinggi_badan' => 'nullable|string',
            'catatan_perawat' => 'nullable|string',
            'triage_level' => 'nullable|string',
        ]);

        $practitioner = $request->attributes->get('practitioner');
        $perawatNama = $practitioner ? ($practitioner['name'][0]['text'] ?? 'Perawat') : 'Perawat';

        $tandaVital = [
            'tekanan_darah' => $request->tekanan_darah ?? '-',
            'suhu' => $request->suhu ?? '-',
            'nadi' => $request->nadi ?? '-',
            'pernapasan' => $request->pernapasan ?? '-',
            'berat_badan' => $request->berat_badan ?? '-',
            'tinggi_badan' => $request->tinggi_badan ?? '-',
            'catatan_perawat' => $request->catatan_perawat ?? '',
            'triage_level' => $request->triage_level ?? '',
            'perawat_nama' => $perawatNama,
            'waktu_ttv' => date('Y-m-d H:i:s')
        ];

        if (!isset($encounter['_workflow'])) {
            $encounter['_workflow'] = [];
        }

        $encounter['_workflow']['tanda_vital'] = $tandaVital;
        $encounter['_workflow']['status_alur'] = 'siap_dokter';
        $encounter['status'] = 'in-progress';

        if ($request->filled('triage_level')) {
            $extensions = $encounter['extension'] ?? [];
            $found = false;
            foreach ($extensions as &$ext) {
                if (str_contains($ext['url'] ?? '', 'triage')) {
                    $ext['valueString'] = $request->triage_level;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $extensions[] = [
                    'url' => 'http://simrs-kel7.local/ext/triage',
                    'valueString' => $request->triage_level
                ];
            }
            $encounter['extension'] = $extensions;
        }

        $this->fhir->save('encounters', $id, $encounter);

        return response()->json([
            'message' => 'Tanda-tanda vital berhasil disimpan. Status dialihkan ke Dokter.',
            'encounter' => $encounter
        ]);
    }

    public function pemeriksaan(Request $request, $id)
    {
        $encounter = $this->fhir->find('encounters', $id);
        if (!$encounter) {
            return response()->json(['message' => 'Kunjungan tidak ditemukan'], 404);
        }

        $request->validate([
            'diagnosa_utama' => 'required|string',
            'diagnosa_sekunder' => 'nullable|string',
            'tindakan' => 'nullable|string',
            'catatan_dokter' => 'nullable|string',
            'resep_items' => 'nullable|array',
            'lab_pemeriksaan' => 'nullable|string',
            'biaya_tindakan' => 'nullable|numeric'
        ]);

        $practitioner = $request->attributes->get('practitioner');
        $dokterNama = $practitioner ? ($practitioner['name'][0]['text'] ?? 'Dokter') : 'Dokter';

        $pemeriksaanDokter = [
            'diagnosa_utama' => $request->diagnosa_utama,
            'diagnosa_sekunder' => $request->diagnosa_sekunder ?? '',
            'tindakan' => $request->tindakan ?? '',
            'catatan_dokter' => $request->catatan_dokter ?? '',
            'dokter_nama' => $dokterNama,
            'waktu_periksa' => date('Y-m-d H:i:s')
        ];

        if (!isset($encounter['_workflow'])) {
            $encounter['_workflow'] = [];
        }

        $encounter['_workflow']['pemeriksaan_dokter'] = $pemeriksaanDokter;
        $encounter['_workflow']['status_alur'] = 'selesai';
        $encounter['status'] = 'finished';

        $this->fhir->save('encounters', $id, $encounter);

        $patientId = str_replace('Patient/', '', $encounter['subject']['reference'] ?? '');
        $patient = $this->fhir->find('patients', $patientId);
        $patientNama = $patient['name'][0]['text'] ?? ($encounter['subject']['display'] ?? 'Pasien');

        $rxId = null;
        if (!empty($request->resep_items) && count($request->resep_items) > 0) {
            $rxId = 'rx-' . time() . '-' . rand(1000, 9999);
            $resepData = [
                'id' => $rxId,
                'encounter_id' => $id,
                'patient_id' => $patientId,
                'patient_nama' => $patientNama,
                'dokter' => $dokterNama,
                'items' => $request->resep_items,
                'status' => 'pending',
                'created_at' => date('Y-m-d'),
                'dispensed_at' => null
            ];
            $this->fhir->save('prescriptions', $rxId, $resepData);
        }

        $labId = null;
        if (!empty($request->lab_pemeriksaan)) {
            $labId = 'lab-' . time() . '-' . rand(1000, 9999);
            $labData = [
                'id' => $labId,
                'encounter_id' => $id,
                'patient_id' => $patientId,
                'patient_nama' => $patientNama,
                'jenis_pemeriksaan' => $request->lab_pemeriksaan,
                'catatan_dokter' => $request->catatan_dokter ?? 'Pemeriksaan rujukan dokter spesialis',
                'status' => 'ordered',
                'created_at' => date('Y-m-d'),
                'hasil' => null,
                'completed_at' => null
            ];
            $this->fhir->save('lab_orders', $labId, $labData);
        }

        $invId = 'inv-' . time() . '-' . rand(1000, 9999);
        $invoiceItems = [
            ['deskripsi' => 'Konsultasi & Pemeriksaan ' . ($encounter['serviceType']['coding'][0]['display'] ?? 'Dokter'), 'jumlah' => 125000]
        ];
        if (!empty($request->tindakan)) {
            $biayaTindakan = $request->biaya_tindakan ? (int)$request->biaya_tindakan : 75000;
            $invoiceItems[] = ['deskripsi' => 'Tindakan Medis: ' . $request->tindakan, 'jumlah' => $biayaTindakan];
        }
        if (!empty($request->resep_items)) {
            $invoiceItems[] = ['deskripsi' => 'Obat & Alkes Farmasi', 'jumlah' => count($request->resep_items) * 35000];
        }
        if (!empty($request->lab_pemeriksaan)) {
            $invoiceItems[] = ['deskripsi' => 'Pemeriksaan Lab: ' . $request->lab_pemeriksaan, 'jumlah' => 120000];
        }

        $totalInvoice = array_sum(array_column($invoiceItems, 'jumlah'));
        $invoiceData = [
            'id' => $invId,
            'encounter_id' => $id,
            'patient_id' => $patientId,
            'patient_nama' => $patientNama,
            'items' => $invoiceItems,
            'total' => $totalInvoice,
            'status' => 'unpaid',
            'metode_bayar' => null,
            'created_at' => date('Y-m-d'),
            'paid_at' => null
        ];
        $this->fhir->save('invoices', $invId, $invoiceData);

        return response()->json([
            'message' => 'Pemeriksaan selesai dicatat. Resep obat, order lab, dan tagihan kasir telah otomatis dibuat.',
            'encounter_id' => $id,
            'rx_id' => $rxId,
            'lab_id' => $labId,
            'inv_id' => $invId
        ]);
    }
}
