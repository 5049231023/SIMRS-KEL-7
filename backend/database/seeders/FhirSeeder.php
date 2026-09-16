<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\FhirRepository;

class FhirSeeder extends Seeder
{
    public function run(FhirRepository $fhir): void
    {
        // ==========================================
        // 1. PRACTITIONERS (PETUGAS / NAKES)
        // ==========================================
        $practitioners = [
            'pract-101' => [
                'resourceType' => 'Practitioner',
                'id' => 'pract-101',
                'identifier' => [['system' => 'http://simrs-kel7.local/nip', 'value' => '101']],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Budi Handoko, S.Kom (Admin SIMRS)']],
                'qualification' => [['code' => ['coding' => [['system' => 'http://simrs-kel7.local/unit', 'code' => 'admin', 'display' => 'Admin Rekam Medis']]]]],
                '_auth' => ['password_hash' => bcrypt('123'), 'api_token' => null, 'role' => 'admin']
            ],
            'pract-102' => [
                'resourceType' => 'Practitioner',
                'id' => 'pract-102',
                'identifier' => [['system' => 'http://simrs-kel7.local/nip', 'value' => '102']],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Siti Rahma, S.Farm, Apt (Apoteker)']],
                'qualification' => [['code' => ['coding' => [['system' => 'http://simrs-kel7.local/unit', 'code' => 'farmasi', 'display' => 'Instalasi Farmasi']]]]],
                '_auth' => ['password_hash' => bcrypt('123'), 'api_token' => null, 'role' => 'farmasi']
            ],
            'pract-103' => [
                'resourceType' => 'Practitioner',
                'id' => 'pract-103',
                'identifier' => [['system' => 'http://simrs-kel7.local/nip', 'value' => '103']],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'dr. Ahmad Santoso, Sp.PD']],
                'qualification' => [['code' => ['coding' => [['system' => 'http://simrs-kel7.local/unit', 'code' => 'dokter', 'display' => 'Dokter Spesialis']]]]],
                '_auth' => ['password_hash' => bcrypt('123'), 'api_token' => null, 'role' => 'dokter']
            ],
            'pract-104' => [
                'resourceType' => 'Practitioner',
                'id' => 'pract-104',
                'identifier' => [['system' => 'http://simrs-kel7.local/nip', 'value' => '104']],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Ns. Dewi Lestari, S.Kep']],
                'qualification' => [['code' => ['coding' => [['system' => 'http://simrs-kel7.local/unit', 'code' => 'perawat', 'display' => 'Perawat Rawat Jalan & IGD']]]]],
                '_auth' => ['password_hash' => bcrypt('123'), 'api_token' => null, 'role' => 'perawat']
            ],
            'pract-105' => [
                'resourceType' => 'Practitioner',
                'id' => 'pract-105',
                'identifier' => [['system' => 'http://simrs-kel7.local/nip', 'value' => '105']],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Rina Melati, A.Md.AK (Analis Lab)']],
                'qualification' => [['code' => ['coding' => [['system' => 'http://simrs-kel7.local/unit', 'code' => 'lab', 'display' => 'Laboratorium']]]]],
                '_auth' => ['password_hash' => bcrypt('123'), 'api_token' => null, 'role' => 'lab']
            ],
            'pract-106' => [
                'resourceType' => 'Practitioner',
                'id' => 'pract-106',
                'identifier' => [['system' => 'http://simrs-kel7.local/nip', 'value' => '106']],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Maya Anggraeni, S.E (Kasir & Billing)']],
                'qualification' => [['code' => ['coding' => [['system' => 'http://simrs-kel7.local/unit', 'code' => 'kasir', 'display' => 'Kasir']]]]],
                '_auth' => ['password_hash' => bcrypt('123'), 'api_token' => null, 'role' => 'kasir']
            ]
        ];

        foreach ($practitioners as $pId => $data) {
            $fhir->save('practitioners', $pId, $data);
        }

        // ==========================================
        // 2. PATIENTS (LENGKAP DENGAN DUMMY SATUSEHAT KEMENKES)
        // ==========================================
        $patients = [
            'RM-2026-0001' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-0001',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-0001'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '9271060312000001'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P02478375538']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Ardianto Putra']],
                'gender' => 'male',
                'birthDate' => '1992-01-09',
                'telecom' => [['system' => 'phone', 'value' => '081234567001', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Cendrawasih No. 12, Jayapura']]
            ],
            'RM-2026-0002' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-0002',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-0002'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '9204014804000002'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P03647103112']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Claudia Sintia']],
                'gender' => 'female',
                'birthDate' => '1989-11-03',
                'telecom' => [['system' => 'phone', 'value' => '081234567002', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Sudirman No. 45, Sorong']]
            ],
            'RM-2026-0003' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-0003',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-0003'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '9104224509000003'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00805884304']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Elizabeth Dior']],
                'gender' => 'female',
                'birthDate' => '1976-07-07',
                'telecom' => [['system' => 'phone', 'value' => '081234567003', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Merdeka No. 8, Manokwari']]
            ],
            'RM-2026-0004' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-0004',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-0004'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '9104223107000004'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00912894463']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Dr. Alan Bagus Prasetya']],
                'gender' => 'male',
                'birthDate' => '1977-09-03',
                'telecom' => [['system' => 'phone', 'value' => '081234567004', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Pahlawan No. 20, Nabire']]
            ],
            'RM-2025-5541' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2025-5541',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2025-5541'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3515012345670001'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00098234112']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Budi Santoso']],
                'gender' => 'male',
                'birthDate' => '1995-05-12',
                'telecom' => [['system' => 'phone', 'value' => '081234567890', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Ketintang No. 15, Surabaya']]
            ],
            'RM-2026-1002' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-1002',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1002'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3515021234560001'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00088712398']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Siti Aminah']],
                'gender' => 'female',
                'birthDate' => '1992-08-20',
                'telecom' => [['system' => 'phone', 'value' => '082198765432', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Manyar Kertoarjo No. 45, Surabaya']]
            ],
            'RM-2026-1003' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-1003',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1003'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3515031234560002'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00077654321']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Hendra Gunawan']],
                'gender' => 'male',
                'birthDate' => '1980-03-14',
                'telecom' => [['system' => 'phone', 'value' => '085712344321', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Darmo Permai II No. 8, Surabaya']]
            ],
            'RM-2026-1004' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-1004',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1004'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3174021208940002'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00066543210']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Ahmad Fauzi']],
                'gender' => 'male',
                'birthDate' => '1994-08-12',
                'telecom' => [['system' => 'phone', 'value' => '081344556677', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Tebet Barat Dalam No. 18, Jakarta Selatan']]
            ],
            'RM-2026-1005' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-1005',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1005'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3273014405900005'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00055432109']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Dewi Anggraini']],
                'gender' => 'female',
                'birthDate' => '1990-05-14',
                'telecom' => [['system' => 'phone', 'value' => '087811223344', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Dago No. 112, Bandung']]
            ],
            'RM-2026-1006' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-1006',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1006'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3578011203750008'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00044321098']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Bambang Susilo']],
                'gender' => 'male',
                'birthDate' => '1975-03-12',
                'telecom' => [['system' => 'phone', 'value' => '081122334455', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Raya Gubeng No. 64, Surabaya']]
            ],
            'RM-2026-1007' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-1007',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1007'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '5171036009980009'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00033210987']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Nurul Fadillah']],
                'gender' => 'female',
                'birthDate' => '1998-09-20',
                'telecom' => [['system' => 'phone', 'value' => '085678901234', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Sunset Road No. 88, Denpasar']]
            ],
            'RM-2026-1008' => [
                'resourceType' => 'Patient',
                'id' => 'RM-2026-1008',
                'identifier' => [
                    ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1008'],
                    ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3174051008950006'],
                    ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00022109876']
                ],
                'active' => true,
                'name' => [['use' => 'official', 'text' => 'Rian Pratama']],
                'gender' => 'male',
                'birthDate' => '1995-08-10',
                'telecom' => [['system' => 'phone', 'value' => '089912345678', 'use' => 'mobile']],
                'address' => [['use' => 'home', 'text' => 'Jl. Kemang Raya No. 30, Jakarta Selatan']]
            ]
        ];

        foreach ($patients as $pId => $data) {
            $fhir->save('patients', $pId, $data);
        }

        // ==========================================
        // 3. ENCOUNTERS (KUNJUNGAN TERPADU & SATUSEHAT SYNC)
        // ==========================================
        $today = date('Y-m-d');

        $encounters = [
            // 1. Ardianto Putra - Selesai Diperiksa
            'enc-20260916-001' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260916-001',
                'status' => 'finished',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'AMB', 'display' => 'Rawat Jalan'],
                'subject' => ['reference' => 'Patient/RM-2026-0001', 'display' => 'Ardianto Putra'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'poli-umum', 'display' => 'Poli Umum']]],
                'reasonCode' => [['text' => 'Demam tinggi 38.8 C, sakit kepala dan nyeri persendian sejak 2 hari']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'BPJS Kesehatan'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P3']
                ],
                '_workflow' => [
                    'status_alur' => 'selesai',
                    'tanda_vital' => [
                        'tekanan_darah' => '120/80 mmHg', 'suhu' => '38.8 °C', 'nadi' => '86 x/mnt', 'pernapasan' => '20 x/mnt',
                        'berat_badan' => '65 kg', 'tinggi_badan' => '172 cm', 'triage_level' => 'P3',
                        'catatan_perawat' => 'Pasien tampak lemah, akral hangat, demam mendadak tinggi',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => "{$today} 08:30:00"
                    ],
                    'pemeriksaan_dokter' => [
                        'diagnosa_utama' => 'Febris Akut Suspect Dengue Fever (A90)',
                        'diagnosa_sekunder' => 'Cephalgia Tension Type (G44.2)',
                        'tindakan' => 'Pemberian antipiretik, edukasi hidrasi oral 2.5 liter/hari & cek lab darah lengkap',
                        'catatan_dokter' => 'Pantau tanda bahaya (perdarahan gusi, nyeri perut hebat, muntah persisten)',
                        'dokter_nama' => 'dr. Ahmad Santoso, Sp.PD', 'waktu_periksa' => "{$today} 09:15:00"
                    ],
                    'satusehat_sync' => [
                        'status' => 'synced_sandbox',
                        'satusehat_encounter_id' => 'enc-satusehat-ard-001',
                        'synced_at' => "{$today}T08:30:00+07:00",
                        'organization_id' => '33771066-46d2-408b-a167-308ef64fca93'
                    ],
                    'satusehat_observation' => ['satusehat_observation_id' => 'obs-ttv-ard-001', 'status' => 'synced_sandbox'],
                    'satusehat_condition' => ['satusehat_condition_id' => 'cond-diag-ard-001', 'status' => 'synced_sandbox']
                ]
            ],

            // 2. Claudia Sintia - Selesai Diperiksa
            'enc-20260916-002' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260916-002',
                'status' => 'finished',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'AMB', 'display' => 'Rawat Jalan'],
                'subject' => ['reference' => 'Patient/RM-2026-0002', 'display' => 'Claudia Sintia'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'poli-penyakit-dalam', 'display' => 'Poli Penyakit Dalam']]],
                'reasonCode' => [['text' => 'Nyeri ulu hati perih melilit, kembung dan mual hebat pasca konsumsi makanan asam']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'Umum'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P3']
                ],
                '_workflow' => [
                    'status_alur' => 'selesai',
                    'tanda_vital' => [
                        'tekanan_darah' => '110/70 mmHg', 'suhu' => '36.6 °C', 'nadi' => '78 x/mnt', 'pernapasan' => '18 x/mnt',
                        'berat_badan' => '52 kg', 'tinggi_badan' => '160 cm', 'triage_level' => 'P3',
                        'catatan_perawat' => 'Nyeri tekan epigastrium (+), skala nyeri 5/10',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => "{$today} 08:45:00"
                    ],
                    'pemeriksaan_dokter' => [
                        'diagnosa_utama' => 'Gastritis Akut Erosif (K29.1)',
                        'diagnosa_sekunder' => 'Dispepsia Fungsional (K30)',
                        'tindakan' => 'Pemberian injeksi Omeprazole IV, edukasi pola makan teratur',
                        'catatan_dokter' => 'Hindari kopi, makanan pedas, dan obat pereda nyeri NSAID',
                        'dokter_nama' => 'dr. Ahmad Santoso, Sp.PD', 'waktu_periksa' => "{$today} 09:30:00"
                    ],
                    'satusehat_sync' => [
                        'status' => 'synced_sandbox',
                        'satusehat_encounter_id' => 'enc-satusehat-cla-002',
                        'synced_at' => "{$today}T08:45:00+07:00",
                        'organization_id' => '33771066-46d2-408b-a167-308ef64fca93'
                    ]
                ]
            ],

            // 3. Elizabeth Dior - Siap Diperiksa Dokter Gigi
            'enc-20260916-003' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260916-003',
                'status' => 'in-progress',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'AMB', 'display' => 'Rawat Jalan'],
                'subject' => ['reference' => 'Patient/RM-2026-0003', 'display' => 'Elizabeth Dior'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'poli-gigi', 'display' => 'Poli Gigi']]],
                'reasonCode' => [['text' => 'Gigi geraham kanan bawah berlubang besar, nyeri spontan berdenyut menjalar ke pipi']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'BPJS Kesehatan'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P4']
                ],
                '_workflow' => [
                    'status_alur' => 'siap_dokter',
                    'tanda_vital' => [
                        'tekanan_darah' => '130/85 mmHg', 'suhu' => '36.8 °C', 'nadi' => '80 x/mnt', 'pernapasan' => '18 x/mnt',
                        'berat_badan' => '58 kg', 'tinggi_badan' => '158 cm', 'triage_level' => 'P4',
                        'catatan_perawat' => 'Nyeri tekan lokal gigi 46, riwayat sakit gigi berulang',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => "{$today} 09:00:00"
                    ],
                    'pemeriksaan_dokter' => null,
                    'satusehat_sync' => [
                        'status' => 'synced_sandbox',
                        'satusehat_encounter_id' => 'enc-satusehat-eli-003',
                        'synced_at' => "{$today}T09:00:00+07:00",
                        'organization_id' => '33771066-46d2-408b-a167-308ef64fca93'
                    ]
                ]
            ],

            // 4. Dr. Alan Bagus Prasetya - Selesai Kontrol Bedah
            'enc-20260916-004' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260916-004',
                'status' => 'finished',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'AMB', 'display' => 'Rawat Jalan'],
                'subject' => ['reference' => 'Patient/RM-2026-0004', 'display' => 'Dr. Alan Bagus Prasetya'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'poli-bedah', 'display' => 'Poli Bedah']]],
                'reasonCode' => [['text' => 'Kontrol rutin luka operasi eksisi lipoma regio punggung hari ke-7']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'Asuransi Lain'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P4']
                ],
                '_workflow' => [
                    'status_alur' => 'selesai',
                    'tanda_vital' => [
                        'tekanan_darah' => '125/80 mmHg', 'suhu' => '36.5 °C', 'nadi' => '74 x/mnt', 'pernapasan' => '16 x/mnt',
                        'berat_badan' => '75 kg', 'tinggi_badan' => '175 cm', 'triage_level' => 'P4',
                        'catatan_perawat' => 'Luka operasi bersih, tidak ada tanda pus/infeksi',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => "{$today} 09:20:00"
                    ],
                    'pemeriksaan_dokter' => [
                        'diagnosa_utama' => 'Post-operative follow-up examination (Z48.8)',
                        'diagnosa_sekunder' => 'Lipoma trunk (D17.1)',
                        'tindakan' => 'Pengangkatan jahitan (aff hecting 5 simpul) & penggantian balutan kasa steril',
                        'catatan_dokter' => 'Luka mengering sempurna (per primam intentionem). Pasien diperbolehkan mandi normal.',
                        'dokter_nama' => 'dr. Ahmad Santoso, Sp.PD', 'waktu_periksa' => "{$today} 10:00:00"
                    ],
                    'satusehat_sync' => [
                        'status' => 'synced_sandbox',
                        'satusehat_encounter_id' => 'enc-satusehat-aln-004',
                        'synced_at' => "{$today}T09:20:00+07:00",
                        'organization_id' => '33771066-46d2-408b-a167-308ef64fca93'
                    ]
                ]
            ],

            // 5. Budi Santoso - Rekam Medis Historis
            'enc-20260609-001' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260609-001',
                'status' => 'finished',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'AMB', 'display' => 'Rawat Jalan'],
                'subject' => ['reference' => 'Patient/RM-2025-5541', 'display' => 'Budi Santoso'],
                'period' => ['start' => '2026-06-09'],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'poli-umum', 'display' => 'Poli Umum']]],
                'reasonCode' => [['text' => 'Demam tinggi berulang dan batuk berdahak 4 hari']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'BPJS Kesehatan'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P3']
                ],
                '_workflow' => [
                    'status_alur' => 'selesai',
                    'tanda_vital' => [
                        'tekanan_darah' => '120/80 mmHg', 'suhu' => '38.2 °C', 'nadi' => '84 x/mnt', 'pernapasan' => '20 x/mnt',
                        'berat_badan' => '65 kg', 'tinggi_badan' => '170 cm', 'triage_level' => 'P3',
                        'catatan_perawat' => 'Pasien batuk produktif, dahak kental kekuningan',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => '2026-06-09 09:00:00'
                    ],
                    'pemeriksaan_dokter' => [
                        'diagnosa_utama' => 'Infeksi Saluran Pernapasan Akut / ISPA (J06.9)',
                        'diagnosa_sekunder' => 'Acute Pharyngitis (J02.9)',
                        'tindakan' => 'Pemberian antibiotik oral dan antitusif ekspektoran',
                        'catatan_dokter' => 'Banyak minum air hangat, istirahat cukup',
                        'dokter_nama' => 'dr. Ahmad Santoso, Sp.PD', 'waktu_periksa' => '2026-06-09 09:30:00'
                    ],
                    'satusehat_sync' => [
                        'status' => 'synced_sandbox',
                        'satusehat_encounter_id' => 'enc-satusehat-budi-001',
                        'synced_at' => '2026-06-09T09:00:00+07:00',
                        'organization_id' => '33771066-46d2-408b-a167-308ef64fca93'
                    ]
                ]
            ],

            // 6. Siti Aminah - Menunggu Perawat
            'enc-20260916-005' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260916-005',
                'status' => 'in-progress',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'AMB', 'display' => 'Rawat Jalan'],
                'subject' => ['reference' => 'Patient/RM-2026-1002', 'display' => 'Siti Aminah'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'poli-penyakit-dalam', 'display' => 'Poli Penyakit Dalam']]],
                'reasonCode' => [['text' => 'Demam menggigil naik turun sejak 3 hari, nafsu makan turun drastis']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'BPJS Kesehatan']
                ],
                '_workflow' => [
                    'status_alur' => 'menunggu_perawat',
                    'tanda_vital' => null,
                    'pemeriksaan_dokter' => null,
                    'satusehat_sync' => [
                        'status' => 'synced_sandbox',
                        'satusehat_encounter_id' => 'enc-satusehat-sit-005',
                        'synced_at' => "{$today}T09:10:00+07:00",
                        'organization_id' => '33771066-46d2-408b-a167-308ef64fca93'
                    ]
                ]
            ],

            // 7. Hendra Gunawan - Siap Dokter
            'enc-20260916-006' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260916-006',
                'status' => 'in-progress',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'AMB', 'display' => 'Rawat Jalan'],
                'subject' => ['reference' => 'Patient/RM-2026-1003', 'display' => 'Hendra Gunawan'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'poli-penyakit-dalam', 'display' => 'Poli Penyakit Dalam']]],
                'reasonCode' => [['text' => 'Pusing berputar, tengkuk terasa berat kaku dan sering haus di malam hari']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'Umum'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P3']
                ],
                '_workflow' => [
                    'status_alur' => 'siap_dokter',
                    'tanda_vital' => [
                        'tekanan_darah' => '150/95 mmHg', 'suhu' => '36.7 °C', 'nadi' => '88 x/mnt', 'pernapasan' => '19 x/mnt',
                        'berat_badan' => '74 kg', 'tinggi_badan' => '168 cm', 'triage_level' => 'P3',
                        'catatan_perawat' => 'Pasien riwayat hipertensi, lupa konsumsi obat antihipertensi 1 minggu terakhir',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => "{$today} 09:25:00"
                    ],
                    'pemeriksaan_dokter' => null,
                    'satusehat_sync' => [
                        'status' => 'synced_sandbox',
                        'satusehat_encounter_id' => 'enc-satusehat-hen-006',
                        'synced_at' => "{$today}T09:25:00+07:00",
                        'organization_id' => '33771066-46d2-408b-a167-308ef64fca93'
                    ]
                ]
            ],

            // 8. Ahmad Fauzi - IGD Pasien Darurat P2
            'enc-20260910-igd-001' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260910-igd-001',
                'status' => 'in-progress',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'EMER', 'display' => 'IGD'],
                'subject' => ['reference' => 'Patient/RM-2026-1004', 'display' => 'Ahmad Fauzi'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'igd', 'display' => 'IGD']]],
                'reasonCode' => [['text' => 'Luka robek terbuka di lengan kanan bawah akibat pecahan kaca, perdarahan aktif']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'Umum'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P2']
                ],
                '_workflow' => [
                    'status_alur' => 'siap_dokter',
                    'tanda_vital' => [
                        'tekanan_darah' => '125/80 mmHg', 'suhu' => '36.8 °C', 'nadi' => '94 x/mnt', 'pernapasan' => '20 x/mnt',
                        'berat_badan' => '68 kg', 'tinggi_badan' => '170 cm', 'triage_level' => 'P2',
                        'catatan_perawat' => 'Luka sayat sepanjang 6 cm, perdarahan aktif terkontrol dengan bebat tekan',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => "{$today} 10:10:00"
                    ],
                    'pemeriksaan_dokter' => null,
                    'satusehat_sync' => [
                        'status' => 'synced_sandbox',
                        'satusehat_encounter_id' => 'enc-satusehat-igd-001',
                        'synced_at' => "{$today}T10:10:00+07:00",
                        'organization_id' => '33771066-46d2-408b-a167-308ef64fca93'
                    ]
                ]
            ],

            // 9. Dewi Anggraini - Siap Dokter Anak
            'enc-20260916-007' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260916-007',
                'status' => 'in-progress',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'AMB', 'display' => 'Rawat Jalan'],
                'subject' => ['reference' => 'Patient/RM-2026-1005', 'display' => 'Dewi Anggraini'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'poli-anak', 'display' => 'Poli Anak']]],
                'reasonCode' => [['text' => 'Anak usia 3 tahun batuk berdahak 3 hari, hidung tersumbat dan demam ringan']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'BPJS Kesehatan'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P4']
                ],
                '_workflow' => [
                    'status_alur' => 'siap_dokter',
                    'tanda_vital' => [
                        'tekanan_darah' => '95/60 mmHg', 'suhu' => '37.8 °C', 'nadi' => '102 x/mnt', 'pernapasan' => '24 x/mnt',
                        'berat_badan' => '14 kg', 'tinggi_badan' => '94 cm', 'triage_level' => 'P4',
                        'catatan_perawat' => 'Pasien anak kooperatif, ronkhi basah halus minimal di apeks paru kanan',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => "{$today} 10:15:00"
                    ],
                    'pemeriksaan_dokter' => null
                ]
            ],

            // 10. Bambang Susilo - Rawat Inap
            'enc-20260916-inap-001' => [
                'resourceType' => 'Encounter',
                'id' => 'enc-20260916-inap-001',
                'status' => 'in-progress',
                'class' => ['system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode', 'code' => 'IMP', 'display' => 'Rawat Inap'],
                'subject' => ['reference' => 'Patient/RM-2026-1006', 'display' => 'Bambang Susilo'],
                'period' => ['start' => $today],
                'serviceType' => ['coding' => [['system' => 'http://simrs-kel7.local/poli', 'code' => 'rawat-inap', 'display' => 'Rawat Inap']]],
                'reasonCode' => [['text' => 'Demam Tifoid hari ke-4 dengan dehidrasi sedang, nyeri perut dan lidah kotor (typhoid tongue)']],
                'extension' => [
                    ['url' => 'http://simrs-kel7.local/ext/penjamin', 'valueString' => 'BPJS Kesehatan'],
                    ['url' => 'http://simrs-kel7.local/ext/triage', 'valueString' => 'P3']
                ],
                '_workflow' => [
                    'status_alur' => 'siap_dokter',
                    'tanda_vital' => [
                        'tekanan_darah' => '115/75 mmHg', 'suhu' => '39.1 °C', 'nadi' => '76 x/mnt', 'pernapasan' => '20 x/mnt',
                        'berat_badan' => '62 kg', 'tinggi_badan' => '165 cm', 'triage_level' => 'P3',
                        'catatan_perawat' => 'Pasien tirah baring, terpasang infus RL 20 tpm, bradikardia relatif (+)',
                        'perawat_nama' => 'Ns. Dewi Lestari, S.Kep', 'waktu_ttv' => "{$today} 10:30:00"
                    ],
                    'pemeriksaan_dokter' => null
                ]
            ]
        ];

        foreach ($encounters as $encId => $data) {
            $fhir->save('encounters', $encId, $data);
        }

        // ==========================================
        // 4. RESEP FARMASI
        // ==========================================
        $prescriptions = [
            'rx-seed-001' => [
                'id' => 'rx-seed-001',
                'encounter_id' => 'enc-20260916-001',
                'patient_id' => 'RM-2026-0001',
                'patient_nama' => 'Ardianto Putra',
                'dokter' => 'dr. Ahmad Santoso, Sp.PD',
                'items' => [
                    ['nama_obat' => 'Paracetamol 500mg Tablet', 'jumlah' => 15, 'aturan' => '3x1 tablet sesudah makan (bila demam)'],
                    ['nama_obat' => 'Vitamin C 500mg Tablet', 'jumlah' => 10, 'aturan' => '1x1 tablet sesudah makan pagi'],
                    ['nama_obat' => 'Oralit Sachet', 'jumlah' => 6, 'aturan' => 'Larutkan 1 sachet dalam 200ml air, minum bila lemas']
                ],
                'status' => 'pending',
                'created_at' => $today,
                'dispensed_at' => null
            ],
            'rx-seed-002' => [
                'id' => 'rx-seed-002',
                'encounter_id' => 'enc-20260916-002',
                'patient_id' => 'RM-2026-0002',
                'patient_nama' => 'Claudia Sintia',
                'dokter' => 'dr. Ahmad Santoso, Sp.PD',
                'items' => [
                    ['nama_obat' => 'Omeprazole 20mg Kapsul', 'jumlah' => 14, 'aturan' => '1x1 kapsul 30 menit sebelum makan pagi'],
                    ['nama_obat' => 'Antasida Doen Suspensi', 'jumlah' => 1, 'aturan' => '3x1 sendok makan 1 jam sebelum makan'],
                    ['nama_obat' => 'Domperidone 10mg Tablet', 'jumlah' => 10, 'aturan' => '3x1 tablet 15 menit sebelum makan']
                ],
                'status' => 'dispensed',
                'created_at' => $today,
                'dispensed_at' => $today
            ],
            'rx-seed-003' => [
                'id' => 'rx-seed-003',
                'encounter_id' => 'enc-20260916-004',
                'patient_id' => 'RM-2026-0004',
                'patient_nama' => 'Dr. Alan Bagus Prasetya',
                'dokter' => 'dr. Ahmad Santoso, Sp.PD',
                'items' => [
                    ['nama_obat' => 'Cefixime 100mg Kapsul', 'jumlah' => 10, 'aturan' => '2x1 kapsul sesudah makan dihabiskan'],
                    ['nama_obat' => 'Asam Mefenamat 500mg Tablet', 'jumlah' => 10, 'aturan' => '3x1 tablet sesudah makan bila nyeri']
                ],
                'status' => 'dispensed',
                'created_at' => $today,
                'dispensed_at' => $today
            ]
        ];

        foreach ($prescriptions as $rxId => $data) {
            $fhir->save('prescriptions', $rxId, $data);
        }

        // ==========================================
        // 5. LABORATORIUM
        // ==========================================
        $labOrders = [
            'lab-seed-001' => [
                'id' => 'lab-seed-001',
                'encounter_id' => 'enc-20260916-001',
                'patient_id' => 'RM-2026-0001',
                'patient_nama' => 'Ardianto Putra',
                'jenis_pemeriksaan' => 'Darah Lengkap & Trombosit',
                'catatan_dokter' => 'Cek Hb, Leukosit, Hematokrit, dan Trombosit serial (evaluasi Dengue)',
                'status' => 'completed',
                'created_at' => $today,
                'hasil' => "Hasil Pemeriksaan Hematologi Lengkap:\n- Hemoglobin: 14.8 g/dL (Normal: 13.2 - 17.3)\n- Leukosit: 3.400 /uL (Rendah / Leukopenia - Normal: 4.000 - 10.000)\n- Hematokrit: 44.2 % (Normal: 40 - 52)\n- Trombosit: 112.000 /uL (Trombositopenia - Normal: 150.000 - 450.000)\nKesan: Trombositopenia dan Leukopenia relatif mendukung diagnosis Dengue Infection fase febris.",
                'completed_at' => $today
            ],
            'lab-seed-002' => [
                'id' => 'lab-seed-002',
                'encounter_id' => 'enc-20260916-006',
                'patient_id' => 'RM-2026-1003',
                'patient_nama' => 'Hendra Gunawan',
                'jenis_pemeriksaan' => 'Profil Lipid & Glukosa Darah Sewaktu',
                'catatan_dokter' => 'Skrining faktor risiko kardiovaskular & sindrom metabolik',
                'status' => 'ordered',
                'created_at' => $today,
                'hasil' => null,
                'completed_at' => null
            ]
        ];

        foreach ($labOrders as $labId => $data) {
            $fhir->save('lab_orders', $labId, $data);
        }

        // ==========================================
        // 6. TAGIHAN KASIR & BILLING
        // ==========================================
        $invoices = [
            'inv-seed-001' => [
                'id' => 'inv-seed-001',
                'encounter_id' => 'enc-20260916-002',
                'patient_id' => 'RM-2026-0002',
                'patient_nama' => 'Claudia Sintia',
                'items' => [
                    ['deskripsi' => 'Biaya Konsultasi Dokter Spesialis Penyakit Dalam', 'jumlah' => 150000],
                    ['deskripsi' => 'Farmasi: Omeprazole, Antasida & Domperidone', 'jumlah' => 65000]
                ],
                'total' => 215000,
                'status' => 'paid',
                'metode_bayar' => 'Tunai',
                'created_at' => $today,
                'paid_at' => $today
            ],
            'inv-seed-002' => [
                'id' => 'inv-seed-002',
                'encounter_id' => 'enc-20260916-004',
                'patient_id' => 'RM-2026-0004',
                'patient_nama' => 'Dr. Alan Bagus Prasetya',
                'items' => [
                    ['deskripsi' => 'Tindakan Bedah Minor (Aff Hecting & Dressing)', 'jumlah' => 250000],
                    ['deskripsi' => 'Farmasi: Antibiotik Cefixime & Analgesik', 'jumlah' => 100000]
                ],
                'total' => 350000,
                'status' => 'paid',
                'metode_bayar' => 'Asuransi',
                'created_at' => $today,
                'paid_at' => $today
            ],
            'inv-seed-003' => [
                'id' => 'inv-seed-003',
                'encounter_id' => 'enc-20260916-001',
                'patient_id' => 'RM-2026-0001',
                'patient_nama' => 'Ardianto Putra',
                'items' => [
                    ['deskripsi' => 'Konsultasi Poli Umum (Klaim BPJS)', 'jumlah' => 50000],
                    ['deskripsi' => 'Pemeriksaan Darah Lengkap Lab', 'jumlah' => 85000],
                    ['deskripsi' => 'Paket Obat Terapi Suportif', 'jumlah' => 50000]
                ],
                'total' => 185000,
                'status' => 'paid',
                'metode_bayar' => 'BPJS Kesehatan',
                'created_at' => $today,
                'paid_at' => $today
            ]
        ];

        foreach ($invoices as $invId => $data) {
            $fhir->save('invoices', $invId, $data);
        }
    }
}
