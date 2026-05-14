import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class DecodeAuthGuard implements CanActivate {
  private jwtService = new JwtService();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = this.jwtService.decode(token);
      request.user = payload;
      console.log("payload", payload);
      return true;
    } catch (e) {
      return false;
    }
  }
}
