<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;

class ReportController extends Controller
{
    // ─────────────────────────────────────────────
    // GET /api/reports
    // ─────────────────────────────────────────────
    public function index()
    {
        $reports = Report::latest('generated_at')->get();

        return response()->json([
            'reports' => $reports,
            'message' => 'Reports fetched successfully.',
        ]);
    }

    // ─────────────────────────────────────────────
    // POST /api/reports
    // Creates the report record AND generates the file.
    // ─────────────────────────────────────────────
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => ['required', Rule::in(['Production', 'Fishery', 'Financial', 'Census', 'Inventory'])],
            'module'      => 'required|string|max:255',
            'period_from' => 'required|date',
            'period_to'   => 'required|date|after_or_equal:period_from',
            'format'      => ['required', Rule::in(['PDF', 'XLSX'])],
            'status'      => ['required', Rule::in(['Published', 'Pending Review', 'Draft'])],
            'notes'       => 'nullable|string|max:2000',
        ]);

        $validated['generated_by'] = Auth::user()->name ?? 'System';
        $validated['generated_at'] = now();

        // Create the record first so we have an ID
        $report = Report::create($validated);

        // Generate the file and update file_path
        try {
            $filePath = $this->generateFile($report);
            $report->update(['file_path' => $filePath]);
        } catch (\Exception $e) {
            // File generation failed — record is still saved, just without a file
            \Log::error("Report file generation failed for ID {$report->id}: " . $e->getMessage());
        }

        return response()->json([
            'data'    => $report->fresh(),
            'message' => 'Report generated successfully.',
        ], 201);
    }

    // ─────────────────────────────────────────────
    // GET /api/reports/{id}/download
    // ─────────────────────────────────────────────
    public function download(Report $report)
    {
        if (!$report->file_path || !Storage::exists($report->file_path)) {
            return response()->json([
                'message' => 'No file available for this report yet.',
            ], 404);
        }

        $mime = $report->format === 'PDF'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        $ext      = strtolower($report->format);
        $filename = "{$report->title}.{$ext}";

        return Storage::download($report->file_path, $filename, [
            'Content-Type' => $mime,
        ]);
    }

    // ─────────────────────────────────────────────
    // DELETE /api/reports/{id}
    // ─────────────────────────────────────────────
    public function destroy(Report $report)
    {
        if ($report->file_path && Storage::exists($report->file_path)) {
            Storage::delete($report->file_path);
        }

        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully.',
        ]);
    }

    // ─────────────────────────────────────────────
    // PRIVATE: Generate PDF or XLSX file
    // Returns the storage path (e.g. reports/1_Production.pdf)
    // ─────────────────────────────────────────────
    private function generateFile(Report $report): string
    {
        $data     = $this->fetchReportData($report);
        $filename = "{$report->id}_{$report->type}";
        $dir      = 'reports';

        Storage::makeDirectory($dir);

        if ($report->format === 'PDF') {
            $pdf  = Pdf::loadView('reports.template', compact('report', 'data'))
                       ->setPaper('a4', 'portrait');
            $path = "{$dir}/{$filename}.pdf";
            Storage::put($path, $pdf->output());
        } else {
            $path = "{$dir}/{$filename}.xlsx";
            Excel::store(new ReportExport($report, $data), $path);
        }

        return $path;
    }

    // ─────────────────────────────────────────────
    // PRIVATE: Fetch rows relevant to this report
    // Adjust model names / relationships to match your app.
    // ─────────────────────────────────────────────
    private function fetchReportData(Report $report): array
    {
        $from = $report->period_from;
        $to   = $report->period_to;

        return match ($report->type) {
            'Production' => $this->fetchProduction($from, $to),
            'Fishery'    => $this->fetchFishery($from, $to),
            'Livestock & Poultry' => $this->fetchLivestock($from, $to),
            'Financial'  => $this->fetchFinancial($from, $to),
            'Census'     => $this->fetchCensus(),
            'Inventory'  => $this->fetchInventory(),
            default      => [],
        };
    }

    private function fetchProduction($from, $to): array
    {
        // Harvests within the period
        $harvests = \App\Models\Harvest::with(['farmer', 'crop', 'barangay'])
            ->whereBetween('harvest_date', [$from, $to])
            ->orderBy('harvest_date')
            ->get();

        $headers = ['Farmer', 'Crop', 'Barangay', 'Harvest Date', 'Area (ha)', 'Yield (kg)', 'Quality'];
        $rows    = $harvests->map(fn($h) => [
            $h->farmer->full_name       ?? '—',
            $h->crop->name              ?? '—',
            $h->barangay->name          ?? '—',
            $h->harvest_date?->format('M d, Y'),
            $h->area_harvested,
            $h->yield_kg,
            $h->quality,
        ])->toArray();

        return compact('headers', 'rows');
    }

    private function fetchFishery($from, $to): array
    {
        $records = \App\Models\Fishery::with(['fisherfolk'])
            ->whereBetween('catch_date', [$from, $to])
            ->orderBy('catch_date')
            ->get();

        $headers = ['Fisherfolk', 'Catch Date', 'Species', 'Volume (kg)', 'Value (₱)', 'Gear Type'];
        $rows    = $records->map(fn($r) => [
            $r->fisherfolk->full_name ?? '—',
            $r->catch_date?->format('M d, Y'),
            $r->species,
            $r->volume_kg,
            number_format($r->value, 2),
            $r->gear_type,
        ])->toArray();

        return compact('headers', 'rows');
    }

    private function fetchLivestock($from, $to): array
    {
        $records = \App\Models\Livestock::with(['farmer'])
            ->whereBetween('recorded_at', [$from, $to])
            ->orderBy('recorded_at')
            ->get();

        $headers = ['Farmer', 'Animal Type', 'Count', 'Barangay', 'Recorded At'];
        $rows    = $records->map(fn($r) => [
            $r->farmer->full_name ?? '—',
            $r->animal_type,
            $r->count,
            $r->barangay,
            $r->recorded_at?->format('M d, Y'),
        ])->toArray();

        return compact('headers', 'rows');
    }

    private function fetchFinancial($from, $to): array
    {
        $expenses = \App\Models\Expense::whereBetween('expense_date', [$from, $to])
            ->orderBy('expense_date')
            ->get();

        $headers = ['Date', 'Category', 'Project', 'Description', 'Amount (₱)', 'Status'];
        $rows    = $expenses->map(fn($e) => [
            $e->expense_date?->format('M d, Y'),
            $e->category,
            $e->project,
            $e->description,
            number_format($e->amount, 2),
            $e->status ?? 'Active',
        ])->toArray();

        $total = $expenses->sum('amount');

        return compact('headers', 'rows', 'total');
    }

    private function fetchCensus(): array
    {
        $farmers = \App\Models\Farmer::with(['barangay', 'crops', 'cooperative'])
            ->orderBy('last_name')
            ->get();

        $headers = ['Full Name', 'Barangay', 'Cooperative', 'Crops', 'Farm Area (ha)', 'Contact'];
        $rows    = $farmers->map(fn($f) => [
            trim("{$f->last_name}, {$f->first_name}"),
            $f->barangay->name          ?? '—',
            $f->cooperative->name       ?? '—',
            $f->crops->pluck('name')->join(', ') ?: '—',
            $f->farm_area,
            $f->contact_number          ?? '—',
        ])->toArray();

        return compact('headers', 'rows');
    }

    private function fetchInventory(): array
    {
        $items = \App\Models\Inventory::with(['farmer', 'fisherfolk'])
            ->orderBy('item_name')
            ->get();

        $headers = ['Item Name', 'Category', 'Quantity', 'Unit', 'Assigned To', 'Condition', 'Date Received'];
        $rows    = $items->map(fn($i) => [
            $i->item_name,
            $i->category,
            $i->quantity,
            $i->unit,
            $i->farmer->full_name ?? $i->fisherfolk->full_name ?? '—',
            $i->condition,
            $i->date_received?->format('M d, Y'),
        ])->toArray();

        return compact('headers', 'rows');
    }
}
