import { GetUserResponse } from '@edsy-services/common';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

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
    async findOne(@Param('id') id: string): Promise<GetUserResponse | null> {
        return this.usersService.findOne(id);
    }
}
