import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import type { RegisterDto } from './dto/RegisterDto';
import { LoginDto } from './dto/LoginDto';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './guards/user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}




  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.appService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.appService.login(dto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 4 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login success',
      accessToken,
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser('sub') userId: string) {
    return await this.appService.getMe(userId);
  }

  @Post('refresh-token')
  async refresh(@Req() req: Request) {
    const token = req.cookies['refreshToken'];
    if (!token) {
      throw new UnauthorizedException('Không tìm thấy Refresh Token');
    }
    return await this.appService.refreshToken(token);
  }


  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    await this.appService.logout(refreshToken, accessToken);

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(0),
    });

    return { message: 'Logout success' };
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    const githubUser = req.user;

    const { accessToken, refreshToken, user } =
      await this.appService.loginWithGithub(githubUser);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 4 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${process.env.FE_URL}/oauth-success`);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const googleUser = req.user;

    const { accessToken, refreshToken, user } =
      await this.appService.loginWithGoogle(googleUser);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 4 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${process.env.FE_URL}/oauth-success`);
  }
}
