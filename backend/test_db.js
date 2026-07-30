import mongoose from 'mongoose';

// Pass credentials as separate options to avoid any URI encoding issues
async function test() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/resumes', {
            auth: {
                username: 'admin',
                password: 'sViJat1^@23'
            },
            authSource: 'admin',
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ SUCCESS: Connected to MongoDB!');
        process.exit(0);
    } catch (err) {
        console.error('❌ FAILURE:', err.message);
        process.exit(1);
    }
}

test();
