<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\FhirRepository;

class FhirSeeder extends Seeder
{
    public function run(FhirRepository $fhir): void
    {
        // 1. PRACTITIONERS (ROLES)
        // 1.1 Admin Rekam Medis (NIP: 101 / pass: 123)
        $admin = [
            'resourceType' => 'Practitioner',
            'id' => 'pract-101',
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/nip', 'value' => '101']
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => 'Budi Handoko, S.Kom (Admin SIMRS)']
            ],
            'qualification' => [
                [
                    'code' => [
                        'coding' => [
                            ['system' => 'http://simrs-kel7.local/unit', 'code' => 'admin', 'display' => 'Admin Rekam Medis']
                        ]
                    ]
                ]
            ],
            '_auth' => [
                'password_hash' => bcrypt('123'),
                'api_token' => null,
                'role' => 'admin'
            ]
        ];
        $fhir->save('practitioners', 'pract-101', $admin);

        // 1.2 Petugas Farmasi (NIP: 102 / pass: 123)
        $farmasi = [
            'resourceType' => 'Practitioner',
            'id' => 'pract-102',
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/nip', 'value' => '102']
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => 'Siti Rahma, S.Farm, Apt (Apoteker)']
            ],
            'qualification' => [
                [
                    'code' => [
                        'coding' => [
                            ['system' => 'http://simrs-kel7.local/unit', 'code' => 'farmasi', 'display' => 'Instalasi Farmasi']
                        ]
                    ]
                ]
            ],
            '_auth' => [
                'password_hash' => bcrypt('123'),
                'api_token' => null,
                'role' => 'farmasi'
            ]
        ];
        $fhir->save('practitioners', 'pract-102', $farmasi);

        // 1.3 Dokter Spesialis (NIP: 103 / pass: 123)
        $dokter = [
            'resourceType' => 'Practitioner',
            'id' => 'pract-103',
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/nip', 'value' => '103']
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => 'dr. Ahmad Santoso, Sp.PD']
            ],
            'qualification' => [
                [
                    'code' => [
                        'coding' => [
                            ['system' => 'http://simrs-kel7.local/unit', 'code' => 'dokter', 'display' => 'Dokter Spesialis']
                        ]
                    ]
                ]
            ],
            '_auth' => [
                'password_hash' => bcrypt('123'),
                'api_token' => null,
                'role' => 'dokter'
            ]
        ];
        $fhir->save('practitioners', 'pract-103', $dokter);

        // 1.4 Perawat Klinis (NIP: 104 / pass: 123)
        $perawat = [
            'resourceType' => 'Practitioner',
            'id' => 'pract-104',
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/nip', 'value' => '104']
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => 'Ns. Dewi Lestari, S.Kep']
            ],
            'qualification' => [
                [
                    'code' => [
                        'coding' => [
                            ['system' => 'http://simrs-kel7.local/unit', 'code' => 'perawat', 'display' => 'Perawat Rawat Jalan & IGD']
                        ]
                    ]
                ]
            ],
            '_auth' => [
                'password_hash' => bcrypt('123'),
                'api_token' => null,
                'role' => 'perawat'
            ]
        ];
        $fhir->save('practitioners', 'pract-104', $perawat);

        // 2. PATIENTS
        $patient1 = [
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
        $fhir->save('patients', 'RM-2025-5541', $patient1);

        $patient2 = [
            'resourceType' => 'Patient',
            'id' => 'RM-2026-1002',
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1002'],
                ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3515021234560001'],
                ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00088712398']
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => 'Siti Aminah']
            ],
            'gender' => 'female',
            'birthDate' => '1992-08-20',
            'telecom' => [
                ['system' => 'phone', 'value' => '082198765432', 'use' => 'mobile']
            ],
            'address' => [
                ['use' => 'home', 'text' => 'Jl. Manyar Kertoarjo No. 45, Surabaya']
            ]
        ];
        $fhir->save('patients', 'RM-2026-1002', $patient2);

        $patient3 = [
            'resourceType' => 'Patient',
            'id' => 'RM-2026-1003',
            'identifier' => [
                ['system' => 'http://simrs-kel7.local/norm', 'value' => 'RM-2026-1003'],
                ['system' => 'https://fhir.kemkes.go.id/id/nik', 'value' => '3515031234560002'],
                ['system' => 'https://fhir.kemkes.go.id/id/ihs-number', 'value' => 'P00077654321']
            ],
            'active' => true,
            'name' => [
                ['use' => 'official', 'text' => 'Hendra Gunawan']
            ],
            'gender' => 'male',
            'birthDate' => '1980-03-14',
            'telecom' => [
                ['system' => 'phone', 'value' => '085712344321', 'use' => 'mobile']
            ],
            'address' => [
                ['use' => 'home', 'text' => 'Jl. Darmo Permai II No. 8, Surabaya']
            ]
        ];
        $fhir->save('patients', 'RM-2026-1003', $patient3);

        // 3. ENCOUNTERS DENGAN STATUS ALUR WORKFLOW NYATA
        $encounter1 = [
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
                ['text' => 'Demam tinggi dan sakit kepala']
            ],
            'extension' => [
                [
                    'url' => 'http://simrs-kel7.local/ext/penjamin',
                    'valueString' => 'BPJS Kesehatan'
                ]
            ],
            '_workflow' => [
                'status_alur' => 'selesai',
                'tanda_vital' => [
                    'tekanan_darah' => '120/80 mmHg',
                    'suhu' => '38.2 °C',
                    'nadi' => '84 x/mnt',
                    'pernapasan' => '20 x/mnt',
                    'berat_badan' => '65 kg',
                    'tinggi_badan' => '170 cm',
                    'catatan_perawat' => 'Pasien tampak lemas',
                    'perawat_nama' => 'Ns. Dewi Lestari, S.Kep',
                    'waktu_ttv' => '2026-06-09 08:30:00'
                ],
                'pemeriksaan_dokter' => [
                    'diagnosa_utama' => 'Febris Akut e.c Susp. ISPA',
                    'diagnosa_sekunder' => 'Cephalgia',
                    'tindakan' => 'Edukasi istirahat dan terapi obat simptomatis',
                    'catatan_dokter' => 'Banyak minum air putih, kontrol ulang 3 hari jika belum turun',
                    'dokter_nama' => 'dr. Ahmad Santoso, Sp.PD',
                    'waktu_periksa' => '2026-06-09 09:15:00'
                ]
            ]
        ];
        $fhir->save('encounters', 'enc-20260609-001', $encounter1);

        $encounterIgd = [
            'resourceType' => 'Encounter',
            'id' => 'enc-20260910-igd-001',
            'status' => 'in-progress',
            'class' => [
                'system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                'code' => 'EMER',
                'display' => 'IGD'
            ],
            'subject' => [
                'reference' => 'Patient/RM-2025-5541',
                'display' => 'Budi Santoso'
            ],
            'period' => [
                'start' => date('Y-m-d')
            ],
            'serviceType' => [
                'coding' => [
                    [
                        'system' => 'http://simrs-kel7.local/poli',
                        'code' => 'igd',
                        'display' => 'IGD'
                    ]
                ]
            ],
            'reasonCode' => [
                ['text' => 'Nyeri dada akut dan sesak napas berat']
            ],
            'extension' => [
                [
                    'url' => 'http://simrs-kel7.local/ext/penjamin',
                    'valueString' => 'BPJS Kesehatan'
                ],
                [
                    'url' => 'http://simrs-kel7.local/ext/triage',
                    'valueString' => 'P2'
                ]
            ],
            '_workflow' => [
                'status_alur' => 'siap_dokter',
                'tanda_vital' => [
                    'tekanan_darah' => '150/95 mmHg',
                    'suhu' => '36.8 °C',
                    'nadi' => '102 x/mnt',
                    'pernapasan' => '26 x/mnt',
                    'berat_badan' => '68 kg',
                    'tinggi_badan' => '170 cm',
                    'triage_level' => 'P2',
                    'catatan_perawat' => 'Pasien sesak napas akut, saturasi 94% on room air',
                    'perawat_nama' => 'Ns. Dewi Lestari, S.Kep',
                    'waktu_ttv' => date('Y-m-d H:i:s')
                ],
                'pemeriksaan_dokter' => null
            ]
        ];
        $fhir->save('encounters', 'enc-20260910-igd-001', $encounterIgd);

        // Kunjungan Siti Aminah (menunggu perawat)
        $encDate = date('Ymd');
        $encounterPerawat = [
            'resourceType' => 'Encounter',
            'id' => "enc-{$encDate}-poli-001",
            'status' => 'in-progress',
            'class' => [
                'system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                'code' => 'AMB',
                'display' => 'Rawat Jalan'
            ],
            'subject' => [
                'reference' => 'Patient/RM-2026-1002',
                'display' => 'Siti Aminah'
            ],
            'period' => [
                'start' => date('Y-m-d')
            ],
            'serviceType' => [
                'coding' => [
                    [
                        'system' => 'http://simrs-kel7.local/poli',
                        'code' => 'poli-penyakit-dalam',
                        'display' => 'Poli Penyakit Dalam'
                    ]
                ]
            ],
            'reasonCode' => [
                ['text' => 'Demam menggigil sejak 3 hari, mual, dan nafsu makan turun']
            ],
            'extension' => [
                [
                    'url' => 'http://simrs-kel7.local/ext/penjamin',
                    'valueString' => 'BPJS Kesehatan'
                ]
            ],
            '_workflow' => [
                'status_alur' => 'menunggu_perawat',
                'tanda_vital' => null,
                'pemeriksaan_dokter' => null
            ]
        ];
        $fhir->save('encounters', "enc-{$encDate}-poli-001", $encounterPerawat);

        // Kunjungan Hendra Gunawan (siap dokter)
        $encounterDokter = [
            'resourceType' => 'Encounter',
            'id' => "enc-{$encDate}-poli-002",
            'status' => 'in-progress',
            'class' => [
                'system' => 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                'code' => 'AMB',
                'display' => 'Rawat Jalan'
            ],
            'subject' => [
                'reference' => 'Patient/RM-2026-1003',
                'display' => 'Hendra Gunawan'
            ],
            'period' => [
                'start' => date('Y-m-d')
            ],
            'serviceType' => [
                'coding' => [
                    [
                        'system' => 'http://simrs-kel7.local/poli',
                        'code' => 'poli-penyakit-dalam',
                        'display' => 'Poli Penyakit Dalam'
                    ]
                ]
            ],
            'reasonCode' => [
                ['text' => 'Pusing berputar, tengkuk terasa kaku dan sering haus']
            ],
            'extension' => [
                [
                    'url' => 'http://simrs-kel7.local/ext/penjamin',
                    'valueString' => 'Umum'
                ]
            ],
            '_workflow' => [
                'status_alur' => 'siap_dokter',
                'tanda_vital' => [
                    'tekanan_darah' => '145/90 mmHg',
                    'suhu' => '36.7 °C',
                    'nadi' => '88 x/mnt',
                    'pernapasan' => '19 x/mnt',
                    'berat_badan' => '74 kg',
                    'tinggi_badan' => '168 cm',
                    'catatan_perawat' => 'Pasien riwayat hipertensi tidak rutin minum obat',
                    'perawat_nama' => 'Ns. Dewi Lestari, S.Kep',
                    'waktu_ttv' => date('Y-m-d H:i:s')
                ],
                'pemeriksaan_dokter' => null
            ]
        ];
        $fhir->save('encounters', "enc-{$encDate}-poli-002", $encounterDokter);

        // 4. RESEP FARMASI
        $rx1 = [
            'id' => 'rx-seed-001',
            'encounter_id' => 'enc-20260609-001',
            'patient_id' => 'RM-2025-5541',
            'patient_nama' => 'Budi Santoso',
            'dokter' => 'dr. Ahmad Santoso, Sp.PD',
            'items' => [
                ['nama_obat' => 'Paracetamol 500mg', 'jumlah' => 10, 'aturan' => '3x1 sehari sesudah makan'],
                ['nama_obat' => 'Amoxicillin 500mg', 'jumlah' => 15, 'aturan' => '3x1 sehari dihabiskan']
            ],
            'status' => 'pending',
            'created_at' => date('Y-m-d'),
            'dispensed_at' => null
        ];
        $fhir->save('prescriptions', 'rx-seed-001', $rx1);

        $rx2 = [
            'id' => 'rx-seed-002',
            'encounter_id' => 'enc-20260609-001',
            'patient_id' => 'RM-2025-5541',
            'patient_nama' => 'Budi Santoso',
            'dokter' => 'dr. Ahmad Santoso, Sp.PD',
            'items' => [
                ['nama_obat' => 'Omeprazole 20mg', 'jumlah' => 14, 'aturan' => '1x1 sebelum makan pagi']
            ],
            'status' => 'dispensed',
            'created_at' => date('Y-m-d'),
            'dispensed_at' => date('Y-m-d')
        ];
        $fhir->save('prescriptions', 'rx-seed-002', $rx2);

        // 5. LABORATORIUM ORDERS
        $lab1 = [
            'id' => 'lab-seed-001',
            'encounter_id' => 'enc-20260609-001',
            'patient_id' => 'RM-2025-5541',
            'patient_nama' => 'Budi Santoso',
            'jenis_pemeriksaan' => 'Darah Lengkap & Trombosit',
            'catatan_dokter' => 'Cek Hb, Leukosit, dan Trombosit',
            'status' => 'ordered',
            'created_at' => date('Y-m-d'),
            'hasil' => null,
            'completed_at' => null
        ];
        $fhir->save('lab_orders', 'lab-seed-001', $lab1);

        $lab2 = [
            'id' => 'lab-seed-002',
            'encounter_id' => 'enc-20260609-001',
            'patient_id' => 'RM-2025-5541',
            'patient_nama' => 'Budi Santoso',
            'jenis_pemeriksaan' => 'Gula Darah Puasa (GDP)',
            'catatan_dokter' => 'Cek GDP rutin',
            'status' => 'completed',
            'created_at' => date('Y-m-d'),
            'hasil' => 'Hasil GDP: 95 mg/dL (Nilai Rujukan: 70 - 100 mg/dL). Status: Normal.',
            'completed_at' => date('Y-m-d')
        ];
        $fhir->save('lab_orders', 'lab-seed-002', $lab2);

        // 6. INVOICES (KASIR & BILLING)
        $inv1 = [
            'id' => 'inv-seed-001',
            'encounter_id' => 'enc-20260609-001',
            'patient_id' => 'RM-2025-5541',
            'patient_nama' => 'Budi Santoso',
            'items' => [
                ['deskripsi' => 'Konsultasi Dokter Spesialis', 'jumlah' => 150000],
                ['deskripsi' => 'Paracetamol 500mg x10', 'jumlah' => 25000],
                ['deskripsi' => 'Amoxicillin 500mg x15', 'jumlah' => 45000]
            ],
            'total' => 220000,
            'status' => 'unpaid',
            'metode_bayar' => null,
            'created_at' => date('Y-m-d'),
            'paid_at' => null
        ];
        $fhir->save('invoices', 'inv-seed-001', $inv1);

        $inv2 = [
            'id' => 'inv-seed-002',
            'encounter_id' => 'enc-20260609-001',
            'patient_id' => 'RM-2025-5541',
            'patient_nama' => 'Budi Santoso',
            'items' => [
                ['deskripsi' => 'Pemeriksaan Gula Darah Puasa', 'jumlah' => 75000]
            ],
            'total' => 75000,
            'status' => 'paid',
            'metode_bayar' => 'BPJS Kesehatan',
            'created_at' => date('Y-m-d'),
            'paid_at' => date('Y-m-d')
        ];
        $fhir->save('invoices', 'inv-seed-002', $inv2);
    }
}
