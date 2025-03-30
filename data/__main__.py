import click
import qrcode
import qrcode.image.svg
import dotenv
import os

dotenv.load_dotenv()

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


@cli.command()
def ga_env() -> None:
    """Show google analytics env variables"""
    click.echo(os.getenv("GA_CLIENT_EMAIL"))
    private_key = os.getenv("GA_PRIVATE_KEY")
    # Replace escaped newlines with actual newlines
    if private_key:
        private_key = private_key.replace("\\n", "\n")
    click.echo(private_key)


cli()
