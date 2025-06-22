const { createError } = require('../utils/errorHandler');
const { generateToken, verifyToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

// Register new user
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // TODO: Check if user already exists in database
    // TODO: Hash password
    // TODO: Create user in database
    
    const hashedPassword = await hashPassword(password);
    
    const newUser = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    // Generate JWT token
    const token = generateToken({ userId: newUser.id, email: newUser.email });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
        token
      }
    });
  } catch (error) {
    next(createError(500, 'Failed to register user'));
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Find user in database
    // For testing purposes, using a hardcoded user with known password
    const testUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: '$2a$12$BXUorQpwwk40kH30i/DN..PZ0wdjjwRo6DXc63YnzV7kJsWSvG13y' // This is "TestPass123" hashed
    };
    
    // Check if email matches our test user
    if (email !== testUser.email) {
      return next(createError(401, 'Invalid credentials'));
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, testUser.password);
    
    if (!isValidPassword) {
      return next(createError(401, 'Invalid credentials'));
    }
    
    // Generate JWT token
    const token = generateToken({ userId: testUser.id, email: testUser.email });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: testUser.id, name: testUser.name, email: testUser.email },
        token
      }
    });
  } catch (error) {
    next(createError(500, 'Failed to login'));
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    // TODO: Implement token blacklisting if needed
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(createError(500, 'Failed to logout'));
  }
};

// Get current user profile
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // TODO: Fetch user from database
    const user = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(createError(500, 'Failed to fetch user profile'));
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(createError(400, 'Refresh token is required'));
    }
    
    // TODO: Verify refresh token and generate new access token
    const newToken = generateToken({ userId: 1, email: 'john@example.com' });
    
    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    next(createError(500, 'Failed to refresh token'));
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken
}; 