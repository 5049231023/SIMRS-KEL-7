<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FhirRepository;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function login(Request $request)
    {
        $request->validate([
            'nip' => 'required',
            'password' => 'required',
        ]);

        $nip = $request->nip;
        $password = $request->password;

        $practitioner = $this->fhir->findBy('practitioners', 'identifier.0.value', $nip);

        if (!$practitioner || !password_verify($password, $practitioner['_auth']['password_hash'])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = bin2hex(random_bytes(32));
        $practitioner['_auth']['api_token'] = $token;
        
        $this->fhir->save('practitioners', $practitioner['id'], $practitioner);

        return response()->json([
            'token' => $token,
            'practitioner' => [
                'id' => $practitioner['id'],
                'nip' => $practitioner['identifier'][0]['value'] ?? null,
                'nama' => $practitioner['name'][0]['text'] ?? null,
                'unit' => $practitioner['qualification'][0]['code']['coding'][0]['display'] ?? null,
                'active' => $practitioner['active'] ?? true,
            ]
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nama' => 'required',
            'unit' => 'required',
            'tgl_lahir' => 'required',
            'password' => 'required',
        ]);

        $practitioners = $this->fhir->all('practitioners');
        $nip = count($practitioners) + 101;
        $unit_slug = Str::slug($request->unit);

        $id = "pract-{$nip}";

        $practitioner = [
            'resourceType' => 'Practitioner',
            'id' => $id,
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/nip', 'value' => (string) $nip]
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => $request->nama]
            ],
            'birthDate' => $request->tgl_lahir,
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
                'api_token' => null
            ]
        ];

        $this->fhir->save('practitioners', $id, $practitioner);

        return response()->json([
            'message' => 'Registered successfully',
            'nip' => $nip
        ]);
    }

    public function logout(Request $request)
    {
        $practitioner = $request->attributes->get('practitioner');
        
        if ($practitioner) {
            $practitioner['_auth']['api_token'] = null;
            $this->fhir->save('practitioners', $practitioner['id'], $practitioner);
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $practitioner = $request->attributes->get('practitioner');
        
        if (!$practitioner) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'id' => $practitioner['id'],
            'nip' => $practitioner['identifier'][0]['value'] ?? null,
            'nama' => $practitioner['name'][0]['text'] ?? null,
            'unit' => $practitioner['qualification'][0]['code']['coding'][0]['display'] ?? null,
            'active' => $practitioner['active'] ?? true,
        ]);
    }
}
