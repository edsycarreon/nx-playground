import { GetUserResponse } from '@edsy-services/common';
import { Controller, Get, Post, Body, Param, NotFoundException, ParseUUIDPipe } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<GetUserResponse> {
        return this.usersService.create(createUserDto);
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GetUserResponse> {
        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
}
