
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISiswa extends Document {
    nis: string;
    nama: string;
    kelas: string;
    password: string;
    foto?: string;
    noHp?: string;
    status?: string;
    statusUpdatedAt?: Date;
    emailPribadi?: string;
    statusBannedUntil?: Date;
}

const SiswaSchema: Schema = new Schema({
    nis: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    kelas: { type: String, required: true },
    password: { type: String, required: true },
    foto: { type: String },
    noHp: { type: String },
    status: { type: String },
    statusUpdatedAt: { type: Date },
    emailPribadi: { type: String },
    statusBannedUntil: { type: Date }
});

// Prevent Mongoose from using a stale cached model in development
if (process.env.NODE_ENV !== 'production' && mongoose.models.Siswa) {
    delete mongoose.models.Siswa;
}

// Check if model already exists to prevent overwrite in development
const Siswa: Model<ISiswa> = mongoose.models.Siswa || mongoose.model<ISiswa>('Siswa', SiswaSchema);

export default Siswa;
