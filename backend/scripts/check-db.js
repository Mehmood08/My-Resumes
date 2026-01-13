import mongoose from 'mongoose';
import Resume from '../models/Resume.js';
import User from '../models/User.js'; // Import User model
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app';

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB...');

        // 1. Check Users
        console.log('\n--- USERS ---');
        const users = await User.find();
        if (users.length === 0) console.log("No users found.");
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [GoogleID: ${u.googleId}]`);
        });

        // 2. Check Resumes
        console.log('\n--- RESUMES ---');
        const resumes = await Resume.find();
        console.log(`Found ${resumes.length} resume(s):`);
        resumes.forEach(r => {
            console.log(`- [${r.id}] ${r.title} (${r.date}) [Owner: ${r.userId || 'Public'}]`);
        });

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
