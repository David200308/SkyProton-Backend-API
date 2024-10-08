import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
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
    SSO_REQUIRE, 
    UNAUTHORIZED, 
    USER_NOT_FOUND 
} from '../const/user';
import { 
    TOKEN_FUNCTION_ACTIVATION 
} from '../const/token';
import { JwtPayload } from 'jsonwebtoken';
import { ssoPage } from '../utils/ssoPage';

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserServices) { }

    @Get()
    async getUser(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });
            return;
        }

        const token = request.cookies.token;
        const payload: JwtPayload | void = await verifyToken(token).catch((err) => {
            console.log(err);
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
            return;
        });

        if (typeof payload !== "object" || !(typeof payload.aud === 'string')) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }

        const data = await this.userService.getUserById(parseInt(payload.aud)).catch((err) => {
            console.log(err);
            response.status(HttpStatus.NOT_FOUND).json({
                message: USER_NOT_FOUND
            });
            return;
        });
        if (data && typeof data === 'object' && "password" in data) {
            delete data.password;
            response.status(HttpStatus.OK).json(data);
            return;
        };

        response.status(HttpStatus.NOT_FOUND).json({
            message: USER_NOT_FOUND
        });
    }

    @Post('register')
    async createUser(@Body() data: SignUpSchema, @Res({ passthrough: true }) response: Response) {
        if (!data.email || !data.password || !data.username) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: REGISTER_REQUIRE
            });
            return;
        }
        if (!validateEmail(data.email)) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: INVALID_EMAIL
            });
            return;
        }
        const password = await passwordHash(data.password);
        data.password = password;
        try {
            const result = await this.userService.createUser(data);
            if (!result) {
                response.status(HttpStatus.BAD_REQUEST).json({
                    message: REGISTER_FAILED
                });
                return;
            }
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: REGISTER_FAILED
            });
            return;
        }

        const payload = {
            email: data.email,
            username: data.username,
            function: TOKEN_FUNCTION_ACTIVATION,
        };
        const token = generateToken(payload);
        const res: boolean = await sendActivationEmail(data.email, token);
        if (!res) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: ACTIVATION_EMAIL_SEND_FAILED
            });
            return;
        }

        response.status(HttpStatus.OK).json({
            message: REGISTER_SUCCESSFUL_WAIT_FOR_VERIFICATION
        });
    }

    @Post('login')
    async login(@Body() data: SignInSchema, @Res({ passthrough: true }) response: Response) {
        const user = await this.userService.getUserByEmail(data.email);
        if (!user) {
            response.status(HttpStatus.NOT_FOUND).json({
                message: USER_NOT_FOUND
            });
            return;
        }
        if (!(await passwordVerify(data.password, user.password))) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: PASSWORD_INCORRECT
            });
            return;
        }

        const payload = {
            aud: user.id.toString(),
            email: user.email,
            username: user.username,
        };

        const token = generateToken(payload);

        response.cookie('token', token, { secure: true });
        response.status(HttpStatus.OK).json({
            message: LOGIN_SUCCESSFUL, 
            token: token
        });
    }

    @Post('login/token')
    async loginWithToken(@Body() data: { type: string }, @Req() request: Request , @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token && !data.type && data.type !== 'token') {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: UNAUTHORIZED
            });
            return;
        }

        const payload: JwtPayload = await verifyToken(request.cookies.token).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
        });

        if (!(typeof payload.aud === 'string')) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
        }

        const user = await this.userService.getUserById(parseInt(payload.aud));
        if (!user) {
            response.status(HttpStatus.NOT_FOUND).json({
                message: USER_NOT_FOUND
            });
            return;
        }

        const newPayload = {
            aud: user.id.toString(),
            email: user.email,
            username: user.username,
        };

        const token = generateToken(newPayload);

        response.cookie('token', token, { secure: true });
        response.status(HttpStatus.OK).json({
            message: LOGIN_SUCCESSFUL,
            token: token
        });
    }

    @Get('/sso')
    async sso(@Query('appId') appId: string, @Query('redirect') redirect: string, @Res({ passthrough: true }) response: Response) {
        if (!appId || !redirect) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: SSO_REQUIRE
            });
            return;
        }
        return ssoPage(redirect);
    }

    @Post('/sso/refreshtoken')
    

    @Post('/sso/gentoken')
    

    @Delete(":id")
    async deleteUser(@Param('id') id: string, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!id) {
             response.status(HttpStatus.BAD_REQUEST).json({
                message: DELETE_REQUIRE_USERID
            });
            return;
        }

        if (!request.cookies.token) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }

        const token = request.cookies.token;
        const payload: JwtPayload | void = await verifyToken(token).catch((err) => {
            console.log(err);
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
            return;
        });

        if (typeof payload !== "object" || !(typeof payload.aud === 'string')) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }
        if (payload.aud.toString() !== id.toString()) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED
            });
            return;
        }

        await this.userService.deleteUser(parseInt(id)).catch((err) => {
            console.log(err);
            response.status(HttpStatus.NOT_FOUND).json({
                message: USER_NOT_FOUND,
                error: err
            });
            return;
        });

        response.status(HttpStatus.OK).json({
            message: DELETE_SUCCESSFUL
        });
    }

    @Get('activate/:email/:token')
    async activateUser(@Param('email') email: string, @Param('token') token: string, @Res({ passthrough: true }) response: Response) {
        if (!email || !token) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: EMAIL_ACTIVATION_REQUIRE
            });
            return;
        }
        if (!validateEmail(email)) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: INVALID_EMAIL
            });
            return;
        }
        const payload = await verifyToken(token);
        if (payload) {
            if (payload.email !== email || payload.function !== 'activation') {
                response.status(HttpStatus.BAD_REQUEST).json({
                    message: EMAIL_ACTIVATION_INVALID
                });
                return;
            }

            await this.userService.activateUser(email).catch((err) => {
                console.log(err);
                response.status(HttpStatus.BAD_REQUEST).json({
                    message: ACTIVATION_FAILED,
                    error: err
                });
                return;
            });

            response.status(HttpStatus.OK).json({
                message: EMAIL_ACTIVATION_SUCCESSFUL
            });
            return;
        }
        response.status(HttpStatus.BAD_REQUEST).json({
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
                response.status(HttpStatus.BAD_REQUEST).json({
                    message: ACTIVATION_FAILED,
                    error: err
                });
                return;
            });

            const token = generateToken(payload);
            response.cookie('token', token, { secure: true });
            response.status(HttpStatus.OK).json({
                message: LOGIN_SUCCESSFUL_WITH_GOOGLE,
                token: token
            });
            return;
        }
        response.status(HttpStatus.BAD_REQUEST).json({
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
                response.status(HttpStatus.BAD_REQUEST).json({
                    message: ACTIVATION_FAILED,
                    error: err
                });
                return;
            });

            const token = generateToken(payload);
            response.cookie('token', token, { secure: true });
            response.status(HttpStatus.OK).json({
                message: LOGIN_SUCCESSFUL_WITH_FACEBOOK,
                token: token
            });
            return;
        }
        response.status(HttpStatus.BAD_REQUEST).json({
            message: LOGIN_FAILED_WITH_FACEBOOK
        });
    }

}
