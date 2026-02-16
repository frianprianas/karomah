
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'mail.smk.baktinusantara666.sch.id',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'admin@smk.baktinusantara666.sch.id',
        pass: 'On5laught?!',
    },
});

export async function sendOTP(to: string, otp: string) {
    const info = await transporter.sendMail({
        from: '"Karomah Admin Security" <admin@smk.baktinusantara666.sch.id>',
        to: to,
        subject: "Kode Verifikasi Keamanan Admin (OTP)",
        html: `
            <div style="font-family: 'Serif', 'Palatino Linotype', serif; background-color: #fdfbf7; padding: 20px; border: 2px solid #8d6e63; color: #3e2723;">
                <h2 style="border-bottom: 2px solid #8d6e63; padding-bottom: 10px; text-align: center;">Konfirmasi Keamanan Karomah</h2>
                <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                <p>Berikut adalah kode OTP Anda untuk masuk ke Panel Administrasi:</p>
                <div style="background-color: #5d4037; color: #fdfbf7; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
                    ${otp}
                </div>
                <p>Kode ini berlaku selama <strong>10 menit</strong>. Mohon segera masukkan kode ini pada halaman verifikasi.</p>
                <p style="font-style: italic; font-size: 12px; color: #8d6e63; margin-top: 30px; border-top: 1px dashed #d7ccc8; pt-10;">
                    Catatan: Jika email ini masuk ke folder <strong>SPAM</strong>, harap pindahkan ke Inbox atau tandai sebagai "Bukan Spam". Terima kasih.
                </p>
                <p style="text-align: center; font-size: 11px; color: #795548; margin-top: 20px;">
                    &copy; 1447 H - SMK Bakti Nusantara 666
                </p>
            </div>
        `,
    });
    return info;
}
