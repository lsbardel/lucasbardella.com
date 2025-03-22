import click
import qrcode


@click.group()
def cli():
    pass


@cli.command()
def qr():
    """Generate QR code for lucasbardella.com"""
    img = qrcode.make('lucasbardella.com')
    img.save("content/assets/luca-qr.svg")



cli()
