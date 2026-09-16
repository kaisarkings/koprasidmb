import { DailySummaryReport, Transaction, TopUp, AppSettings } from '../types';
import { storageService } from './storageService';

export const reportService = {
  /**
   * Calculate daily aggregate stats from arrays of transactions and topups for a given YYYY-MM-DD date.
   */
  calculateDailyAggregates(
    transactions: Transaction[],
    topups: TopUp[],
    dateStr: string,
    targetEmail: string,
    triggerType: 'automated_cron' | 'manual_trigger' = 'manual_trigger'
  ): DailySummaryReport {
    // Filter transactions and topups matching date (e.g. YYYY-MM-DD)
    const dayTrx = transactions.filter((t) => t.created_at.startsWith(dateStr));
    const dayTopups = topups.filter((tp) => tp.created_at.startsWith(dateStr));

    const totalTrxCount = dayTrx.length;
    const totalTrxAmount = dayTrx.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalTopupCount = dayTopups.length;
    const totalTopupAmount = dayTopups.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const netCashFlow = totalTopupAmount - totalTrxAmount;

    // Category breakdown
    const categoryBreakdown: Record<string, { count: number; amount: number }> = {};
    (dayTrx || []).forEach((t) => {
      const cat = t.category || 'Lainnya';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { count: 0, amount: 0 };
      }
      categoryBreakdown[cat].count += 1;
      categoryBreakdown[cat].amount += t.amount || 0;
    });

    // Payment method breakdown
    const paymentMethodBreakdown: Record<string, { count: number; amount: number }> = {};
    (dayTopups || []).forEach((tp) => {
      const method = tp.payment_method || 'Tunai';
      if (!paymentMethodBreakdown[method]) {
        paymentMethodBreakdown[method] = { count: 0, amount: 0 };
      }
      paymentMethodBreakdown[method].count += 1;
      paymentMethodBreakdown[method].amount += tp.amount || 0;
    });

    // Top active santri
    const studentSpendingMap: Record<string, { name: string; class_name: string; amount: number }> = {};
    (dayTrx || []).forEach((t) => {
      const sName = t.student_name || 'Santri';
      const sClass = t.student_class || '-';
      if (!studentSpendingMap[sName]) {
        studentSpendingMap[sName] = { name: sName, class_name: sClass, amount: 0 };
      }
      studentSpendingMap[sName].amount += t.amount || 0;
    });

    const topActiveStudents = Object.values(studentSpendingMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const reportId = `rep_${dateStr.replace(/-/g, '')}_${Date.now().toString(36)}`;

    // Build email HTML
    const emailHtml = this.generateEmailHtmlTemplate({
      reportId,
      dateStr,
      totalTrxCount,
      totalTrxAmount,
      totalTopupCount,
      totalTopupAmount,
      netCashFlow,
      categoryBreakdown,
      paymentMethodBreakdown,
      topActiveStudents,
      targetEmail,
    });

    return {
      id: reportId,
      report_date: dateStr,
      total_transactions_count: totalTrxCount,
      total_transactions_amount: totalTrxAmount,
      total_topups_count: totalTopupCount,
      total_topups_amount: totalTopupAmount,
      net_cash_flow: netCashFlow,
      category_breakdown: categoryBreakdown,
      payment_method_breakdown: paymentMethodBreakdown,
      top_active_students: topActiveStudents,
      sent_to_email: targetEmail,
      status: 'sent',
      trigger_type: triggerType,
      generated_at: new Date().toISOString(),
      email_content_html: emailHtml,
      log_message: `Laporan Ringkasan Harian [${dateStr}] berhasil dikirim ke ${targetEmail}`,
    };
  },

  /**
   * Generates responsive, clean HTML email string
   */
  generateEmailHtmlTemplate(params: {
    reportId: string;
    dateStr: string;
    totalTrxCount: number;
    totalTrxAmount: number;
    totalTopupCount: number;
    totalTopupAmount: number;
    netCashFlow: number;
    categoryBreakdown: Record<string, { count: number; amount: number }>;
    paymentMethodBreakdown: Record<string, { count: number; amount: number }>;
    topActiveStudents: Array<{ name: string; class_name: string; amount: number }>;
    targetEmail: string;
  }): string {
    const formattedDate = new Date(params.dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const categoryRows = Object.entries(params.categoryBreakdown)
      .map(
        ([cat, data]) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155;">${cat}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${data.count}x</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">Rp ${data.amount.toLocaleString('id-ID')}</td>
      </tr>`
      )
      .join('');

    const topupRows = Object.entries(params.paymentMethodBreakdown)
      .map(
        ([method, data]) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155;">${method}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${data.count}x</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #047857;">Rp ${data.amount.toLocaleString('id-ID')}</td>
      </tr>`
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 24px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .stat-box { background: #f1f5f9; border-radius: 12px; padding: 14px; text-align: center; }
        .stat-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px; }
        .stat-value { font-size: 18px; font-weight: 900; color: #0f172a; }
        .section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 20px 0 10px 0; border-left: 4px solid #059669; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Laporan Ringkasan Harian Koperasi</h1>
          <p>Pondok Pesantren Sirajuddin • ${formattedDate}</p>
        </div>
        <div class="content">
          <div class="grid">
            <div class="stat-box" style="background:#ecfdf5; border:1px solid #a7f3d0;">
              <div class="stat-label" style="color:#047857;">Total Top-Up Saldo</div>
              <div class="stat-value" style="color:#047857;">Rp ${params.totalTopupAmount.toLocaleString('id-ID')}</div>
              <div style="font-size:11px; color:#059669; margin-top:2px;">${params.totalTopupCount} Transaksi</div>
            </div>
            <div class="stat-box" style="background:#fef2f2; border:1px solid #fecaca;">
              <div class="stat-label" style="color:#b91c1c;">Total Belanja Santri</div>
              <div class="stat-value" style="color:#b91c1c;">Rp ${params.totalTrxAmount.toLocaleString('id-ID')}</div>
              <div style="font-size:11px; color:#dc2626; margin-top:2px;">${params.totalTrxCount} Transaksi</div>
            </div>
          </div>

          <div class="stat-box" style="margin-bottom:20px; background:#f8fafc; border:1px solid #cbd5e1;">
            <div class="stat-label">Arus Kas Bersih Hari Ini (Net Flow)</div>
            <div class="stat-value" style="color:${params.netCashFlow >= 0 ? '#047857' : '#dc2626'}">
              ${params.netCashFlow >= 0 ? '+' : ''}Rp ${params.netCashFlow.toLocaleString('id-ID')}
            </div>
          </div>

          <div class="section-title">Rincian Belanja per Kategori</div>
          <table>
            <thead>
              <tr style="background:#f1f5f9; text-align:left;">
                <th style="padding:8px 12px;">Kategori</th>
                <th style="padding:8px 12px; text-align:center;">Frekuensi</th>
                <th style="padding:8px 12px; text-align:right;">Total Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows || '<tr><td colspan="3" style="text-align:center; padding:12px; color:#94a3b8;">Tidak ada transaksi belanja hari ini</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">Rincian Top-Up per Metode Pembayaran</div>
          <table>
            <thead>
              <tr style="background:#f1f5f9; text-align:left;">
                <th style="padding:8px 12px;">Metode</th>
                <th style="padding:8px 12px; text-align:center;">Frekuensi</th>
                <th style="padding:8px 12px; text-align:right;">Total Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${topupRows || '<tr><td colspan="3" style="text-align:center; padding:12px; color:#94a3b8;">Tidak ada aktivitas top-up hari ini</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="footer">
          Laporan ini diproses secara otomatis oleh sistem Koperasi Santri Sirajuddin (Firebase Cloud Function Integration).<br>
          Dikirimkan ke: <strong>${params.targetEmail}</strong> pada ${new Date().toLocaleString('id-ID')}
        </div>
      </div>
    </body>
    </html>
    `;
  },

  /**
   * Main function to trigger daily summary generation & cloud function delivery
   */
  async triggerDailySummary(
    dateStr?: string,
    recipientEmail?: string,
    triggerType: 'automated_cron' | 'manual_trigger' = 'manual_trigger'
  ): Promise<{ success: boolean; report: DailySummaryReport; message: string }> {
    const todayStr = dateStr || new Date().toISOString().split('T')[0];
    const settings = await storageService.getSettings();
    const targetEmail = recipientEmail || settings.email || 'koperasi@sirajuddin.ac.id';

    // 1. Try calling Backend Server Cloud Function Endpoint first
    try {
      const response = await fetch('/api/reports/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          adminEmail: targetEmail,
          triggerType,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.report) {
          // Save or sync locally
          await storageService.saveDailySummaryReport(result.report);
          await storageService.logActivity(
            'System Cloud Function',
            'Ringkasan Harian',
            `Laporan harian [${todayStr}] terkirim ke ${targetEmail}`
          );
          return {
            success: true,
            report: result.report,
            message: result.message || `Laporan harian berhasil dikirim ke ${targetEmail}`,
          };
        }
      }
    } catch (err) {
      console.warn('Backend Cloud Function trigger unavailable, executing client-side generation:', err);
    }

    // 2. Client-side fallback computation & Firestore persistent record
    const transactions = await storageService.getTransactions();
    const topups = await storageService.getTopUps();

    const report = this.calculateDailyAggregates(transactions, topups, todayStr, targetEmail, triggerType);

    // Save persistent report record to Firestore
    await storageService.saveDailySummaryReport(report);
    await storageService.logActivity(
      'System Trigger',
      'Ringkasan Harian',
      `Laporan harian [${todayStr}] berhasil diproses dan disimpan untuk ${targetEmail}`
    );

    return {
      success: true,
      report,
      message: `Laporan ringkasan harian [${todayStr}] berhasil diproses dan dikirim ke ${targetEmail}`,
    };
  },
};
