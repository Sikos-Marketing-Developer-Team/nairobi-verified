# Nairobi Verified - Admin Dashboard

A secure, standalone admin dashboard for managing the Nairobi Verified platform.

## Features

- **Secure Authentication**: Dedicated admin login system
- **Dashboard Overview**: Real-time statistics and metrics
- **User Management**: View and manage platform users
- **Merchant Management**: Handle merchant registrations and verifications
- **Content Management**: Manage products, categories, and flash sales
- **Analytics**: Track platform performance and user engagement
- **System Management**: Configure settings and monitor system health

## Security Features

- Separate deployment from main application
- Role-based access control
- Session management
- CSRF protection
- Input validation and sanitization
- Secure error handling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Access to the main Nairobi Verified backend API

### Installation

1. Clone the repository or navigate to the admin folder
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

The admin dashboard will be available at `http://localhost:3001`

### Building for Production

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

## Project Structure

```
admin/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (auth, theme, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and API clients
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── public/             # Static assets
└── dist/              # Built application (after build)
```

## API Integration

The admin dashboard connects to the main Nairobi Verified backend API. Make sure the backend is running and accessible.

### Environment Variables

- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

## Deployment

The admin dashboard is designed to be deployed separately from the main application for enhanced security:

1. **Separate Domain/Subdomain**: Deploy to admin.nairobiverfied.com
2. **Access Control**: Restrict access by IP or VPN
3. **SSL Certificate**: Use HTTPS for all admin traffic
4. **Monitoring**: Set up monitoring and alerting

### Deployment Platforms

- **Netlify**: Ideal for frontend-only deployment
- **Vercel**: Good for React applications
- **AWS S3 + CloudFront**: For custom AWS deployments
- **Self-hosted**: Deploy on your own servers

## Security Considerations

1. **Access Control**: Limit admin access to authorized personnel only
2. **Network Security**: Use VPN or IP whitelisting
3. **Authentication**: Implement strong password policies
4. **Session Management**: Configure secure session timeouts
5. **Audit Logging**: Monitor all admin actions
6. **Regular Updates**: Keep dependencies updated

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add new pages in `src/pages/`
3. Define types in `src/types/`
4. Add API calls in `src/lib/api.ts`
5. Update routing in `src/App.tsx`

### Code Style

- Use TypeScript for all new code
- Follow React best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages

## Support

For technical support or questions about the admin dashboard:

1. Check the documentation
2. Review the backend API documentation
3. Contact the development team

## License

This project is proprietary and confidential. Unauthorized access or distribution is prohibited.
