import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Book from './models/Book.js';
import Author from './models/Author.js';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/parcial');

// Middleware de autenticación
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ error: 'Por favor, autentíquese.' });
    }
    try {
        const decoded = jwt.verify(token, 'secretKey');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Por favor, autentíquese.' });
    }
};

// Rutas de usuarios
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        user.password = await bcrypt.hash(user.password, 8);
        await user.save();
        const token = jwt.sign({ _id: user._id.toString() }, 'secretKey');
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/users/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !await bcrypt.compare(req.body.password, user.password)) {
            throw new Error('Credenciales inválidas');
        }
        const token = jwt.sign({ _id: user._id.toString() }, 'secretKey');
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ error: 'No se pudo iniciar sesión' });
    }
});

// Rutas de libros
app.post('/books', auth, async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).send(book);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).send(books);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send();
        }
        res.status(200).send(book);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.patch('/books/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).send();
        }
        res.status(200).send(book);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/books/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).send();
        }
        res.status(200).send(book);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Rutas de autores
app.post('/authors', auth, async (req, res) => {
    try {
        const author = new Author(req.body);
        await author.save();
        res.status(201).send(author);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/authors', async (req, res) => {
    try {
        const authors = await Author.find();
        res.status(200).send(authors);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/authors/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        if (!author) {
            return res.status(404).send();
        }
        res.status(200).send(author);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.patch('/authors/:id', auth, async (req, res) => {
    try {
        const author = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!author) {
            return res.status(404).send();
        }
        res.status(200).send(author);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/authors/:id', auth, async (req, res) => {
    try {
        const author = await Author.findByIdAndDelete(req.params.id);
        if (!author) {
            return res.status(404).send();
        }
        res.status(200).send(author);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});