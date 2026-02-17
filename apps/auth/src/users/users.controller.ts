import { Controller, Get, Post, Body, Param } from '@nestjs/common';

import { UserResponseDto } from './dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(createUserDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<UserResponseDto | null> {
        return this.usersService.findOne(id);
    }
}
