# Modern Portfolio Website

A stunning full-stack portfolio website with glassmorphism effects, smooth animations, dark mode, and Spring Boot backend with admin authentication.

## Features

### UI/UX
- **Glassmorphism Design**: iOS-inspired translucent glass effects
- **Dark/Light Mode**: Seamless theme toggle with persistent preferences
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Responsive Design**: Perfect display on desktop, tablet, and mobile devices
- **Modern Aesthetics**: Gradient text, hover effects, and smooth scrolling

### Pages
- **Home**: Profile section with photo, bio, and social links
- **Blogs**: Card layout with auto-generated/custom thumbnails and external links
- **Projects**: Showcase with preview images, tech tags, GitHub and live demo links
- **Publications**: Research papers with thumbnails, PDF, DOI, and code links

### Backend
- **RESTful API**: Full CRUD operations for all content types
- **Admin Authentication**: Secure endpoints for content management
- **H2 Database**: In-memory database (easily replaceable with PostgreSQL/MySQL)
- **CORS Enabled**: Ready for frontend-backend communication

## Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS (custom glassmorphism utilities)
- Framer Motion (animations)
- React Router DOM (navigation)
- Axios (API calls)
- React Icons

### Backend
- Spring Boot 3.2.0
- Spring Security (authentication)
- Spring Data JPA
- H2 Database
- Lombok
- Maven

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Java 17 or higher
- Maven

### Running the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

Or on Windows:
```bash
mvnw.cmd spring-boot:run
```

The backend starts on `http://localhost:8080`

### Running the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend starts on `http://localhost:5173`

## Admin Authentication

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change these credentials in production!

### Using Admin Endpoints

All POST, PUT, and DELETE requests require Basic Authentication. GET requests are public.

Example using curl:
```bash
curl -X POST http://localhost:8080/api/blogs \
  -u admin:admin123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog",
    "description": "A brief description",
    "content": "Full content here",
    "date": "2025-10-13",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "externalUrl": "https://medium.com/@yourpost"
  }'
```

## API Endpoints

### Profile (Home Page)
- `GET /api/profile` - Get all profiles
- `GET /api/profile/{id}` - Get profile by ID
- `POST /api/profile` - Create profile (requires auth)
- `PUT /api/profile/{id}` - Update profile (requires auth)
- `DELETE /api/profile/{id}` - Delete profile (requires auth)

**Profile Fields:**
```json
{
  "name": "Your Name",
  "title": "Your Title",
  "about": "Your bio",
  "profileImageUrl": "https://...",
  "githubUrl": "https://github.com/...",
  "linkedinUrl": "https://linkedin.com/in/...",
  "twitterUrl": "https://twitter.com/...",
  "emailUrl": "your@email.com"
}
```

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create blog (requires auth)
- `PUT /api/blogs/{id}` - Update blog (requires auth)
- `DELETE /api/blogs/{id}` - Delete blog (requires auth)

**Blog Fields:**
```json
{
  "title": "Blog Title",
  "description": "Short description",
  "content": "Full content",
  "date": "2025-10-13",
  "thumbnailUrl": "https://...",
  "externalUrl": "https://..."
}
```

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (requires auth)
- `PUT /api/projects/{id}` - Update project (requires auth)
- `DELETE /api/projects/{id}` - Delete project (requires auth)

**Project Fields:**
```json
{
  "title": "Project Name",
  "description": "Project description",
  "technologies": "React, Spring Boot, PostgreSQL",
  "githubUrl": "https://github.com/...",
  "liveUrl": "https://...",
  "previewImageUrl": "https://..."
}
```

### Publications
- `GET /api/publications` - Get all publications
- `POST /api/publications` - Create publication (requires auth)
- `PUT /api/publications/{id}` - Update publication (requires auth)
- `DELETE /api/publications/{id}` - Delete publication (requires auth)

**Publication Fields:**
```json
{
  "title": "Paper Title",
  "authors": "Author1, Author2",
  "venue": "Conference/Journal Name",
  "year": 2025,
  "abstractText": "Paper abstract",
  "doi": "10.1234/...",
  "pdfUrl": "https://...",
  "thumbnailUrl": "https://...",
  "codeUrl": "https://github.com/..."
}
```

## Database Access

Access H2 Console at `http://localhost:8080/h2-console`:
- **JDBC URL**: `jdbc:h2:mem:portfoliodb`
- **Username**: `sa`
- **Password**: (leave empty)

## Customization

### Theme Colors
Edit `frontend/tailwind.config.js` to customize colors and animations.

### Authentication
Update credentials in `backend/src/main/java/com/portfolio/backend/config/SecurityConfig.java`:

```java
UserDetails admin = User.builder()
        .username("your-username")
        .password(passwordEncoder().encode("your-password"))
        .roles("ADMIN")
        .build();
```

### Dark Mode Default
Change in `frontend/src/context/ThemeContext.jsx`:
```javascript
const [isDark, setIsDark] = useState(true); // Start with dark mode
```

## Building for Production

### Frontend
```bash
cd frontend
npm run build
# Build files in frontend/dist/
```

### Backend
```bash
cd backend
./mvnw clean package
# JAR file in backend/target/backend-0.0.1-SNAPSHOT.jar
```

### Deploy
1. Update CORS origins in `SecurityConfig.java` and `CorsConfig.java`
2. Replace H2 with PostgreSQL/MySQL for production
3. Use environment variables for credentials
4. Deploy backend JAR to cloud service
5. Deploy frontend build to CDN/hosting service

## Responsive Design

The website automatically adapts to:
- **Desktop**: Full navigation, multi-column layouts
- **Tablet**: Adjusted spacing, 2-column grids
- **Mobile**: Single column, touch-optimized

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Notes

1. **Change default credentials** immediately
2. Use HTTPS in production
3. Replace H2 with production database
4. Add rate limiting for API endpoints
5. Implement JWT tokens for better auth
6. Add CSRF protection for production

## License

MIT License - Feel free to use for your portfolio!
