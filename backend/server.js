import { app, connectDB } from './app.js';

const PORT = process.env.PORT || 3001;

connectDB().catch((err) => {
    console.error('Initial DB connect failed. Will retry on request.', err.message);
});

app.listen(PORT, () => {
    console.log(`
    Backend is running!
    Port: ${PORT}
    URL: http://localhost:${PORT}
    `);
});
