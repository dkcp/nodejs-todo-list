import mongoose from 'mongoose';

const connect = () => {
  mongoose.connect(
      'mongodb+srv://dwook1637:VA677ZGz4lZCajNE@spartadb.zjhjn.mongodb.net/?retryWrites=true&w=majority&appName=spartaDB',
      {
        dbName: 'todo_memo',
      },
    )
    .then(() => console.log('MongoDB 연결에 성공하였습니다.'))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 에러', err);
});

export default connect;