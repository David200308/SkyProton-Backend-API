import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { verifyToken } from '../utils/auth';
import { Response, Request } from 'express';
import { UNAUTHORIZED } from '../const/user';
import { PointsServices } from 'src/services/points';

@Controller("points")
export class PointsController {
    constructor(private readonly pointsServices: PointsServices) { }

    @Get(":id")
    async getUserPoints(@Param('id') id: string, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token)
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });

        const token = request.cookies.token;
        await verifyToken(token).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
        });

        const data = await this.pointsServices.getPoints(id);

        return response.status(HttpStatus.OK).json(data);
    }

    @Post()
    async addPoints(@Body() body: { id: string, points: string }, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.cookies.token)
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });

        const token = request.cookies.token;
        await verifyToken(token).catch((err) => {
            console.log(err);
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
        });

        const data = await this.pointsServices.addPoints(body.id, body.points);

        return response.status(HttpStatus.OK).json(data);
    }

}