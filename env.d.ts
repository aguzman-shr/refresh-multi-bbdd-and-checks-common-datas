declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HOST: string;
      PORT: string;
      USER: string;
      PASSWORD: string;
    }
  }
}

export {};