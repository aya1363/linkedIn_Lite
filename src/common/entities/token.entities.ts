export class TokenPair {
  access_Token: string;
  refresh_Token: string;
}

export class LoginCredentialsResponse {
  credentials: TokenPair;
}
