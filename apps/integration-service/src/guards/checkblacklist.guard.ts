import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';


@Injectable()
export class CheckBlackList implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing token');
    }

    const token = authHeader.split(' ')[1];

    try {

      const response = await fetch("http://localhost:8000/auth/blacklist", {
        method:"POST", 
        body:JSON.stringify({token}), 
        headers:{
            "Content-Type":"application/json"
        }
      })

      const data = await response.json();

      if (!data.active) {
        throw new UnauthorizedException('Token invalid');
      }

      request.user = {
        id: data.userId,
        roles: data.roles,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}