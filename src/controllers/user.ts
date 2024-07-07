import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserServices } from '../services/user';
import { SignInSchema, SignUpSchema } from '../schemas/user';
import { generateToken, passwordHash, passwordVerify, verifyToken } from '../utils/auth';
import { Response, Request } from 'express';
import { GoogleOAuthGuard } from '../services/oauth/google/google-oauth.guard';
import { AuthGuard } from '@nestjs/passport';
import { sendActivationEmail, validateEmail } from '../utils/email';

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserServices) { }

    @Get()
    async getUser(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token)
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Unauthorized'
            });

        const token = request.cookies.token;
        const payload = await verifyToken(token).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Unauthorized',
                error: err
            });
        });

        const data = await this.userService.getUserById(parseInt(payload.aud)).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.NOT_FOUND).json({
                message: 'User not found'
            });
        });
        if (data && typeof data === 'object' && "password" in data) {
            delete data.password;
            return response.status(HttpStatus.OK).json(data);
        }

        return response.status(HttpStatus.NOT_FOUND).json({
            message: 'User not found'
        });
    }

    @Post('register')
    async createUser(@Body() data: SignUpSchema, @Res({ passthrough: true }) response: Response) {
        if (!data.email || !data.password || !data.username) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'Email, password, and username is required'
            });
        }
        if (!validateEmail(data.email)) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'Invalid email'
            });
        }
        const password = await passwordHash(data.password);
        data.password = password;
        try {
            const result = await this.userService.createUser(data);
            if (!result) {
                return response.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Register failed'
                });
            }
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'Register failed'
            });
        }

        const payload = {
            email: data.email,
            username: data.username,
            function: 'activation',
        };
        const token = generateToken(payload);
        const res: boolean = await sendActivationEmail(data.email, token);
        if (!res) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'Activation email send failed'
            });
        }

        return response.status(HttpStatus.OK).json({
            message: 'Register successful, wait for verification'
        });
    }

    @Post('login')
    async login(@Body() data: SignInSchema, @Res({ passthrough: true }) response: Response) {
        const user = await this.userService.getUserByEmail(data.email);
        if (!user) {
            return response.status(HttpStatus.NOT_FOUND).json({
                message: 'User not found'
            });
        }
        if (!passwordVerify(data.password, user[0].password)) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Password incorrect'
            });
        }

        const payload = {
            aud: user[0].id,
            email: user[0].email,
            username: user[0].username,
        };

        const token = generateToken(payload);

        response.cookie('token', token, { secure: true });
        return response.status(HttpStatus.OK).json({
            message: 'Login successful'
        });
    }

    //   @Patch()
    //   async updateUser(id: string, data: User) {
    //     return this.userService.updateUser(id, data);
    //   }

    @Delete(":id")
    async deleteUser(@Param('id') id: string, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!id)
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'User ID is required'
            });

        if (!request.cookies.token)
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Unauthorized'
            });

        const token = request.cookies.token;
        const payload = await verifyToken(token).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Unauthorized',
                error: err
            });
        });
        if (payload.aud.toString() !== id.toString()) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Unauthorized'
            });
        }

        await this.userService.deleteUser(parseInt(id)).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.NOT_FOUND).json({
                message: 'User not found',
                error: err
            });
        });

        return response.status(HttpStatus.OK).json({
            message: 'User deleted'
        });
    }

    @Get('activate/:email/:token')
    async activateUser(@Param('email') email: string, @Param('token') token: string, @Res({ passthrough: true }) response: Response) {
        if (!email || !token) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'Email and token is required'
            });
        }
        if (!validateEmail(email)) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'Invalid email'
            });
        }
        const payload = await verifyToken(token);
        if (payload) {
            if (payload.email !== email || payload.function !== 'activation') {
                return response.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Invalid token or email'
                });
            }

            await this.userService.activateUser(email).catch((err) => {
                console.log(err);
                return response.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Activation failed',
                    error: err
                });
            });

            return response.status(HttpStatus.OK).json({
                message: 'User activated'
            });
        }
        return response.status(HttpStatus.BAD_REQUEST).json({
            message: 'Invalid token'
        });
    }

    @Get('connect/google')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth() {
        return HttpStatus.OK;
    }

    @Get('google-redirect')
    @UseGuards(GoogleOAuthGuard)
    async googleAuthRedirect(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
        const res = await this.userService.googleLogin(req);

        if (res) {
            const payload = {
                aud: (res.id).toString(),
                email: res.email,
                username: res.username,
            };

            await this.userService.activateUser(res.email).catch((err) => {
                console.log(err);
                return response.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Activation failed',
                    error: err
                });
            });

            const token = generateToken(payload);
            response.cookie('token', token, { secure: true });
            return response.status(HttpStatus.OK).json({
                message: 'Login successful, connected with Google'
            });
        }
        return response.status(HttpStatus.BAD_REQUEST).json({
            message: 'Login failed, connected with Google failed'
        });
    }

    @Get("connect/facebook")
    @UseGuards(AuthGuard("facebook"))
    async facebookAuth(): Promise<any> {
        return HttpStatus.OK;
    }

    @Get("facebook-redirect")
    @UseGuards(AuthGuard("facebook"))
    async facebookAuthRedirect(@Req() req: Request, @Res({ passthrough: true }) response: Response): Promise<any> {
        const res = await this.userService.facebookLogin(req);
            
        if (res) {
            const payload = {
                aud: (res.id).toString(),
                email: res.email,
                username: res.username,
            };

            await this.userService.activateUser(res.email).catch((err) => {
                console.log(err);
                return response.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Activation failed',
                    error: err
                });
            });

            const token = generateToken(payload);
            response.cookie('token', token, { secure: true });
            return response.status(HttpStatus.OK).json({
                message: 'Login successful, connected with Facebook'
            });
        }
        return response.status(HttpStatus.BAD_REQUEST).json({
            message: 'Login failed, connected with Facebook failed'
        });
    }

}
