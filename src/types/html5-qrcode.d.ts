declare module 'html5-qrcode' {
  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: { fps: number; qrbox: { width: number; height: number } }
    );
    render(
      onScanSuccess: (decodedText: string) => void,
      onScanFailure: (error: any) => void
    ): void;
    clear(): void;
  }
}