class Icons extends HTMLElement {
  constructor() {
    super();
    this.size = this.getAttribute("size") || 15;
  }

  connectedCallback() {
    this.innerHTML = this.github() + this.linkedin() + this.strava() + this.flickr();
  }

  github() {
    return `
    <a class="icon" title="Luca on github" href="https://github.com/lsbardel">
      <svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
      </svg>
    </a>`;
  }

  linkedin() {
    return `
    <a class="icon" title="Luca on linkedin" href="https://www.linkedin.com/in/lucasbardella/">
      <svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16">
  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
      </svg>
    </a>`;
  }

  strava() {
    return `
    <a class="icon" title="Luca on strava" href="https://www.strava.com/athletes/2280052">
    <svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" fill="currentColor" class="bi bi-strava" viewBox="0 0 16 16">
  <path d="M6.731 0 2 9.125h2.788L6.73 5.497l1.93 3.628h2.766zm4.694 9.125-1.372 2.756L8.66 9.125H6.547L10.053 16l3.484-6.875z"/>
</svg></a>`;
  }

  flickr() {
    return `
    <a class="icon" title="Luca on flickr" href="https://www.flickr.com/photos/sbardella/">
    <svg fill="currentColor" width="${this.size}" height="${this.size}" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 viewBox="0 0 455 455" xml:space="preserve">
<path style="fill-rule:evenodd;clip-rule:evenodd;" d="M0,0v455h455V0H0z M140.599,297.5C101.601,297.5,70,266.158,70,227.517
	c0-38.675,31.601-70.018,70.599-70.018c38.981,0,70.582,31.343,70.582,70.018C211.181,266.158,179.581,297.5,140.599,297.5z
	 M314.401,297.5c-38.981,0-70.582-31.343-70.582-69.983c0-38.675,31.601-70.018,70.582-70.018c38.999,0,70.599,31.343,70.599,70.018
	C385,266.158,353.399,297.5,314.401,297.5z"/>
</svg></a>`;
  }
}

customElements.define("luca-icons", Icons);
