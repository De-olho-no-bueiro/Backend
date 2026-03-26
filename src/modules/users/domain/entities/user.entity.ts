export class User {
  constructor(
    public id: number,
    public email: string,
    public name?: string | null,
    // public posts?: Post[] // Removido ou a ser tratado futuramente
  ) {}
}
