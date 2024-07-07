import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserServices } from '../services/user';
import { SignInSchema, SignUpSchema } from '../schemas/user';
import { generateToken, passwordHash, passwordVerify, verifyToken } from '../utils/auth';
import { Response, Request } from 'express';
import { GoogleOAuthGuard } from '../services/oauth/google/google-oauth.guard';
import { AuthGuard } from '@nestjs/passport';
import { sendActivationEmail, validateEmail } from '../utils/email';
import { 
    ACTIVATION_EMAIL_SEND_FAILED, 
    ACTIVATION_FAILED, 
    DELETE_REQUIRE_USERID, 
    DELETE_SUCCESSFUL, 
    EMAIL_ACTIVATION_INVALID,
    EMAIL_ACTIVATION_REQUIRE, 
    EMAIL_ACTIVATION_SUCCESSFUL, 
    INVALID_EMAIL, 
    LOGIN_FAILED_WITH_FACEBOOK, 
    LOGIN_FAILED_WITH_GOOGLE, 
    LOGIN_SUCCESSFUL, 
    LOGIN_SUCCESSFUL_WITH_FACEBOOK, 
    LOGIN_SUCCESSFUL_WITH_GOOGLE, 
    PASSWORD_INCORRECT, 
    REGISTER_FAILED, 
    REGISTER_REQUIRE, 
    REGISTER_SUCCESSFUL_WAIT_FOR_VERIFICATION, 
    UNAUTHORIZED, 
    USER_NOT_FOUND 
} from '../const/user';
import { 
    TOKEN_FUNCTION_ACTIVATION 
} from '../const/token';

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserServices) { }

    @Get()
    async getUser(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token)
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });

        const token = request.cookies.token;
        const payload = await verifyToken(token).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
        });

        const data = await this.userService.getUserById(parseInt(payload.aud)).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.NOT_FOUND).json({
                message: USER_NOT_FOUND
            });
        });
        if (data && typeof data === 'object' && "password" in data) {
            delete data.password;
            return response.status(HttpStatus.OK).json(data);
        }

        return response.status(HttpStatus.NOT_FOUND).json({
            message: USER_NOT_FOUND
        });
    }

    @Post('register')
    async createUser(@Body() data: SignUpSchema, @Res({ passthrough: true }) response: Response) {
        if (!data.email || !data.password || !data.username) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: REGISTER_REQUIRE
            });
        }
        if (!validateEmail(data.email)) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: INVALID_EMAIL
            });
        }
        const password = await passwordHash(data.password);
        data.password = password;
        try {
            const result = await this.userService.createUser(data);
            if (!result) {
                return response.status(HttpStatus.BAD_REQUEST).json({
                    message: REGISTER_FAILED
                });
            }
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: REGISTER_FAILED
            });
        }

        const payload = {
            email: data.email,
            username: data.username,
            function: TOKEN_FUNCTION_ACTIVATION,
        };
        const token = generateToken(payload);
        const res: boolean = await sendActivationEmail(data.email, token);
        if (!res) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: ACTIVATION_EMAIL_SEND_FAILED
            });
        }

        return response.status(HttpStatus.OK).json({
            message: REGISTER_SUCCESSFUL_WAIT_FOR_VERIFICATION
        });
    }

    @Post('login')
    async login(@Body() data: SignInSchema, @Res({ passthrough: true }) response: Response) {
        const user = await this.userService.getUserByEmail(data.email);
        if (!user) {
            return response.status(HttpStatus.NOT_FOUND).json({
                message: USER_NOT_FOUND
            });
        }
        if (!passwordVerify(data.password, user[0].password)) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: PASSWORD_INCORRECT
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
            message: LOGIN_SUCCESSFUL
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
                message: DELETE_REQUIRE_USERID
            });

        if (!request.cookies.token)
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });

        const token = request.cookies.token;
        const payload = await verifyToken(token).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
        });
        if (payload.aud.toString() !== id.toString()) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
        }

        await this.userService.deleteUser(parseInt(id)).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.NOT_FOUND).json({
                message: USER_NOT_FOUND,
                error: err
            });
        });

        return response.status(HttpStatus.OK).json({
            message: DELETE_SUCCESSFUL
        });
    }

    @Get('activate/:email/:token')
    async activateUser(@Param('email') email: string, @Param('token') token: string, @Res({ passthrough: true }) response: Response) {
        if (!email || !token) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: EMAIL_ACTIVATION_REQUIRE
            });
        }
        if (!validateEmail(email)) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: INVALID_EMAIL
            });
        }
        const payload = await verifyToken(token);
        if (payload) {
            if (payload.email !== email || payload.function !== 'activation') {
                return response.status(HttpStatus.BAD_REQUEST).json({
                    message: EMAIL_ACTIVATION_INVALID
                });
            }

            await this.userService.activateUser(email).catch((err) => {
                console.log(err);
                return response.status(HttpStatus.BAD_REQUEST).json({
                    message: ACTIVATION_FAILED,
                    error: err
                });
            });

            return response.status(HttpStatus.OK).json({
                message: EMAIL_ACTIVATION_SUCCESSFUL
            });
        }
        return response.status(HttpStatus.BAD_REQUEST).json({
            message: EMAIL_ACTIVATION_INVALID
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
                    message: ACTIVATION_FAILED,
                    error: err
                });
            });

            const token = generateToken(payload);
            response.cookie('token', token, { secure: true });
            return response.status(HttpStatus.OK).json({
                message: LOGIN_SUCCESSFUL_WITH_GOOGLE
            });
        }
        return response.status(HttpStatus.BAD_REQUEST).json({
            message: LOGIN_FAILED_WITH_GOOGLE
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
                    message: ACTIVATION_FAILED,
                    error: err
                });
            });

            const token = generateToken(payload);
            response.cookie('token', token, { secure: true });
            return response.status(HttpStatus.OK).json({
                message: LOGIN_SUCCESSFUL_WITH_FACEBOOK
            });
        }
        return response.status(HttpStatus.BAD_REQUEST).json({
            message: LOGIN_FAILED_WITH_FACEBOOK
        });
    }

}
