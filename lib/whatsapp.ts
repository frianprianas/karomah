
export async function sendWhatsAppOTP(target: string, otp: string) {
    const token = 'KQ1XKbd2ZHue4cn9e7hc';

    // Format number: replace leading 0 with 62
    let formattedTarget = target.trim();
    if (formattedTarget.startsWith('0')) {
        formattedTarget = '62' + formattedTarget.substring(1);
    }
    // Remove all non-numeric characters just in case
    formattedTarget = formattedTarget.replace(/\D/g, '');

    const message = `*KODE VERIFIKASI ADMIN KAROMAH*\n\nAssalamu'alaikum,\n\nBerikut adalah kode OTP Anda untuk masuk ke Panel Administrasi:\n\n*${otp}*\n\nKode ini berlaku selama *10 menit*. Mohon jangan sebarkan kode ini kepada siapapun.\n\n_SMK Bakti Nusantara 666_`;

    try {
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': token
            },
            body: new URLSearchParams({
                'target': formattedTarget,
                'message': message,
                'countryCode': '62'
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('WhatsApp sending error:', error);
        throw error;
    }
}

export async function sendWhatsAppMessage(target: string, message: string) {
    const token = 'KQ1XKbd2ZHue4cn9e7hc';

    let formattedTarget = target.trim();
    if (formattedTarget.startsWith('0')) {
        formattedTarget = '62' + formattedTarget.substring(1);
    }
    formattedTarget = formattedTarget.replace(/\D/g, '');

    try {
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': token
            },
            body: new URLSearchParams({
                'target': formattedTarget,
                'message': message,
                'countryCode': '62'
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('WhatsApp sending error:', error);
        throw error;
    }
}
