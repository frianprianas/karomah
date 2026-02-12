import mongoose, { Schema, Document } from 'mongoose';

export interface ITanyaJawab extends Document {
    nis_siswa: string;
    nama_siswa: string;
    kelas_siswa: string;
    id_guru: string; // Bisa NIPY atau ID object, kita pakai NIPY untuk konsistensi
    nama_guru: string;
    pertanyaan: string;
    jawaban: string;
    status: 'menunggu' | 'dijawab';
    createdAt: Date;
    answeredAt: Date;
}

const TanyaJawabSchema: Schema = new Schema({
    nis_siswa: { type: String, required: true },
    nama_siswa: { type: String, required: true },
    kelas_siswa: { type: String, required: true },
    id_guru: { type: String, required: true },
    nama_guru: { type: String, required: true },
    pertanyaan: { type: String, required: true, maxlength: 500 },
    jawaban: { type: String, default: '' },
    status: { type: String, enum: ['menunggu', 'dijawab'], default: 'menunggu' },
    createdAt: { type: Date, default: Date.now },
    answeredAt: { type: Date }
}, {
    timestamps: true
});

export default mongoose.models.TanyaJawab || mongoose.model<ITanyaJawab>('TanyaJawab', TanyaJawabSchema);
