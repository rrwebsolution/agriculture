<?php

// ─────────────────────────────────────────────────────────────────────────────
// Add these lines inside your existing Route::middleware('auth:sanctum')
// group in routes/api.php
// ─────────────────────────────────────────────────────────────────────────────

use App\Http\Controllers\ReportController;

Route::prefix('reports')->group(function () {
    Route::get('/',                    [ReportController::class, 'index']);    // GET    /api/reports
    Route::post('/',                   [ReportController::class, 'store']);    // POST   /api/reports
    Route::get('/{report}/download',   [ReportController::class, 'download']); // GET    /api/reports/{id}/download
    Route::delete('/{report}',         [ReportController::class, 'destroy']); // DELETE /api/reports/{id}
});
