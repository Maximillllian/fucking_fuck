const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 9090;

// Для работы с JSON
app.use(express.json());

// Хранение пользователей в оперативной памяти
let users = [];
const USERS = []
let userIdCounter = 1;

// Регулярные выражения для валидации:
// Для полей "Фамилия" и "Имя" – разрешены только кириллица и дефис.
const cyrillicHyphenRegex = /^[А-Яа-яЁё-]+$/;
// Для поля "Отчество" – разрешена только кириллица.
const cyrillicRegex = /^[А-Яа-яЁё]+$/;

// Эндпоинт регистрации пользователя
app.post(
  '/api/register',
  [
    // Валидация поля surname (фамилия)
    body('surname')
      .exists({ checkFalsy: true })
      .withMessage('Поля фамилия, имя и email обязательны для заполнения.')
      .isLength({ min: 3, max: 50 })
      .withMessage('Фамилия должна быть от 3 до 50 символов.')
      .matches(cyrillicHyphenRegex)
      .withMessage('Фамилия может содержать только кириллицу и дефис.'),

    // Валидация поля name (имя)
    body('name')
      .exists({ checkFalsy: true })
      .withMessage('Поля фамилия, имя и email обязательны для заполнения.')
      .isLength({ min: 3, max: 50 })
      .withMessage('Имя должно быть от 3 до 50 символов.')
      .matches(cyrillicHyphenRegex)
      .withMessage('Имя может содержать только кириллицу и дефис.'),

    // Валидация поля second_name (отчество) – необязательное поле
    body('second_name')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Отчество должно быть от 3 до 50 символов.')
      .matches(cyrillicRegex)
      .withMessage('Отчество может содержать только кириллицу.'),

    // Валидация поля phone – необязательное поле, если указано должно состоять ровно из 11 цифр
    body('phone')
      .optional()
      .matches(/^\d{11}$/)
      .withMessage('Телефон должен содержать только 11 цифр.'),

    // Валидация поля email – обязательное поле и стандартный формат email
    body('email')
      .exists({ checkFalsy: true })
      .withMessage('Поля фамилия, имя и email обязательны для заполнения.')
      .isEmail()
      .withMessage('Некорректный формат email.')
  ],
  (req, res) => {
    // Проверка результатов валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Возвращаем первую ошибку валидации
      const errorMsg = errors.array()[0].msg;
      return res.status(400).json({ error: errorMsg });
    }

    // Деструктуризация данных из запроса
    const { surname, name, second_name, phone, email } = req.body;

    // Создание нового пользователя
    const newUser = {
      user_id: userIdCounter++,
      surname,
      name,
      // Если отчество не указано, возвращаем пустую строку
      patronymic: second_name || "",
      // Если телефон не указан – пустая строка
      phone: phone || "",
      email
    };

    // Добавляем пользователя в массив
    users.push(newUser);

    // Возвращаем успешный ответ
    return res.status(201).json({
      message: "Пользователь успешно зарегистрирован.",
      user_id: newUser.user_id
    });
  }
);

// Эндпоинт для получения информации о конкретном пользователе по ID
app.get('/api/user/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find(u => u.user_id === userId);

  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден." });
  }
  return res.status(200).json(user);
});

// Эндпоинт для получения списка всех пользователей
app.get('/api/users', (req, res) => {
    const staticUsers = [
      {
        user_id: 1,
        surname: "Иванов",
        name: "Иван",
        patronymic: "Иванович",
        phone: "",
        email: "ivanov@example.com"
      },
      {
        user_id: 2,
        surname: "Петров",
        name: "Петр",
        patronymic: "",
        phone: "+79991234568",
        email: "petrov@example.com"
      },
      {
        user_id: 3,
        surname: "Сидоров",
        name: "Сидор",
        patronymic: "",
        phone: "",
        email: "sidorov@example.com"
      }
    ];
    res.status(200).json(staticUsers);
});

// Запуск сервера на порту 9090
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
