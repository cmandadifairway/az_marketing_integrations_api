export class BankDetailsDTO{
    private name:string;
    private code:string;
    private enable:string

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getCode(): string {
        return this.code;
    }

    public setCode(code: string): void {
        this.code = code;
    }

    public getEnable(): string {
        return this.enable;
    }

    public setEnable(enable: string): void {
        this.enable = enable;
    }


}