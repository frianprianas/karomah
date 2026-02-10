
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IJurnal extends Document {
    nis: string;
    tgl_jurnal: number;
    jam_bangun: string;
    sahur: boolean;
    sholat_wajib: {
        subuh: boolean;
        dhuhur: boolean;
        ashar: boolean;
        magrib: boolean;
        isya: boolean;
    };
    sholat_sunah: {
        rawatib: boolean;
        dhuha: boolean;
        tarawih: boolean;
        tahajud: boolean;
        taubat: boolean;
        mutlak: boolean;
        hajat: boolean;
    };
    tadarus: {
        surat: string;
        ayat: string;
    };
    olah_raga: {
        ya_tidak: boolean;
        kegiatan: string;
    };
    bantu_ortu: {
        ya_tidak: boolean;
        kegiatan: string;
    };
    aktifitas_sosial: {
        ya_tidak: boolean;
        kegiatan: string;
    };
    catatan_ihsan: {
        sumber: string;
        isi: string;
    };
    jam_tidur: string;
    catatan_guru?: string;
}

const JurnalSchema: Schema = new Schema({
    nis: { type: String, required: true },
    tgl_jurnal: { type: Number, required: true, min: 1, max: 30 },
    jam_bangun: { type: String, default: '' },
    sahur: { type: Boolean, default: false },
    sholat_wajib: {
        subuh: { type: Boolean, default: false },
        dhuhur: { type: Boolean, default: false },
        ashar: { type: Boolean, default: false },
        magrib: { type: Boolean, default: false },
        isya: { type: Boolean, default: false }
    },
    sholat_sunah: {
        rawatib: { type: Boolean, default: false },
        dhuha: { type: Boolean, default: false },
        tarawih: { type: Boolean, default: false },
        tahajud: { type: Boolean, default: false },
        taubat: { type: Boolean, default: false },
        mutlak: { type: Boolean, default: false },
        hajat: { type: Boolean, default: false }
    },
    tadarus: {
        surat: { type: String, default: '' },
        ayat: { type: String, default: '' }
    },
    olah_raga: {
        ya_tidak: { type: Boolean, default: false },
        kegiatan: { type: String, default: '' }
    },
    bantu_ortu: {
        ya_tidak: { type: Boolean, default: false },
        kegiatan: { type: String, default: '' }
    },
    aktifitas_sosial: {
        ya_tidak: { type: Boolean, default: false },
        kegiatan: { type: String, default: '' }
    },
    catatan_ihsan: {
        sumber: { type: String, default: '' },
        isi: { type: String, default: '' }
    },
    jam_tidur: { type: String, default: '' },
    catatan_guru: { type: String, default: '' }
}, { timestamps: true });

JurnalSchema.index({ nis: 1, tgl_jurnal: 1 }, { unique: true });

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Jurnal;
}

const Jurnal: Model<IJurnal> = mongoose.models.Jurnal || mongoose.model<IJurnal>('Jurnal', JurnalSchema);

export default Jurnal;
