// routes/todos.router.js
import express from 'express';
import Todo from '../schemas/todo.schema.js';
import joi from 'joi';

const router = express.Router();
const createdTodoSchema = joi.object({
    value: joi.string().min(1).max(50).required(),
})
const passwordJoiSchema = joi.object({
    password: joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).message('비밀번호는 8자 이상'),
})

// 저장 : POST API / await 모델.save();
router.post('/todos', async (req, res, next) => {
    // 클라이언트에게 전달받은 value 데이터를 변수에 저장합니다.
    //const { value } = req.body;

    try {
        const validation = await createdTodoSchema.validateAsync(req.body);
        const { value } = validation;

        if (!value) return res.status(400).json({ errorMessage: "입력데이터 없음" });

        // Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
        const todoMaxOrder = await Todo.findOne().sort('-order').exec();

        // 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
        const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

        // Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.
        const todo = new Todo({ value, order });

        // 생성한 '해야할 일'을 MongoDB에 저장합니다.
        await todo.save();

        return res.status(201).json({ todo });
    } catch (error) {
        next(error);
    }
});

// 조회 : GET API / await [모델].find().exec();
router.get('/todos', async (req, res) => {
    // Todo모델을 이용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
    const todos = await Todo.find().sort('-order').exec();

    // 찾은 '해야할 일'을 클라이언트에게 전달합니다.
    return res.status(200).json({ todos });
});

// 수정 : patch API
router.patch('/todos/:todoId', async (req, res) => {
    const { todoId } = req.params;
    const { order, done, value } = req.body;
    const currentTodo = await Todo.findById(todoId).exec();
    if (!currentTodo) return res.status(404).json({ errorMessage: "존재하지 않는 해야할 일" });

    if (order) {
        const targetTodo = await Todo.findOne({ order: order }).exec();
        if (targetTodo) {
            targetTodo.order = currentTodo.order;
            await targetTodo.save();
        }

        currentTodo.order = order;
    }

    if (done !== undefined) {
        currentTodo.doneAt = done ? new Date() : null;
    }

    if (value) {
        currentTodo.value = value;
    }

    await currentTodo.save();

    return res.status(200).json({ currentTodo });
});

// 삭제 : delete API - await [모델].deleteOne();
router.delete('/todos/:todoId', async (req, res) => {
    const { todoId } = req.params;
    const todo = await Todo.findById(todoId).exec();
    if (!todo) return res.status(404).json({ errorMessage: "찾을 수 없습니다." });

    await Todo.deleteOne({ _id: todoId });

    return res.status(200).json({});
})

export default router;