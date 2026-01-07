import mongoose from 'mongoose';
import Resume from '../models/Resume.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app')
    .then(async () => {
        console.log('Connected. Clearing database...');
        const result = await Resume.deleteMany({});
        console.log(`Deleted ${result.deletedCount} resumes.`);
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
