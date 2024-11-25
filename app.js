import express from 'express';
import connect from './schemas/index.js';
import TodosRouter from './routes/todos.router.js';
// app.js

import ErrorHandlerMiddleware from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3000;
const router = express.Router();

connect();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('./assets'));
app.use('/api', [router, TodosRouter]);

// 에러 핸들링 미들웨어를 등록합니다. 라우터 다음에 정의되어 있어야 라우터에서 발생한 에러가 전달됨.
app.use(ErrorHandlerMiddleware);

router.get('/', (req, res) => {
  return res.json({ message: "Hello" });
});


app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});

