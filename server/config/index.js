import mongoose from 'mongoose';
import adminSchema from '../models/Admin.js';

let adminConn;
export let Admin;

let connectionPromise = null;

export const connectDB = async () => {
    if (connectionPromise) return connectionPromise;

    connectionPromise = (async () => {
        try {
            const mongoOptions = {
                serverSelectionTimeoutMS: 15000, // Increased timeout to 15s to handle Vercel cold starts to Atlas
                socketTimeoutMS: 45000,
                // NOTE: forcing IPv4 may break connectivity if Atlas/your network expects IPv6.
                // Remove/adjust if you see IP whitelist errors that persist.
                // family: 4
            };

            // Log the host part only (helps confirm we are targeting the expected Atlas cluster)
            try {
                const uri = process.env.MONGO_URI || '';
                console.log(process.env.MONGO_URI ? 'MONGO_URI is set' : 'MONGO_URI is NOT set');
                const noCreds = uri.replace(/\/\/.*?@/, '//');
                const host = noCreds.split('/')[2];
                console.log(host.includes('uvcdzhq') ? 'ON SERVER DB' : `${host.includes('cioyswh') ? 'ON PROD DB' : 'UNKNOWN DB'}`);
                console.log(`Mongo current target host: ${host}`);
            } catch (e) {
                console.log('Mongo target host: (unavailable)');
            }

            const conn = await mongoose.connect(process.env.MONGO_URI, mongoOptions);
            console.log(`MongoDB Connected: ${conn.connection.host}`);


            const baseUri = process.env.MONGO_URI.includes('?') 
                ? process.env.MONGO_URI.split('?')[0]
                : process.env.MONGO_URI;
            
            const adminUri = baseUri.substring(0, baseUri.lastIndexOf('/')) + '/admin_db';
            const queryParams = process.env.MONGO_URI.includes('?') ? '?' + process.env.MONGO_URI.split('?')[1] : '';
            
            adminConn = mongoose.createConnection(adminUri + queryParams, mongoOptions);
            Admin = adminConn.model('Admin', adminSchema);
            
            console.log(`Admin Database Connected`);
            return { Admin };
        }catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
    console.error("CAUSE:", error.cause);
    process.exit(1);
}
    })();

    return connectionPromise;
};

export const getAdminModel = async () => {
    if (Admin) return Admin;
    await connectDB();
    // Wait slightly if still setting up
    for (let i = 0; i < 20; i++) {
        if (Admin) return Admin;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return Admin;
};

