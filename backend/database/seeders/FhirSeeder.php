<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\FhirRepository;

class FhirSeeder extends Seeder
{
    public function run(FhirRepository $fhir): void
    {
        $practitioner = [
            'resourceType' => 'Practitioner',
            'id' => 'pract-101',
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/nip', 'value' => '101']
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => 'Admin Rekam Medis']
            ],
            'qualification' => [
                [
                    'code' => [
                        'coding' => [
                            ['system' => 'http://simrs-kel7.local/unit', 'code' => 'rekam-medis', 'display' => 'Rekam Medis']
                        ]
                    ]
                ]
            ],
            '_auth' => [
                'password_hash' => bcrypt('123'),
                'api_token' => null
            ]
        ];
        $fhir->save('practitioners', 'pract-101', $practitioner);

        $patient = [
            'resourceType' => 'Patient',
            'id' => 'RM-2025-5541',
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2025-5541'],
                ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '351501'],
                ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00098234112']
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => 'Budi Santoso']
            ],
            'gender' => 'male',
            'birthDate' => '1995-05-12',
            'telecom' => [
                ['system' => 'phone', 'value' => '081234567890', 'use' => 'mobile']
            ],
            'address' => [
                ['use' => 'home', 'text' => 'Jl. Ketintang No. 15, Surabaya']
            ]
        ];
        $fhir->save('patients', 'RM-2025-5541', $patient);

        $encounter = [
            'resourceType' => 'Encounter',
            'id' => 'enc-20260609-001',
            'status' => 'finished',
            'class' => [
                'system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                'code' => 'AMB',
                'display' => 'Rawat Jalan'
            ],
            'subject' => [
                'reference' => 'Patient/RM-2025-5541',
                'display' => 'Budi Santoso'
            ],
            'period' => [
                'start' => '2026-06-09'
            ],
            'serviceType' => [
                'coding' => [
                    [
                        'system' => 'http://simrs-kel7.local/poli',
                        'code' => 'poli-umum',
                        'display' => 'Poli Umum'
                    ]
                ]
            ],
            'reasonCode' => [
                ['text' => 'Demam tinggi dan sakit kepala.']
            ],
            'extension' => [
                [
                    'url' => 'http://simrs-kel7.local/ext/penjamin',
                    'valueString' => 'BPJS Kesehatan'
                ]
            ]
        ];
        $fhir->save('encounters', 'enc-20260609-001', $encounter);
    }
}
