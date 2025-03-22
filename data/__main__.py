import click
import qrcode
import qrcode.image.svg


@click.group()
def cli():
    pass


@cli.command()
def qr():
    """Generate QR code for lucasbardella.com"""
    context = "https://lucasbardella.com"
    img = qrcode.make(context, image_factory=qrcode.image.svg.SvgImage)
    img.save("content/assets/luca-qr.svg")
    img = qrcode.make(context)
    img.save("content/assets/luca-qr.png")


cli()
