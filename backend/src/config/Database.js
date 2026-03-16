import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('❌ MONGO_URI chưa được khai báo trong .env');
    }

    await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // dừng app nếu kết nối DB lỗi
  }
}
