import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../../users/schemas/user.schema'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'tembea-africa-secret-key-2025'),
    })
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.userModel.findById(payload.sub).select('-password')
    if (!user || user.isBanned) throw new UnauthorizedException()
    return { userId: payload.sub, email: payload.email, role: payload.role }
  }
}
