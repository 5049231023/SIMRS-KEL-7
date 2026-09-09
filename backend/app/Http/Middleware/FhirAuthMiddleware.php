<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\FhirRepository;
use Symfony\Component\HttpFoundation\Response;

class FhirAuthMiddleware
{
    protected FhirRepository $fhir;

    public function __construct(FhirRepository $fhir)
    {
        $this->fhir = $fhir;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $practitioner = $this->fhir->findBy('practitioners', '_auth.api_token', $token);

        if (!$practitioner) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->attributes->set('practitioner', $practitioner);

        return $next($request);
    }
}
