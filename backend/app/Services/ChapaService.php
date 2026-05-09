<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChapaService
{
    public function initialize(array $payload)
    {
        $response = Http::withToken($this->secretKey())
            ->acceptJson()
            ->post($this->baseUrl() . '/transaction/initialize', $payload);

        if (!$response->ok()) {
            Log::error('Chapa initialize failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return $response->json();
    }

    public function verify(string $txRef)
    {
        $response = Http::withToken($this->secretKey())
            ->acceptJson()
            ->get($this->baseUrl() . '/transaction/verify/' . $txRef);

        if (!$response->ok()) {
            Log::error('Chapa verify failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return $response->json();
    }

    public function callbackUrl()
    {
        return config('services.chapa.callback_url');
    }

    public function returnUrl(int $orderId)
    {
        $base = rtrim((string) config('services.chapa.return_url'), '/');
        return $base . '/member/orders/' . $orderId;
    }

    public function currency()
    {
        return config('services.chapa.currency', 'ETB');
    }

    public function isConfigured(): bool
    {
        return $this->secretKey() !== '';
    }

    protected function baseUrl()
    {
        return rtrim((string) config('services.chapa.base_url'), '/');
    }

    protected function secretKey()
    {
        return (string) config('services.chapa.secret_key');
    }
}
