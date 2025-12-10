
⭐ Developer Portfolio — Full Stack (React + Node + Supabase)

A modern and responsive full-stack developer portfolio built with React, Vite, TailwindCSS, ShadCN UI, and a Node + Supabase backend.
Includes an Admin Dashboard to manage portfolio content (projects, skills, hero section, messages, and more).

🚀 Features
🎨 Frontend (React + Vite)

Modern UI built with TailwindCSS + ShadCN components

Fully responsive design

Smooth animations

Sections included:

Hero section

About

Skills

Projects

Experience

Contact

Social links

Reusable UI components

Chat widget button

Clean routing with React Router

🛠 Backend (Node + Supabase)

Supabase PostgreSQL database

Secure RLS (Row Level Security) policies

CRUD API for:

Projects

Experience

Skills

About section

Contact form messages

Authentication for Admin Dashboard

Image uploads via Supabase Storage

Server components:

Express API

Supabase client

Middleware for auth

Error handling

🔐 Admin Dashboard

Login system for admin

Add / update:

Projects

Skills

Experience

About section

Social links

Upload project screenshots

Read and manage user messages

Clean UI built with ShadCN

📁 Project Structure
project/
│
├── src/                     # Frontend (React + Vite)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   └── App.jsx
│
├── Server/                  # Backend (Node + Supabase)
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── migrations/              # SQL migration scripts
├── supabase/                # SQL policies, schema, RLS files
├── public/
│
├── .env                     # Environment variables (ignored)
├── .gitignore
├── README.md
├── package.json
└── vite.config.js

🔧 Technologies Used
Frontend

React

Vite

TailwindCSS

ShadCN/UI

React Router

Lucide Icons

Backend

Node.js

Express

Supabase (Database + Auth + Storage)

PostgreSQL
