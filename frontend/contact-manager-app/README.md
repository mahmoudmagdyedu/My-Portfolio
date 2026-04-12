# 📇 ContactHub — Contact Manager App

A modern, feature-rich contact management SPA demonstrating **Angular-inspired architecture** patterns — component-based design, service layer, client-side routing, reactive form validation, and state management.

Built with **vanilla JavaScript** (Angular-inspired patterns) and **Tailwind CSS**.

## 🌐 Live Demo

👉 [**ContactHub Live**](https://my-portfolio-mahmoud.herokuapp.com/frontend/contact-manager-app/)

## 📸 Screenshots

| Contact List | Contact Detail | Add / Edit Form |
|---|---|---|
| ![List](docs/screenshot-list.png) | ![Detail](docs/screenshot-detail.png) | ![Form](docs/screenshot-form.png) |

## ✨ Features

- **Full CRUD** — Create, read, update and delete contacts
- **Hash-based Routing** — Client-side navigation with parameterized routes (`/contacts/:id`)
- **Reactive Form Validation** — Real-time validation with custom rules (required, email, phone, minLength)
- **Smart Search** — Instant search across name, email and company
- **Category Filtering** — Filter by Work, Personal, Family or Other
- **Favorites** — Star/unstar important contacts
- **Service Layer** — Centralized data management via `ContactService`
- **Local Storage** — Persistent data across browser sessions
- **Responsive Design** — Mobile-first with Tailwind CSS
- **Seed Data** — Pre-loaded sample contacts

## 🛠️ Architecture (Angular-Inspired)

| Concept | Implementation |
|---|---|
| Components | `renderContactList()`, `renderContactForm()`, `renderContactDetail()`, `renderNavbar()` |
| Services | `ContactService` singleton with CRUD + search + localStorage |
| Models | `Contact` class with computed properties (`fullName`, `initials`) |
| Routing | `Router` class with hash-based navigation & route params |
| Forms | `FormValidator` with declarative rules & real-time feedback |
| State | Service-driven reactivity with re-render on data change |

## 📁 Project Structure

```
contact-manager-app/
├── index.html          # Entry point + Tailwind CSS
├── app.js              # Full SPA (components, services, router, forms)
├── README.md           # This file
└── docs/               # Screenshots (placeholders)
```

## 🚀 Getting Started

```bash
# From the monorepo root
npx http-server frontend/contact-manager-app -p 3000
# Open http://localhost:3000
```

Or simply open `index.html` in your browser.

## 📚 Angular Concepts Demonstrated

### 1. Component-Based Architecture
Each view is a self-contained "component" function that manages its own rendering and event binding.

### 2. Service Layer (Dependency Injection Pattern)
`ContactService` centralizes all data operations — CRUD, search, filtering, and localStorage persistence.

### 3. Client-Side Routing
`Router` class handles hash-based navigation with support for parameterized routes (`:id`) and route resolution.

### 4. Reactive Forms & Validation
`FormValidator` implements declarative validation rules with real-time error feedback, similar to Angular’s `ReactiveFormsModule`.

### 5. Models with Computed Properties
`Contact` class uses getters for computed values (`fullName`, `initials`), mirroring Angular model patterns.

## 🗺️ Roadmap

- [ ] Export contacts as vCard / CSV
- [ ] Contact groups / tags
- [ ] Profile image upload
- [ ] Dark mode toggle
- [ ] Sort contacts by name, date, or company
- [ ] Bulk select & delete
- [ ] Migrate to full Angular CLI project

## 📝 License

MIT — feel free to use and modify.

---

Built with ❤️ by [Mahmoud Magdy](https://github.com/mahmoudmagdyedu)
