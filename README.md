# 🏥 Healthcare Microservices System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2+-green)](https://www.djangoproject.com/)

A comprehensive healthcare management system built with microservices architecture, providing secure and efficient services for patients, healthcare providers, and administrators.

## 🌟 Features

### Core Functionality
- **Role-Based Access Control** for patients, doctors, nurses, pharmacists, lab technicians, and administrators
- **Electronic Health Records (EHR)** with comprehensive patient history
- **Appointment Scheduling** with availability management and reminders
- **Prescription Management** and pharmacy inventory control
- **Laboratory Services** for test orders, sample collection, and result management
- **Billing and Insurance Claims** processing
- **Real-time Notifications** via WebSocket and email/SMS
- **AI Health Assistant** for 24/7 patient support
- **Secure Patient-Doctor Chat** for direct communication

### Technical Features
- Microservices architecture for scalability and maintainability
- RESTful APIs with OpenAPI/Swagger documentation
- Real-time communication using WebSocket
- Secure authentication and authorization
- Containerized deployment with Docker
- Message queue for asynchronous processing
- Distributed tracing and monitoring
- Automated testing and CI/CD pipeline

## 🏗️ System Architecture

```
healthcare-microservices/
├── README.md                       # Project documentation
├── .env.example                    # Environment variables template
├── docker-compose.yml              # Container orchestration
├── docs/                           # Documentation
│   ├── architecture.md             # System architecture details
│   ├── analysis-and-design.md      # System analysis and design
│   ├── assets/                     # Visual assets
│   │   ├── images/                # Generated diagrams
│   │   └── puml/                  # PlantUML source files
│   └── api-specs/                  # OpenAPI specifications
├── scripts/                        # Utility scripts
│   └── generate_diagrams.sh        # Diagram generation script
├── services/                       # Microservices
│   ├── user-service/               # Authentication and user management
│   ├── medical-record-service/     # Patient medical records
│   ├── appointment-service/        # Appointment scheduling
│   ├── pharmacy-service/          # Prescription and pharmacy management
│   ├── laboratory-service/        # Laboratory tests and results
│   ├── billing-service/           # Billing and insurance claims
│   ├── notification-service/      # Notifications and alerts
│   └── common-auth/               # Shared authentication library
└── api-gateway/                    # API Gateway for service routing
```

## 🛠️ Technology Stack

| Service | Description | Technologies |
|---------|-------------|--------------|
| API Gateway | Request routing, authentication, rate limiting | Node.js, Express |
| User Service | User management, authentication, profiles | Django, DRF, PostgreSQL |
| Medical Record Service | Patient records, consultations, diagnoses | Django, DRF, PostgreSQL |
| Appointment Service | Appointments, doctor availability | Django, DRF, PostgreSQL |
| Pharmacy Service | Prescriptions, pharmacy inventory | Django, DRF, PostgreSQL |
| Laboratory Service | Test requests, sample collection, results | Django, DRF, PostgreSQL |
| Billing Service | Invoicing, payments, insurance claims | Django, DRF, PostgreSQL |
| Notification Service | Alerts, reminders, real-time updates | Django, DRF, Channels, Celery |
| AI ChatBot Service | Health assistant, patient-doctor chat | Django, DRF, Channels, OpenAI API |

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Git
- Python 3.8+
- Node.js 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthcare-microservices
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up --build
   ```

### Accessing Services

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api-docs
- **Service-specific Swagger Docs**:
  - User Service: http://localhost:8000/swagger/
  - Medical Record Service: http://localhost:8001/swagger/
  - Appointment Service: http://localhost:8002/swagger/
  - Billing Service: http://localhost:8003/swagger/
  - Pharmacy Service: http://localhost:8004/swagger/
  - Laboratory Service: http://localhost:8005/swagger/
  - Notification Service: http://localhost:8006/swagger/

## 📚 Documentation

- **System Analysis and Design**: See `docs/analysis-and-design.md`
- **Architecture**: See `docs/architecture.md`
- **API Specifications**: Available in `docs/api-specs/`
- **Diagrams**: Visual diagrams in `docs/assets/images/`

### Generating Diagrams

To generate or update diagrams from PlantUML source files:

```bash
./scripts/generate_diagrams.sh
```

To generate a specific diagram:

```bash
./scripts/generate_diagrams.sh <diagram-name>
```

## 🧪 Testing

```bash
# Run all tests
docker-compose run --rm test

# Run specific service tests
docker-compose run --rm test-service
```

## 📈 Monitoring

- **Service Health**: http://localhost:9090
- **Metrics Dashboard**: http://localhost:3000/metrics
- **Logs**: http://localhost:5601

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Lê Gia Huy** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for their invaluable tools and libraries