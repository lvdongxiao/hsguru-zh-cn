declare function GM_registerMenuCommand(
  caption: string,
  onClick: () => void,
): number;

declare function GM_unregisterMenuCommand(menuCommandId: number): void;

declare function GM_getValue<T>(key: string, defaultValue?: T): T;

declare function GM_setValue<T>(key: string, value: T): void;

declare function GM_setClipboard(text: string): void;

interface GMXmlHttpRequestResponse {
  status: number;
  responseText: string;
}

interface GMXmlHttpRequestOptions {
  method: 'GET';
  url: string;
  timeout?: number;
  onload: (response: GMXmlHttpRequestResponse) => void;
  onerror: () => void;
  ontimeout: () => void;
}

declare function GM_xmlhttpRequest(options: GMXmlHttpRequestOptions): void;

declare const unsafeWindow: Window & typeof globalThis;
