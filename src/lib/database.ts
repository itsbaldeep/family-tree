import mongoose from 'mongoose';

interface ConnectionStatus {
  isConnected?: number;
}

const connection: ConnectionStatus = {};

export async function connectToDatabase(): Promise<void> {
  // Check current connection state
  const currentState = mongoose.connection.readyState;
  
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (currentState === 1) {
    console.log('💾 Using existing database connection');
    return;
  }
  
  if (currentState === 2) {
    // Already connecting, wait for connection to complete
    console.log('⏳ Waiting for existing connection...');
    await new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('🔌 Connecting to MongoDB...');
    
    const db = await mongoose.connect(mongoUri, {
      bufferCommands: true, // Enable buffering to prevent the error
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    connection.isConnected = db.connections[0].readyState;
    
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events (only set up once)
    if (!mongoose.connection.listeners('error').length) {
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        connection.isConnected = 0;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🔌 MongoDB disconnected');
        connection.isConnected = 0;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('🔌 MongoDB connection closed through app termination');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error closing MongoDB connection:', error);
          process.exit(1);
        }
      });
    }

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    connection.isConnected = 0;
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = 0;
    console.log('🔌 MongoDB disconnected');
  }
}

export default mongoose;
