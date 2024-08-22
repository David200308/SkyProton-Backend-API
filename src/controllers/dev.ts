import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { verifyToken } from '../utils/auth';
import { Response, Request } from 'express';
import { UNAUTHORIZED } from '../const/user';
import { JwtPayload } from 'jsonwebtoken';
import { DevServices } from '../services/dev';
import { CREATE_DEV_REQUIRE } from '../const/dev';

@Controller("dev")
export class DevController {
    constructor(private readonly devServices: DevServices) { }

    @Post()
    async devRequestSSO(@Body() data: { redirectOrigin: string }, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
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

        if (!data.redirectOrigin) {
            response.status(HttpStatus.BAD_REQUEST).json({
                message: CREATE_DEV_REQUIRE
            });
            return;
        }

        const result = await this.devServices.requestDevAPPIdNAPPSecret({
            userId: payload.aud,
            redirectOrigin: data.redirectOrigin,
        });

        response.status(HttpStatus.OK).json(result);
    }

}
