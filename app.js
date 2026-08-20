const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
const getPosts = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const savePosts = (posts) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
};

// Routes - Public
app.get('/', (req, res) => {
  const posts = getPosts();
  res.render('index', { posts });
});

app.get('/post/:id', (req, res) => {
  const posts = getPosts();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send('Post not found');
  res.render('post', { post });
});

// Routes - Admin
app.get('/admin', (req, res) => {
  const posts = getPosts();
  res.render('admin', { posts });
});

app.post('/admin/create', (req, res) => {
  const { title, author, content } = req.body;
  const posts = getPosts();
  const newPost = {
    id: Date.now().toString(),
    title,
    author,
    date: new Date().toISOString().split('T')[0],
    content
  };
  posts.unshift(newPost);
  savePosts(posts);
  res.redirect('/admin');
});

app.get('/admin/edit/:id', (req, res) => {
  const posts = getPosts();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send('Post not found');
  res.render('edit', { post });
});

app.post('/admin/edit/:id', (req, res) => {
  const { title, author, content } = req.body;
  let posts = getPosts();
  posts = posts.map(p => p.id === req.params.id ? { ...p, title, author, content } : p);
  savePosts(posts);
  res.redirect('/admin');
});

app.post('/admin/delete/:id', (req, res) => {
  let posts = getPosts();
  posts = posts.filter(p => p.id !== req.params.id);
  savePosts(posts);
  res.redirect('/admin');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
