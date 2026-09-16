<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SATUSEHAT Environment Mode
    |--------------------------------------------------------------------------
    | 'sandbox' (Staging) atau 'production'
    */
    'env' => env('SATUSEHAT_ENV', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | SATUSEHAT Organization ID Fasyankes
    |--------------------------------------------------------------------------
    | ID Organisasi Fasilitas Pelayanan Kesehatan yang terdaftar di Kemenkes
    */
    'organization_id' => env('SATUSEHAT_ORG_ID', '33771066-46d2-408b-a167-308ef64fca93'),

    /*
    |--------------------------------------------------------------------------
    | Client Credentials (OAuth2)
    |--------------------------------------------------------------------------
    | Client ID dan Client Secret yang didapat dari portal SATUSEHAT
    */
    'client_id' => env('SATUSEHAT_CLIENT_ID', 'vRb3Qvw5VHGNK7yqIiDoR4kvn71rHOSbwsgqM0mGTOOUZ9t6'),
    'client_secret' => env('SATUSEHAT_CLIENT_SECRET', 'TxCANZbu0IxaZOxh7984q7iXGaB2QIPTViGAJToPsj1uZ4EyxRSd1wrkL7r8EuCY'),

    /*
    |--------------------------------------------------------------------------
    | Base URLs API Kemenkes
    |--------------------------------------------------------------------------
    */
    'auth_url' => env('SATUSEHAT_AUTH_URL', 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1'),
    'fhir_url' => env('SATUSEHAT_FHIR_URL', 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1'),
];
