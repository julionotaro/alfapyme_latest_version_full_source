from pathlib import Path
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
OUT = Path('/data/.openclaw/workspace/alfapyme/fixtures_realistic')
OUT.mkdir(exist_ok=True)
def build_embedded_pdf(path: Path):
    c = canvas.Canvas(str(path), pagesize=A4)
    text = c.beginText(50, 800)
    for line in [
        'PERMISO DE CIRCULACION',
        'Matricula: 1234ABC',
        'Titular: Julio Notaro',
        'Bastidor: VF7ABCD1234567890',
        'Fecha: 15/05/2026',
    ]:
        text.textLine(line)
    c.drawText(text)
    c.showPage()
    c.save()
def build_text_image(path: Path, lines):
    img = Image.new('RGB', (1200, 800), 'white')
    draw = ImageDraw.Draw(img)
    y = 40
    for line in lines:
      draw.text((40, y), line, fill='black')
      y += 60
    img.save(path)
def build_scanned_pdf(path: Path, source_png: Path):
    image = Image.open(source_png).convert('RGB')
    image.save(path, 'PDF', resolution=150.0)
build_embedded_pdf(OUT / 'permiso_embedded_real.pdf')
build_text_image(
    OUT / 'dni_real.png',
    [
        'DOCUMENTO NACIONAL DE IDENTIDAD',
        'Nombre: Julio Notaro',
        'DNI: 12345678Z',
    ],
)
build_text_image(
    OUT / 'contrato_scanned_source.png',
    [
        'CONTRATO DE COMPRAVENTA',
        'Comprador: Ana Perez',
        'Vendedor: Luis Gomez',
        'Matricula: 1234ABC',
        'Precio: 9500 EUR',
    ],
)
build_scanned_pdf(OUT / 'contrato_scanned_real.pdf', OUT / 'contrato_scanned_source.png')
print('generated', OUT)
