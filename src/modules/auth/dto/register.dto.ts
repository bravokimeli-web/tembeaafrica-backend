import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MaxLength(50)
  firstName: string

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MaxLength(50)
  lastName: string

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationality?: string
}
