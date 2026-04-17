import axios from "axios";
import toast from "react-hot-toast";

interface SendEmailParams {
	to: string;
	subject: string;
	html: string;
}

/**
 * Send email via Strapi API
 */
export const sendEmailNotification = async (params: SendEmailParams, jwt?: string) => {
	try {
		const apiUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/emails/send`;
		
		const response = await axios.post(apiUrl, params, {
			headers: {
				Authorization: jwt ? `Bearer ${jwt}` : undefined,
				"Content-Type": "application/json",
			},
		});

		return response.data;
	} catch (error: any) {
		console.error("Error sending email:", error);
		throw error;
	}
};

/**
 * Email template: Product Created Confirmation
 */
export const generateProductCreatedEmail = (
	vendorName: string,
	productName: string,
	productUrl: string
): string => {
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #2980b9; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
				.content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
				.footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
				.btn { display: inline-block; padding: 10px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
				.status-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; border-radius: 4px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>Produk Berhasil Ditambahkan! 🎉</h1>
				</div>
				<div class="content">
					<p>Halo ${vendorName},</p>
					<p>Produk Anda <strong>"${productName}"</strong> berhasil ditambahkan ke Celeparty.</p>
					
					<div class="status-box">
						<strong>⏳ Status:</strong> Menunggu Verifikasi Admin<br>
						<small>Tim admin kami akan memeriksa produk Anda dalam waktu 1-3 hari kerja.</small>
					</div>

					<p><strong>Apa yang akan terjadi selanjutnya?</strong></p>
					<ul>
						<li>Admin akan melakukan verifikasi pada produk Anda</li>
						<li>Kami akan mengirim notifikasi via email setelah verifikasi selesai</li>
						<li>Jika disetujui, produk akan dipublikasikan di halaman Celeparty</li>
					</ul>

					<a href="${productUrl}" class="btn">Lihat Produk</a>

					<p style="margin-top: 20px; font-size: 14px;">Terima kasih atas kepercayaan Anda kepada Celeparty!</p>
				</div>
				<div class="footer">
					<p>Email ini dikirim otomatis. Jangan membalas email ini.</p>
					<p>&copy; 2024 Celeparty. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`;
};

/**
 * Email template: Product Updated Confirmation
 */
export const generateProductUpdatedEmail = (
	vendorName: string,
	productName: string
): string => {
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #9b59b6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
				.content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
				.footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
				.status-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; border-radius: 4px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>Produk Berhasil Diperbarui ✓</h1>
				</div>
				<div class="content">
					<p>Halo ${vendorName},</p>
					<p>Perubahan pada produk <strong>"${productName}"</strong> telah kami terima.</p>
					
					<div class="status-box">
						<strong>⏳ Status:</strong> Menunggu Verifikasi Ulang<br>
						<small>Perubahan yang Anda buat akan diverifikasi oleh admin kami.</small>
					</div>

					<p><strong>Informasi Penting:</strong></p>
					<ul>
						<li>Perubahan akan direview dalam 1-3 hari kerja</li>
						<li>Produk akan tetap aktif di Celeparty selama proses verifikasi</li>
						<li>Kami akan memberitahu Anda ketika verifikasi selesai</li>
					</ul>

					<p style="margin-top: 20px; font-size: 14px;">Terima kasih sudah terus meningkatkan kualitas produk Anda!</p>
				</div>
				<div class="footer">
					<p>Email ini dikirim otomatis. Jangan membalas email ini.</p>
					<p>&copy; 2024 Celeparty. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`;
};

/**
 * Email template: Profile Updated
 */
export const generateProfileUpdatedEmail = (vendorName: string): string => {
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #16a085; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
				.content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
				.footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>Profil Anda Berhasil Diperbarui ✓</h1>
				</div>
				<div class="content">
					<p>Halo ${vendorName},</p>
					<p>Perubahan pada data profil Anda telah berhasil disimpan.</p>

					<p><strong>Data yang telah diperbarui:</strong></p>
					<ul>
						<li>Informasi pribadi</li>
						<li>Data lokasi layanan</li>
						<li>Informasi rekening bank</li>
					</ul>

					<p>Jika Anda tidak melakukan perubahan ini atau memiliki pertanyaan, silakan hubungi tim support kami.</p>
					
					<p style="margin-top: 20px; font-size: 14px;">Terima kasih!</p>
				</div>
				<div class="footer">
					<p>Email ini dikirim otomatis. Jangan membalas email ini.</p>
					<p>&copy; 2024 Celeparty. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`;
};
