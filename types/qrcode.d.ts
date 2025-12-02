/**
 * Type declarations untuk qrcode library
 */

declare module 'qrcode' {
	export interface QRCodeToDataURLOptions {
		errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
		type?: string;
		quality?: number;
		margin?: number;
		width?: number;
		color?: {
			dark?: string;
			light?: string;
		};
	}

	export interface QRCodeToCanvasOptions extends QRCodeToDataURLOptions {
		scalable?: boolean;
	}

	export interface QRCodeToStringOptions extends QRCodeToDataURLOptions {
		type?: string;
	}

	export function toDataURL(
		text: string,
		options?: QRCodeToDataURLOptions
	): Promise<string>;

	export function toCanvas(
		canvas: HTMLCanvasElement,
		text: string,
		options?: QRCodeToCanvasOptions
	): Promise<HTMLCanvasElement>;

	export function toString(
		text: string,
		options?: QRCodeToStringOptions
	): Promise<string>;

	export function toFile(
		path: string,
		text: string,
		options?: QRCodeToDataURLOptions
	): Promise<void>;
}
