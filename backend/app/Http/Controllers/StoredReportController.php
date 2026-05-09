<?php

namespace App\Http\Controllers;

use App\Models\StoredReport;
use Illuminate\Http\Request;

class StoredReportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->hasAccess('reports'), 403);

        $reports = StoredReport::with('generator:id,name,email')
            ->latest()
            ->paginate(20);

        return response()->json($reports);
    }

    public function store(Request $request, ReportController $reports)
    {
        abort_unless($request->user()->hasAccess('reports'), 403);

        $validated = $request->validate([
            'type' => 'required|in:inventory,orders,members',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $reportRequest = Request::create('', 'GET', $request->only(['date_from', 'date_to', 'status']));
        $reportRequest->setUserResolver(fn () => $request->user());

        $response = match ($validated['type']) {
            'orders' => $reports->ordersReport($reportRequest),
            'members' => $reports->membersReport($reportRequest),
            default => $reports->inventoryReport($reportRequest),
        };

        $data = $response->getData(true);
        $stored = StoredReport::create([
            'type' => $validated['type'],
            'generated_by' => $request->user()->id,
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'data' => $data,
            'summary' => $this->summaryFor($validated['type'], $data),
        ])->load('generator:id,name,email');

        return response()->json([
            'message' => 'Report saved to history',
            'report' => $stored,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        abort_unless($request->user()->hasAccess('reports'), 403);

        return response()->json(StoredReport::with('generator:id,name,email')->findOrFail($id));
    }

    private function summaryFor(string $type, array $data): array
    {
        return match ($type) {
            'orders' => [
                'orders' => $data['total_orders'] ?? 0,
                'revenue' => $data['total_revenue'] ?? 0,
            ],
            'members' => [
                'members' => $data['total_members'] ?? 0,
                'verified' => $data['verified_members'] ?? 0,
            ],
            default => [
                'products' => $data['total_products'] ?? 0,
                'stock_value' => $data['total_stock_value'] ?? 0,
            ],
        };
    }
}
