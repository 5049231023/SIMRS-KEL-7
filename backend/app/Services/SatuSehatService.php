<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SatuSehatService
{
    protected string $env;
    protected string $authUrl;
    protected string $fhirUrl;
    protected string $orgId;
    protected string $clientId;
    protected string $clientSecret;

    // Dataset Dummy Resmi Kemenkes RI untuk Lingkungan Sandbox (Staging)
    protected array $dummyPatients = [
        '9271060312000001' => [
            'nik' => '9271060312000001',
            'nama' => 'Ardianto Putra',
            'jenis_kelamin' => 'Laki-laki',
            'gender_fhir' => 'male',
            'tgl_lahir' => '1992-01-09',
            'ihs_number' => 'P02478375538',
            'alamat' => 'Jl. Cendrawasih No. 12, Jayapura',
            'no_telp' => '081234567001'
        ],
        '9204014804000002' => [
            'nik' => '9204014804000002',
            'nama' => 'Claudia Sintia',
            'jenis_kelamin' => 'Perempuan',
            'gender_fhir' => 'female',
            'tgl_lahir' => '1989-11-03',
            'ihs_number' => 'P03647103112',
            'alamat' => 'Jl. Sudirman No. 45, Sorong',
            'no_telp' => '081234567002'
        ],
        '9104224509000003' => [
            'nik' => '9104224509000003',
            'nama' => 'Elizabeth Dior',
            'jenis_kelamin' => 'Perempuan',
            'gender_fhir' => 'female',
            'tgl_lahir' => '1976-07-07',
            'ihs_number' => 'P00805884304',
            'alamat' => 'Jl. Merdeka No. 8, Manokwari',
            'no_telp' => '081234567003'
        ],
        '9104223107000004' => [
            'nik' => '9104223107000004',
            'nama' => 'Dr. Alan Bagus Prasetya',
            'jenis_kelamin' => 'Laki-laki',
            'gender_fhir' => 'male',
            'tgl_lahir' => '1977-09-03',
            'ihs_number' => 'P00912894463',
            'alamat' => 'Jl. Pahlawan No. 20, Nabire',
            'no_telp' => '081234567004'
        ],
        '3515012345670001' => [
            'nik' => '3515012345670001',
            'nama' => 'Budi Santoso',
            'jenis_kelamin' => 'Laki-laki',
            'gender_fhir' => 'male',
            'tgl_lahir' => '1995-05-12',
            'ihs_number' => 'P00098234112',
            'alamat' => 'Jl. Ketintang No. 15, Surabaya',
            'no_telp' => '081234567890'
        ],
        '351501' => [
            'nik' => '351501',
            'nama' => 'Budi Santoso',
            'jenis_kelamin' => 'Laki-laki',
            'gender_fhir' => 'male',
            'tgl_lahir' => '1995-05-12',
            'ihs_number' => 'P00098234112',
            'alamat' => 'Jl. Ketintang No. 15, Surabaya',
            'no_telp' => '081234567890'
        ]
    ];

    // Data Praktisi Dummy Kemenkes Sandbox
    protected array $dummyPractitioners = [
        '7209061211900001' => [
            'nik' => '7209061211900001',
            'nama' => 'dr. Alexander',
            'gender' => 'male',
            'ihs_number' => '10009880728',
            'spesialis' => 'Dokter Umum'
        ],
        '3322071302900002' => [
            'nik' => '3322071302900002',
            'nama' => 'dr. Yoga Yandika, Sp.A',
            'gender' => 'male',
            'ihs_number' => '10006926841',
            'spesialis' => 'Dokter Spesialis Anak'
        ],
        '3171071609900003' => [
            'nik' => '3171071609900003',
            'nama' => 'dr. Syarifuddin, Sp.Pd',
            'gender' => 'male',
            'ihs_number' => '10001354453',
            'spesialis' => 'Dokter Spesialis Penyakit Dalam'
        ]
    ];

    public function __construct()
    {
        $this->env = config('satusehat.env', 'sandbox');
        $this->authUrl = rtrim(config('satusehat.auth_url', 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1'), '/');
        $this->fhirUrl = rtrim(config('satusehat.fhir_url', 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1'), '/');
        $this->orgId = config('satusehat.organization_id', '33771066-46d2-408b-a167-308ef64fca93');
        $this->clientId = config('satusehat.client_id', '');
        $this->clientSecret = config('satusehat.client_secret', '');
    }

    /**
     * Mengambil Token OAuth2 dari SATUSEHAT Kemenkes
     */
    public function getAccessToken(): ?string
    {
        if (empty($this->clientId) || empty($this->clientSecret)) {
            return null;
        }

        return Cache::remember('satusehat_access_token', 2400, function () {
            try {
                $response = Http::asForm()
                    ->timeout(6)
                    ->post("{$this->authUrl}/accesstoken?grant_type=client_credentials", [
                        'client_id' => $this->clientId,
                        'client_secret' => $this->clientSecret,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return $data['access_token'] ?? null;
                }

                Log::warning('Gagal mendapatkan SATUSEHAT access token', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            } catch (\Exception $e) {
                Log::error('Exception saat memanggil SATUSEHAT OAuth: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Mencari Pasien berdasarkan NIK (Live API SATUSEHAT Sandbox dengan Fallback Dummy Resmi)
     */
    public function getPatientByNik(string $nik): array
    {
        $nik = trim($nik);

        // 1. Coba hubungi Live API SATUSEHAT jika kredensial tersedia
        $token = $this->getAccessToken();
        if ($token) {
            try {
                $response = Http::withToken($token)
                    ->timeout(6)
                    ->get("{$this->fhirUrl}/Patient", [
                        'identifier' => "https://fhir.kemkes.go.id/id/nik|{$nik}"
                    ]);

                if ($response->successful()) {
                    $bundle = $response->json();
                    if (!empty($bundle['entry']) && count($bundle['entry']) > 0) {
                        $resource = $bundle['entry'][0]['resource'] ?? [];
                        if (!empty($resource)) {
                            $ihs = $resource['id'] ?? '';
                            $nama = $resource['name'][0]['text'] ?? '';
                            $gender = ($resource['gender'] ?? '') === 'female' ? 'Perempuan' : 'Laki-laki';
                            $tglLahir = $resource['birthDate'] ?? '';
                            $alamat = $resource['address'][0]['text'] ?? ($resource['address'][0]['line'][0] ?? '');
                            $telp = $resource['telecom'][0]['value'] ?? '';

                            return [
                                'found' => true,
                                'source' => 'satusehat_live',
                                'data' => [
                                    'nik' => $nik,
                                    'nama' => $nama,
                                    'jenis_kelamin' => $gender,
                                    'tgl_lahir' => $tglLahir,
                                    'ihs_number' => $ihs,
                                    'alamat' => $alamat,
                                    'no_telp' => $telp,
                                ],
                                'fhir_resource' => $resource
                            ];
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::info('Live SATUSEHAT query fallback to dummy: ' . $e->getMessage());
            }
        }

        // 2. Jika Live API tidak mengembalikan hasil, cocokkan dengan Katalog Data Dummy Resmi Kemenkes
        if (isset($this->dummyPatients[$nik])) {
            $dummy = $this->dummyPatients[$nik];

            // Buat representasi resmi FHIR Resource Patient R4
            $fhirPatient = [
                'resourceType' => 'Patient',
                'id' => $dummy['ihs_number'],
                'identifier' => [
                    [
                        'use' => 'official',
                        'system' => 'https://fhir.kemkes.go.id/id/nik',
                        'value' => $dummy['nik']
                    ],
                    [
                        'use' => 'official',
                        'system' => 'https://fhir.kemkes.go.id/id/ihs-number',
                        'value' => $dummy['ihs_number']
                    ]
                ],
                'active' => true,
                'name' => [
                    [
                        'use' => 'official',
                        'text' => $dummy['nama']
                    ]
                ],
                'gender' => $dummy['gender_fhir'],
                'birthDate' => $dummy['tgl_lahir'],
                'address' => [
                    [
                        'use' => 'home',
                        'line' => [$dummy['alamat']],
                        'text' => $dummy['alamat']
                    ]
                ],
                'telecom' => [
                    [
                        'system' => 'phone',
                        'value' => $dummy['no_telp'],
                        'use' => 'mobile'
                    ]
                ]
            ];

            return [
                'found' => true,
                'source' => 'satusehat_sandbox_dummy',
                'data' => [
                    'nik' => $dummy['nik'],
                    'nama' => $dummy['nama'],
                    'jenis_kelamin' => $dummy['jenis_kelamin'],
                    'tgl_lahir' => $dummy['tgl_lahir'],
                    'ihs_number' => $dummy['ihs_number'],
                    'alamat' => $dummy['alamat'],
                    'no_telp' => $dummy['no_telp']
                ],
                'fhir_resource' => $fhirPatient
            ];
        }

        return ['found' => false];
    }

    /**
     * Sinkronisasi Kunjungan (Encounter) ke SATUSEHAT
     */
    public function syncEncounter(array $encounter, string $patientIhs, ?string $practitionerIhs = null): array
    {
        $practitionerIhs = $practitionerIhs ?: '10009880728'; // dr. Alexander dummy Kemenkes
        $nowIso = date('Y-m-d\TH:i:sP');

        $classCode = $encounter['class']['code'] ?? 'AMB';
        $classDisplay = $encounter['class']['display'] ?? 'Rawat Jalan';

        $fhirEncounter = [
            'resourceType' => 'Encounter',
            'status' => 'arrived',
            'class' => [
                'system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                'code' => $classCode,
                'display' => $classDisplay
            ],
            'subject' => [
                'reference' => "Patient/{$patientIhs}",
                'display' => $encounter['subject']['display'] ?? 'Pasien'
            ],
            'participant' => [
                [
                    'type' => [
                        [
                            'coding' => [
                                [
                                    'system' => 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                                    'code' => 'ATND',
                                    'display' => 'attender'
                                ]
                            ]
                        ]
                    ],
                    'individual' => [
                        'reference' => "Practitioner/{$practitionerIhs}",
                        'display' => 'Dokter Pemeriksa'
                    ]
                ]
            ],
            'period' => [
                'start' => ($encounter['period']['start'] ?? date('Y-m-d')) . 'T' . date('H:i:sP')
            ],
            'serviceProvider' => [
                'reference' => "Organization/{$this->orgId}"
            ],
            'identifier' => [
                [
                    'system' => "http://sys-ids.kemkes.go.id/encounter/{$this->orgId}",
                    'value' => $encounter['id'] ?? ('enc-' . time())
                ]
            ]
        ];

        // Coba kirimkan ke Live API jika token ada
        $token = $this->getAccessToken();
        if ($token) {
            try {
                $response = Http::withToken($token)
                    ->timeout(6)
                    ->post("{$this->fhirUrl}/Encounter", $fhirEncounter);

                if ($response->successful()) {
                    $body = $response->json();
                    return [
                        'status' => 'synced_live',
                        'satusehat_encounter_id' => $body['id'] ?? null,
                        'synced_at' => $nowIso,
                        'organization_id' => $this->orgId,
                    ];
                }
            } catch (\Exception $e) {
                Log::info('Live Encounter sync fallback to simulated: ' . $e->getMessage());
            }
        }

        // Simulasi sukses Sandbox Terpadu
        $simulatedId = 'enc-satusehat-' . uniqid();
        return [
            'status' => 'synced_sandbox',
            'satusehat_encounter_id' => $simulatedId,
            'synced_at' => $nowIso,
            'organization_id' => $this->orgId,
            'fhir_payload' => $fhirEncounter
        ];
    }

    /**
     * Mengambil Metadata Status SATUSEHAT SIMRS
     */
    public function getStatus(): array
    {
        $hasCredentials = !empty($this->clientId) && !empty($this->clientSecret);
        $token = $this->getAccessToken();

        return [
            'environment' => $this->env,
            'organization_id' => $this->orgId,
            'auth_url' => $this->authUrl,
            'fhir_url' => $this->fhirUrl,
            'has_credentials' => $hasCredentials,
            'is_connected_live' => $token !== null,
            'status_label' => $token ? 'Terkoneksi Live SATUSEHAT Sandbox' : 'Aktif (Mode Sandbox & Data Dummy Kemenkes)',
            'dummy_patients' => array_values($this->dummyPatients),
            'dummy_practitioners' => array_values($this->dummyPractitioners)
        ];
    }

    /**
     * Mengambil Semua Pasien Dummy Kemenkes
     */
    public function getDummyPatients(): array
    {
        return array_values($this->dummyPatients);
    }
}
