
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISiswa extends Document {
    nis: string;
    nama: string;
    kelas: string;
    password: string;
}

const SiswaSchema: Schema = new Schema({
    nis: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    kelas: { type: String, required: true },
    password: { type: String, required: true },
});

// Check if model already exists to prevent overwrite in development
const Siswa: Model<ISiswa> = mongoose.models.Siswa || mongoose.model<ISiswa>('Siswa', SiswaSchema);

export default Siswa;
