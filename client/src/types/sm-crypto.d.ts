declare module "sm-crypto" {
  export const sm4: {
    encrypt: (data: string, key: string) => string;
    decrypt: (cipher: string, key: string) => string;
  };
}

