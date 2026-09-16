<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FhirRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminUserController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function index(Request $request)
    {
        $practitioners = $this->fhir->all('practitioners') ?? [];
        $result = [];

        foreach ($practitioners as $p) {
            $unit = $p['qualification'][0]['code']['coding'][0]['display'] ?? 'Admin';
            $code = strtolower($p['qualification'][0]['code']['coding'][0]['code'] ?? 'admin');
            $role = $p['_auth']['role'] ?? 'admin';

            $result[] = [
                'id' => $p['id'],
                'nip' => $p['identifier'][0]['value'] ?? '',
                'nama' => $p['name'][0]['text'] ?? '',
                'unit' => $unit,
                'role' => $role,
                'active' => $p['active'] ?? true,
                'birthDate' => $p['birthDate'] ?? '',
            ];
        }

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'unit' => 'required|string',
            'role' => 'required|string',
            'password' => 'required|string',
            'tgl_lahir' => 'nullable|string',
        ]);

        $practitioners = $this->fhir->all('practitioners') ?? [];
        
        // Generate next NIP if not provided
        if ($request->filled('nip')) {
            $nip = (string)$request->nip;
        } else {
            $maxNip = 100;
            foreach ($practitioners as $p) {
                $val = (int)($p['identifier'][0]['value'] ?? 0);
                if ($val > $maxNip) $maxNip = $val;
            }
            $nip = (string)($maxNip + 1);
        }

        $id = "pract-{$nip}";
        $unit_slug = Str::slug($request->unit);

        $practitioner = [
            'resourceType' => 'Practitioner',
            'id' => $id,
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/nip', 'value' => $nip]
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => $request->nama]
            ],
            'birthDate' => $request->tgl_lahir ?? '1990-01-01',
            'qualification' => [
                [
                    'code' => [
                        'coding' => [
                            ['system' => 'http://simrs-kel7.local/unit', 'code' => $unit_slug, 'display' => $request->unit]
                        ]
                    ]
                ]
            ],
            '_auth' => [
                'password_hash' => bcrypt($request->password),
                'api_token' => null,
                'role' => $request->role
            ]
        ];

        $this->fhir->save('practitioners', $id, $practitioner);

        return response()->json([
            'message' => 'Akun staf berhasil dibuat',
            'user' => [
                'id' => $id,
                'nip' => $nip,
                'nama' => $request->nama,
                'unit' => $request->unit,
                'role' => $request->role,
                'active' => true
            ]
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $practitioner = $this->fhir->find('practitioners', $id);
        if (!$practitioner) {
            return response()->json(['message' => 'Akun tidak ditemukan'], 404);
        }

        $request->validate([
            'nama' => 'sometimes|required|string',
            'unit' => 'sometimes|required|string',
            'role' => 'sometimes|required|string',
            'active' => 'sometimes|boolean',
            'password' => 'nullable|string',
            'tgl_lahir' => 'nullable|string',
        ]);

        if ($request->filled('nama')) {
            $practitioner['name'][0]['text'] = $request->nama;
        }

        if ($request->filled('unit')) {
            $unit_slug = Str::slug($request->unit);
            $practitioner['qualification'][0]['code']['coding'][0]['display'] = $request->unit;
            $practitioner['qualification'][0]['code']['coding'][0]['code'] = $unit_slug;
        }

        if ($request->filled('role')) {
            $practitioner['_auth']['role'] = $request->role;
        }

        if ($request->has('active')) {
            $practitioner['active'] = (bool)$request->active;
        }

        if ($request->filled('tgl_lahir')) {
            $practitioner['birthDate'] = $request->tgl_lahir;
        }

        if ($request->filled('password')) {
            $practitioner['_auth']['password_hash'] = bcrypt($request->password);
        }

        $this->fhir->save('practitioners', $id, $practitioner);

        return response()->json([
            'message' => 'Profil staf berhasil diperbarui',
            'user' => [
                'id' => $practitioner['id'],
                'nip' => $practitioner['identifier'][0]['value'] ?? '',
                'nama' => $practitioner['name'][0]['text'] ?? '',
                'unit' => $practitioner['qualification'][0]['code']['coding'][0]['display'] ?? '',
                'role' => $practitioner['_auth']['role'] ?? '',
                'active' => $practitioner['active'] ?? true,
                'birthDate' => $practitioner['birthDate'] ?? ''
            ]
        ]);
    }

    public function destroy($id)
    {
        $practitioner = $this->fhir->find('practitioners', $id);
        if (!$practitioner) {
            return response()->json(['message' => 'Akun tidak ditemukan'], 404);
        }

        // Toggle status aktif
        $practitioner['active'] = !($practitioner['active'] ?? true);
        $this->fhir->save('practitioners', $id, $practitioner);

        return response()->json([
            'message' => 'Status aktif akun berhasil diubah',
            'active' => $practitioner['active']
        ]);
    }
}