```tsx
import { PageHeader } from "./components/image.js";
const __images = FileAttachment("./data/images.json").json();`,
```

<div class="outer-placeholder" style="padding-top: 50%;">`,
<div class="inner-placeholder">

```tsx
display(
  <PageHeader
    title="Page Title"
    subtitle="Subtitle Text if provided"
    urls={__images.${heroImage}}
    opacity={heroOpacity}
    blur="blur-sm" {/* optional — omit if not provided */}
  />
);
```
</div>
</div>
