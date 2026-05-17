<?php

namespace App\Services;

use Illuminate\Http\Request;
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

    public function callbackUrl(?Request $request = null)
    {
        $configuredUrl = (string) config('services.chapa.callback_url');

        if ($this->isPublicUrl($configuredUrl)) {
            return $configuredUrl;
        }

        return $this->requestBaseUrl($request) . '/api/payments/callback';
    }

    public function returnUrl(int $orderId, ?Request $request = null)
    {
        $configuredUrl = (string) config('services.chapa.return_url');
        $base = $this->isPublicUrl($configuredUrl)
            ? rtrim($configuredUrl, '/')
            : $this->requestBaseUrl($request);

        return $base . '/member/orders/' . $orderId;
    }

    public function currency()
    {
        return config('services.chapa.currency', 'ETB');
    }

    public function isConfigured(): bool
    {
        return $this->secretKey() !== '' && $this->baseUrl() !== '';
    }

    protected function baseUrl()
    {
        return rtrim((string) config('services.chapa.base_url'), '/');
    }

    protected function secretKey()
    {
        return (string) config('services.chapa.secret_key');
    }

    private function requestBaseUrl(?Request $request): string
    {
        $url = $request ? $request->getSchemeAndHttpHost() : (string) config('app.url');

        return rtrim($url, '/');
    }

    private function isPublicUrl(string $url): bool
    {
        if ($url === '') {
            return false;
        }

        $host = parse_url($url, PHP_URL_HOST);

        return $host
            && !in_array($host, ['localhost', '127.0.0.1', '0.0.0.0'], true);
    }
}
