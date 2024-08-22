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
        if (!request.headers['authorization']) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });
            return;
        }

        const token = request.headers['authorization'].replace('Bearer ', '');
        await verifyToken(token).catch((err) => {
            console.log(err);
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
            return;
        });

        const data = await this.pointsServices.getPoints(id);

        response.status(HttpStatus.OK).json(data);
    }

    @Post()
    async addPoints(@Body() body: { id: string, points: string }, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        if (!request.headers['authorization']) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
            });
            return;
        }

        const token = request.headers['authorization'].replace('Bearer ', '');
        await verifyToken(token).catch((err) => {
            console.log(err);
            response.status(HttpStatus.UNAUTHORIZED).json({
                message: UNAUTHORIZED,
                error: err
            });
            return;
        });

        const data = await this.pointsServices.addPoints(body.id, body.points);

        response.status(HttpStatus.OK).json(data);
    }

}