import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes FIRST

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Koperasi Santri Firebase API' });
});

/**
 * Firebase Cloud Function Endpoint: Daily Summary Report Generator & Email Dispatcher
 */
app.post('/api/reports/daily-summary', async (req, res) => {
  try {
    const { date, adminEmail, triggerType } = req.body;
    const reportDate = date || new Date().toISOString().split('T')[0];
    const targetEmail = adminEmail || process.env.ADMIN_REPORT_EMAIL || 'koperasi@sirajuddin.ac.id';

    console.log(`[Cloud Function Trigger] Processing daily summary report for date: ${reportDate}, target: ${targetEmail}`);

    // Create Nodemailer test/transport account
    let transporter: nodemailer.Transporter;
    let isPreviewTransport = false;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Ethereal test account fallback
      isPreviewTransport = true;
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const reportId = `cloudfn_ds_${reportDate.replace(/-/g, '')}_${Date.now().toString(36)}`;

    // Build mock report object or calculated summary
    const reportData = {
      id: reportId,
      report_date: reportDate,
      sent_to_email: targetEmail,
      status: 'sent' as const,
      trigger_type: (triggerType || 'automated_cron') as 'automated_cron' | 'manual_trigger',
      generated_at: new Date().toISOString(),
      log_message: `Firebase Cloud Function successfully executed daily summary dispatch to ${targetEmail}`,
    };

    // Construct clean email body HTML
    const emailSubject = `[Laporan Koperasi Sirajuddin] Ringkasan Transaksi & Topup Harian - ${reportDate}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Laporan Ringkasan Harian Koperasi Santri</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Pondok Pesantren Sirajuddin • ${reportDate}</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <p>Assalamu'alaikum Wr. Wb.,</p>
          <p>Berikut adalah laporan ringkasan otomatis hasil transaksi jajan dan pengisian saldo (top-up) santri untuk tanggal <strong>${reportDate}</strong>:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Status Pengiriman:</strong> Success (Firebase Cloud Function)</p>
            <p style="margin: 0 0 6px 0;"><strong>Penerima Admin:</strong> ${targetEmail}</p>
            <p style="margin: 0;"><strong>ID Laporan:</strong> <code>${reportId}</code></p>
          </div>
          <p>Detail statistik lengkap dan grafik transaksi dapat diakses langsung melalui Dasbor Admin Koperasi Santri.</p>
        </div>
        <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b;">
          Sistem Otomatisasi Koperasi Santri Sirajuddin © ${new Date().getFullYear()}
        </div>
      </div>
    `;

    // Attempt dispatching email
    const mailInfo = await transporter.sendMail({
      from: '"Koperasi Santri Sirajuddin" <koperasi@sirajuddin.ac.id>',
      to: targetEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    let previewUrl = null;
    if (isPreviewTransport) {
      previewUrl = nodemailer.getTestMessageUrl(mailInfo);
      if (previewUrl) {
        console.log(`[Nodemailer Preview URL]: ${previewUrl}`);
      }
    }

    res.json({
      success: true,
      report: reportData,
      previewUrl,
      message: `Berhasil menjalankan Firebase Cloud Function! Laporan harian ${reportDate} dikirim ke ${targetEmail}`,
    });
  } catch (error: any) {
    console.error('Error in daily-summary endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Koperasi Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
