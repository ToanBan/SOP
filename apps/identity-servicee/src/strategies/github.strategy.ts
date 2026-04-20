import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    const clientID = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
      throw new Error('Missing GitHub OAuth config');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: `${process.env.IDENTITY_URL}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      provider: 'github',
      providerId: profile.id?.toString(),
      username: profile.username,
      email: profile.emails?.[0]?.value,
    };
  }
}
