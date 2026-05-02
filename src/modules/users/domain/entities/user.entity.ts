export class User {
  constructor(
    public id: number,
    public email: string,
    public name?: string | null,
    public password?: string,
    public resetPasswordToken?: string | null,
    public resetPasswordExpires?: Date | null,
    public refreshToken?: string | null,
    // public posts?: Post[] // Removido ou a ser tratado futuramente
  ) {}
}
