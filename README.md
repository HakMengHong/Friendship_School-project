# 🏫 Friendship School Management System

A comprehensive, modern school management system built with Next.js, TypeScript, and PostgreSQL. Features include student management, attendance tracking, grade management, PDF report generation, and more.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎓 **Student Management**
- Student registration and profile management
- Class enrollment and scheduling
- Student ID card generation
- Academic progress tracking

### 📊 **Attendance System**
- Daily attendance tracking
- Monthly and semester reports
- Attendance analytics and insights
- Automated report generation

### 📈 **Grade Management**
- Grade entry and management
- Gradebook functionality
- Performance analytics
- Report card generation

### 📋 **Report Generation**
- Student registration forms
- Attendance reports (daily, monthly, semester, yearly)
- Grade reports and transcripts
- Government compliance reports
- Bulk PDF generation

### 🎨 **Modern UI/UX**
- Responsive design with glassmorphism effects
- Dark/light mode support
- Khmer language support
- Smooth animations and transitions
- Mobile-optimized interface

### 🔐 **Security & Authentication**
- Secure user authentication
- Role-based access control
- Session management
- Password protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/friendship-school-project.git
   cd friendship-school-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp production.env .env
   # Edit .env with your database credentials
   ```

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 🐳 Docker Deployment

### Quick Deploy to Ubuntu Server

1. **Upload project to server**
   ```bash
   scp -r * user@your-server-ip:/opt/friendship-school/
   ```

2. **Run deployment script**
   ```bash
   ssh user@your-server-ip
   cd /opt/friendship-school
   chmod +x deploy.sh
   ./deploy.sh
   ```

The deployment script will automatically:
- Install Docker and Docker Compose
- Configure environment variables
- Build and deploy the application
- Setup SSL certificates (if domain provided)
- Configure firewall and backups

### Manual Docker Setup

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

## 📁 Project Structure

```
friendship-school-project/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── dashboard/                # Dashboard pages
│   ├── attendance/               # Attendance management
│   ├── grade/                    # Grade management
│   └── student-info/             # Student information
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Layout components
│   └── navigation/               # Navigation components
├── lib/                          # Utility libraries
│   ├── pdf-generators/           # PDF generation system
│   ├── auth-service.ts           # Authentication service
│   └── prisma.ts                 # Database client
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
├── scripts/                      # Utility scripts
└── docs/                         # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Chart.js** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit and ORM
- **PostgreSQL** - Robust relational database
- **bcryptjs** - Password hashing
- **Puppeteer** - PDF generation

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **Let's Encrypt** - SSL certificates
- **GitHub Actions** - CI/CD pipeline

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - System users (admins, teachers)
- **Students** - Student information and profiles
- **Subjects** - Academic subjects
- **Courses** - Class courses
- **Grades** - Student grades and assessments
- **Attendance** - Daily attendance records
- **Enrollments** - Student course enrollments

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/friendship_school"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Application
NODE_ENV="production"
PORT=3000
```

### Docker Configuration

The project includes production-ready Docker configuration:

- **Multi-stage Dockerfile** for optimized builds
- **Docker Compose** for service orchestration
- **Health checks** for service monitoring
- **Volume mounts** for data persistence

## 📱 Features Overview

### Dashboard
- Modern analytics dashboard
- Real-time statistics
- Quick access to key features
- Responsive design

### Student Management
- Student registration forms
- Profile management
- ID card generation
- Academic tracking

### Attendance System
- Daily attendance marking
- Bulk attendance entry
- Attendance reports
- Analytics and insights

### Grade Management
- Grade entry interface
- Gradebook functionality
- Performance tracking
- Report generation

### PDF Reports
- Student registration forms
- Attendance reports (multiple formats)
- Grade reports and transcripts
- Government compliance documents
- Bulk PDF generation

## 🚀 Deployment Options

### 1. Docker (Recommended)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Manual Deployment
Follow the detailed guide in `UBUNTU_DEPLOYMENT_GUIDE.md`

### 3. Vercel/Netlify
```bash
npm run build
npm run start
```

## 📚 Documentation

- **[Deployment Guide](UBUNTU_DEPLOYMENT_GUIDE.md)** - Complete Ubuntu server deployment
- **[API Documentation](docs/)** - API endpoints and usage
- **[Database Schema](docs/DATABASE_ARCHITECTURE.md)** - Database structure
- **[Development Setup](docs/DEVELOPMENT_SETUP_ARCHITECTURE.md)** - Local development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/friendship-school-project/issues)
- **Documentation**: [Project Docs](docs/)
- **Email**: support@friendship-school.com

## 🙏 Acknowledgments

- Built for Friendship School
- Special thanks to the development team
- Inspired by modern school management needs

---

**Made with ❤️ for better education management**