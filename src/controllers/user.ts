import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { UserServices } from '../services/user';
import { SignInSchema, SignUpSchema } from '../schemas/user';
import { generateToken, passwordHash, passwordVerify, verifyToken } from '../utils/auth';
import { Response, Request } from 'express';
import 'dotenv/config'

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserServices) { }

    @Get(':id')
    async getUser(@Param('id') id: string, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
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

        const data = await this.userService.getUserById(id).catch((err) => {
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
        console.log(data)
        const password = await passwordHash(data.password);
        data.password = password;
        await this.userService.createUser(data).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'Register failed'
            });
        });
        return response.status(HttpStatus.OK).json({
            message: 'Register successful'
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

        await this.userService.deleteUser(id).catch((err) => {
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

}
