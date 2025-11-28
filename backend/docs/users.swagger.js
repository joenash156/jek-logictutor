/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user authentication and profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupUser:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - email
 *         - password
 *       properties:
 *         firstname:
 *           type: string
 *           example: Joshua
 *         lastname:
 *           type: string
 *           example: Adjei
 *         email:
 *           type: string
 *           example: joshua@example.com
 *         password:
 *           type: string
 *           example: MyStrongPassword123
 * 
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: joshua@example.com
 *         password:
 *           type: string
 *           example: MyStrongPassword123
 * 
 *     UpdateProfile:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *           example: Joshua
 *         lastname:
 *           type: string
 *           example: Adjei
 *         email:
 *           type: string
 *           example: newemail@example.com
 * 
 *     ChangePassword:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: OldPassword123
 *         newPassword:
 *           type: string
 *           example: NewPassword456
 * UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 1
 *         firstname:
 *           type: string
 *           example: Joshua
 *         lastname:
 *           type: string
 *           example: Adjei
 *         email:
 *           type: string
 *           example: joshua@example.com
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: https://example.com/avatar.png
 *         theme:
 *           type: string
 *           example: light
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-11-19T11:00:00Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2025-11-19T12:00:00Z
 * 
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyPassword:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           example: MyCurrentPassword123
 *     DeleteUserSuccess:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: User deleted successfully ✅
 *     DeleteUserError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Password is incorrect
 */


/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user and return authentication tokens
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/update_profile:
 *   patch:
 *     summary: Update user profile (authentication required)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/change_password:
 *   patch:
 *     summary: Change user password (authentication required)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Current password is incorrect or unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get the profile of the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: No user found in database
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Database error
 */

/**
 * @swagger
 * /user/delete:
 *   delete:
 *     summary: Delete the authenticated user account (requires password verification)
 *     description: This endpoint deletes the logged-in user's account. User must provide their current password for verification. Only accessible by authenticated users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPassword'
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteUserSuccess'
 *       400:
 *         description: Password not provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteUserError'
 *       401:
 *         description: Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteUserError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteUserError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteUserError'
 */

