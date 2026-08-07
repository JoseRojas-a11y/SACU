import os
import json
import urllib.request
import urllib.parse
from typing import Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_dotenv_file():
    """Carga variables desde el archivo .env en el directorio raíz del proyecto."""
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.isfile(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key not in os.environ:
                        os.environ[key] = val

load_dotenv_file()

# Cloudflare R2 Storage Config
CLOUDFLARE_R2_ACCOUNT_ID = os.getenv("CLOUDFLARE_R2_ACCOUNT_ID", "")
CLOUDFLARE_R2_ACCESS_KEY_ID = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID", "")
CLOUDFLARE_R2_SECRET_ACCESS_KEY = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "")
CLOUDFLARE_R2_BUCKET_NAME = os.getenv("CLOUDFLARE_R2_BUCKET_NAME", "")
CLOUDFLARE_R2_PUBLIC_URL = os.getenv("CLOUDFLARE_R2_PUBLIC_URL", "").rstrip("/")

def download_and_optimize_thumbnail(file_id: str, max_size_kb: int = 250) -> Optional[bytes]:
    """
    Descarga la imagen de la primera página del archivo desde el CDN de Google Drive
    y verifica que su peso sea inferior a max_size_kb (250 KB).
    """
    urls = [
        f"https://lh3.googleusercontent.com/d/{file_id}=w800",
        f"https://drive.google.com/thumbnail?id={file_id}&sz=w800"
    ]

    for url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as response:
                content = response.read()
                size_kb = len(content) / 1024
                print(f"[ThumbnailProcessor] Descargada miniatura para {file_id}: {size_kb:.2f} KB")

                # Si el peso supera los 250KB y PIL (Pillow) está instalado, comprimir
                if size_kb > max_size_kb:
                    try:
                        import io
                        # pyrefly: ignore [missing-import]
                        from PIL import Image
                        image = Image.open(io.BytesIO(content))
                        output = io.BytesIO()
                        image.save(output, format="JPEG", quality=75, optimize=True)
                        content = output.getvalue()
                        print(f"[ThumbnailProcessor] Miniatura optimizada a: {len(content)/1024:.2f} KB")
                    except ImportError:
                        print("[ThumbnailProcessor] PIL no instalado. Se usará la imagen original.")

                return content
        except Exception as e:
            print(f"[ThumbnailProcessor] Error al descargar de {url}: {e}")

    return None

def upload_thumbnail_to_cloudflare(file_id: str, image_bytes: bytes) -> Optional[str]:
    """
    Sube los bytes de la miniatura a Cloudflare R2 u Object Storage.
    Retorna la URL pública de la miniatura subida.
    """
    if not CLOUDFLARE_R2_ACCOUNT_ID or not CLOUDFLARE_R2_ACCESS_KEY_ID or not CLOUDFLARE_R2_SECRET_ACCESS_KEY:
        print("[CloudflareUploader] Credenciales de Cloudflare R2 no configuradas en .env.")
        print(f"[Simulation] La URL pública simulada sería: {CLOUDFLARE_R2_PUBLIC_URL or 'https://pub-cloudflare.r2.dev'}/thumbnails/{file_id}.jpg")
        return f"{CLOUDFLARE_R2_PUBLIC_URL or 'https://pub-cloudflare.r2.dev'}/thumbnails/{file_id}.jpg"

    try:
        import boto3
        endpoint_url = f"https://{CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        s3 = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=CLOUDFLARE_R2_ACCESS_KEY_ID,
            aws_secret_access_key=CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            region_name="auto"
        )
        object_key = f"thumbnails/{file_id}.jpg"
        s3.put_object(
            Bucket=CLOUDFLARE_R2_BUCKET_NAME,
            Key=object_key,
            Body=image_bytes,
            ContentType="image/jpeg"
        )
        public_url = f"{CLOUDFLARE_R2_PUBLIC_URL}/{object_key}"
        print(f"[CloudflareUploader] Subida exitosa a Cloudflare R2: {public_url}")
        return public_url
    except Exception as e:
        print(f"[CloudflareUploader] Error al subir a Cloudflare R2: {e}")
        return None

def process_single_file_test(file_id: str) -> Optional[str]:
    """Función de prueba unitaria para procesar 1 solo archivo individualmente."""
    print(f"\n==================================================")
    print(f"PRUEBA UNITARIA: Procesando miniatura para file_id={file_id}")
    print(f"==================================================")

    img_data = download_and_optimize_thumbnail(file_id)
    if not img_data:
        print(f"[Test Error] No se pudo descargar la miniatura para {file_id}")
        return None

    public_url = upload_thumbnail_to_cloudflare(file_id, img_data)
    print(f"[Test Resultado] URL generada: {public_url}\n")
    return public_url

if __name__ == "__main__":
    import sys
    test_id = sys.argv[1] if len(sys.argv) > 1 else "1DriveFileId_BMA01_EP1"
    process_single_file_test(test_id)
