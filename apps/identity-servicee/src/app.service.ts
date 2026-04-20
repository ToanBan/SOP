import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DB_PROVIDER } from './db/db.provider';
import { users } from './db/schemas/user.schema';
import type { RegisterDto } from './dto/RegisterDto';
import { LoginDto } from './dto/LoginDto';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { roles } from './db/schemas/role.schema';
import * as crypto from 'crypto';
import { userSessions } from './db/schemas/user_sessions.schema';
import { userProviders } from './db/schemas/user_providers.schema';
import { userRoles } from './db/schemas/user_roles.schema';
@Injectable()
export class AppService {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto) {
    try {
      return await this.db.transaction(async (tx) => {
        const exist = await tx
          .select()
          .from(users)
          .where(eq(users.email, dto.email))
          .limit(1);

        if (exist.length > 0) {
          throw new BadRequestException('Email already exists');
        }

        const hashed = await bcrypt.hash(dto.password, 10);

        const [role] = await tx
          .select()
          .from(roles)
          .where(eq(roles.name, 'sales'))
          .limit(1);

        if (!role) {
          throw new BadRequestException('Default role not found');
        }

        const userId = uuidv4();

        await tx.insert(users).values({
          id: userId,
          email: dto.email,
          username: dto.username,
          password: hashed,
          isActive: true,
        });

        await tx.insert(userRoles).values({
          userId,
          roleId: role.id,
        });

        return {
          message: 'Register success',
          userId,
          role: role.name,
        };
      });
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  async login(dto: LoginDto) {
    try {
      const [result] = await this.db
        .select({
          id: users.id,
          email: users.email,
          password: users.password,
          username: users.username,
          roleName: roles.name,
        })
        .from(users)
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(users.email, dto.email));

      if (!result || !(await bcrypt.compare(dto.password, result.password))) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      if (!result.roleName) {
        throw new UnauthorizedException('User chưa được gán role');
      }

      const sessionId = crypto.randomUUID();

      const payload = {
        sub: result.id,
        email: result.email,
        role: result.roleName,
        sid: sessionId,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: '30m',
        }),
        this.jwtService.signAsync(payload, {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: '4d',
        }),
      ]);

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      await this.db.insert(userSessions).values({
        id: sessionId,
        userId: result.id,
        hashedRefreshToken,
        expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: result.id,
          username: result.username,
          email: result.email,
          role: result.roleName,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const [session] = await this.db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.id, payload.sid),
            eq(userSessions.userId, payload.sub),
          ),
        )
        .limit(1);

      if (!session) {
        throw new UnauthorizedException('Session không tồn tại');
      }

      if (session.isRevoked) {
        throw new UnauthorizedException('Session đã bị thu hồi');
      }

      if (new Date(session.expiresAt) < new Date()) {
        throw new UnauthorizedException('Session đã hết hạn');
      }

      const isValid = await bcrypt.compare(token, session.hashedRefreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          sid: payload.sid,
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: '30m',
        },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }

  async getMe(userId: string) {
    try {
      const [user] = await this.db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          roleName: roles.name,
        })
        .from(users)
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(users.id, userId));

      return { user };
    } catch (error) {
      return { success: false, message: 'Could not fetch user info' };
    }
  }

  async logout(refreshToken: string, accessToken?: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const [session] = await this.db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.id, payload.sid),
            eq(userSessions.userId, payload.sub),
          ),
        )
        .limit(1);

      if (session) {
        const isValid = await bcrypt.compare(
          refreshToken,
          session.hashedRefreshToken,
        );

        if (isValid) {
          await this.db
            .update(userSessions)
            .set({ isRevoked: true })
            .where(eq(userSessions.id, session.id));
        }
      }

      if (accessToken) {
        const decoded: any = this.jwtService.decode(accessToken);

        if (decoded?.exp) {
          const now = Math.floor(Date.now() / 1000);
          const ttl = decoded.exp - now;

          if (ttl > 0) {
            await this.redis.set(`blacklist:${accessToken}`, '1', 'EX', ttl);
          }
        }
      }

      return { message: 'Logout success' };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result === '1';
  }

  private async handleSocialLogin(input: {
    provider: string;
    providerId: string;
    email: string;
    name?: string;
  }) {
    try {
      const { provider, providerId, email, name } = input;

      return await this.db.transaction(async (tx) => {
        const [providerRecord] = await tx
          .select()
          .from(userProviders)
          .where(
            and(
              eq(userProviders.provider, provider),
              eq(userProviders.providerId, providerId),
            ),
          )
          .limit(1);

        let user: any;

        if (providerRecord) {
          const [existingUser] = await tx
            .select()
            .from(users)
            .where(eq(users.id, providerRecord.userId))
            .limit(1);

          user = existingUser;
        } else {
          const [existingUser] = await tx
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (existingUser) {
            user = existingUser;
          } else {
            const [salesRole] = await tx
              .select()
              .from(roles)
              .where(eq(roles.name, 'sales'))
              .limit(1);

            if (!salesRole) {
              throw new BadRequestException('Default role not found');
            }

            const userId = uuidv4();

            await tx.insert(users).values({
              id: userId,
              email,
              username: name ?? `${provider}_${providerId}`,
              password: null,
              isActive: true,
            });

            await tx.insert(userRoles).values({
              userId,
              roleId: salesRole.id,
            });

            user = {
              id: userId,
              email,
              username: name ?? `${provider}_${providerId}`,
            };
          }

          await tx.insert(userProviders).values({
            id: uuidv4(),
            userId: user.id,
            provider,
            providerId,
            email,
            name,
          });
        }

        const roleRows = await tx
          .select({
            roleName: roles.name,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, user.id));

        const rolesList = roleRows.map((r) => r.roleName);

        const sessionId = crypto.randomUUID();

        const payload = {
          sub: user.id,
          email: user.email,
          roles: rolesList,
          sid: sessionId,
        };

        const [accessToken, refreshToken] = await Promise.all([
          this.jwtService.signAsync(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: '30m',
          }),
          this.jwtService.signAsync(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: '4d',
          }),
        ]);

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await tx.insert(userSessions).values({
          id: sessionId,
          userId: user.id,
          hashedRefreshToken,
          expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          isRevoked: false,
        });

        return {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: rolesList,
          },
        };
      });
    } catch (error) {
      return {success:false}
    }
  }

  async loginWithGithub(githubUser: any) {
    if (!githubUser) throw new Error('GitHub user undefined');

    return this.handleSocialLogin({
      provider: githubUser.provider,
      providerId: githubUser.providerId,
      email: githubUser.email,
      name: githubUser.username,
    });
  }

  async loginWithGoogle(googleUser: any) {
    if (!googleUser) throw new Error('Google user undefined');

    return this.handleSocialLogin({
      provider: googleUser.provider,
      providerId: googleUser.providerId,
      email: googleUser.email,
      name: googleUser.name,
    });
  }
}
