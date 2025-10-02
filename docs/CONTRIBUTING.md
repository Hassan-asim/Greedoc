# Contributing to Greedoc

Thank you for your interest in contributing to Greedoc! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- Git
- OpenAI API key (for AI features)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/greedoc.git
   cd greedoc
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend
   cd server
   cp env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../client
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # Backend (from server directory)
   npm run dev
   
   # Frontend (from client directory)
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Critical fixes

### Commit Convention

We use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add password reset functionality
fix(api): resolve medication reminder bug
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation if needed
   - Follow existing code style

3. **Test Your Changes**
   ```bash
   # Backend tests
   cd server
   npm test
   
   # Frontend tests
   cd client
   npm test
   
   # Linting
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request on GitHub.

## Code Standards

### Backend (Node.js/Express)

- Use ES6+ features
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper error handling
- Add input validation using express-validator
- Write comprehensive tests
- Use meaningful variable and function names

```javascript
// Good example
const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

// Bad example
const createUser = async (data) => {
  const u = new User(data);
  await u.save();
  return u;
};
```

### Frontend (React/TypeScript)

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Use semantic HTML
- Follow accessibility guidelines
- Write unit tests for components

```typescript
// Good example
interface UserProfileProps {
  user: User;
  onUpdate: (userData: Partial<User>) => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSubmit = async (data: Partial<User>) => {
    try {
      await onUpdate(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};

// Bad example
const UserProfile = ({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  
  const submit = async (data) => {
    await onUpdate(data);
    setEditing(false);
  };

  return <div>{/* JSX */}</div>;
};
```

### Database (MongoDB/Mongoose)

- Use descriptive schema names
- Add proper validation
- Create appropriate indexes
- Use virtuals for computed properties
- Implement proper error handling

```javascript
// Good example
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
```

## Testing Guidelines

### Backend Testing

- Write unit tests for all functions
- Write integration tests for API endpoints
- Test error scenarios
- Use proper test data setup/teardown

```javascript
describe('User Controller', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup test data
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should return error for invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });
});
```

### Frontend Testing

- Test component rendering
- Test user interactions
- Test error states
- Use React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders user information correctly', () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onUpdate when form is submitted', async () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Jane' }
    });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john@example.com'
      });
    });
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Explain business logic
- Update README files

```javascript
/**
 * Creates a new health record for a user
 * @param {string} userId - The user's ID
 * @param {Object} recordData - The health record data
 * @param {string} recordData.recordType - Type of health record
 * @param {string} recordData.title - Title of the record
 * @param {Date} recordData.date - Date of the record
 * @returns {Promise<Object>} The created health record
 * @throws {Error} If validation fails or database error occurs
 */
const createHealthRecord = async (userId, recordData) => {
  // Implementation
};
```

### API Documentation

- Document all endpoints
- Include request/response examples
- Explain error codes
- Update API.md file

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Clear Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Environment**: OS, Node.js version, browser version
4. **Screenshots**: If applicable
5. **Error Messages**: Full error messages and stack traces

### Feature Requests

When requesting features, include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## Security

### Reporting Security Issues

For security vulnerabilities, please:

1. **DO NOT** create a public GitHub issue
2. Email security@greedoc.com with details
3. Include steps to reproduce
4. Allow time for response before public disclosure

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all inputs
- Use HTTPS in production
- Keep dependencies updated

## Performance

### Performance Guidelines

- Optimize database queries
- Use appropriate indexes
- Implement caching where beneficial
- Minimize bundle size
- Use lazy loading for components
- Optimize images and assets

## Accessibility

### Accessibility Guidelines

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Use proper ARIA labels
- Test with screen readers
- Maintain color contrast ratios

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Join our community Discord/Slack
3. Email contributors@greedoc.com
4. Create a discussion on GitHub

Thank you for contributing to Greedoc! 🚀
