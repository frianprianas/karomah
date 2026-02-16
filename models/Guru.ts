
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGuru extends Document {
    nipy: string;
    nama: string;
    ket: string;
    password: string;
    waliKelas?: string; // Menyimpan nama kelas jika guru ini adalah wali kelas
    foto?: string;
    noHp?: string;
    status?: string;
    statusUpdatedAt?: Date;
    emailPribadi?: string;
    statusBannedUntil?: Date;
}

const GuruSchema: Schema = new Schema({
    nipy: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    ket: { type: String },
    password: { type: String, required: true },
    waliKelas: { type: String, index: true }, // Optional, hanya diisi jika wali kelas
    foto: { type: String },
    noHp: { type: String },
    status: { type: String },
    statusUpdatedAt: { type: Date },
    emailPribadi: { type: String },
    statusBannedUntil: { type: Date }
});

// Prevent Mongoose from using a stale cached model in development
if (process.env.NODE_ENV !== 'production' && mongoose.models.Guru) {
    delete mongoose.models.Guru;
}

const Guru: Model<IGuru> = mongoose.models.Guru || mongoose.model<IGuru>('Guru', GuruSchema);

export default Guru;
