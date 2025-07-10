# Logo Assets

## Place your logo file here

Put your logo file in this directory with one of these names:
- `logo.svg` (preferred for scalability)
- `logo.png` (alternative format)
- `logo.jpg` (alternative format)

## Expected dimensions

Based on the Figma design:
- Width: 96px
- Height: 42.86px (approximately 43px)

## Current implementation

The SharedHeader component currently shows a placeholder with "LOGO" text and yellow/white background colors (#FBE54D and #FFFFFF) as specified in the Figma design.

Once you place your logo file here, you can replace the placeholder in:
`src/components/SharedHeader/SharedHeader.tsx`

## Example usage after placing logo

```tsx
// Import the logo
import logoSvg from '../../../assets/images/logo/logo.svg';

// Replace the logo-placeholder div with:
<img 
  src={logoSvg} 
  alt="BankIM Logo" 
  className="logo-image"
  width="96"
  height="43"
/>
```

## CSS for logo image

Add this CSS to `SharedHeader.css`:

```css
.logo-image {
  width: 96px;
  height: 42.86px;
  object-fit: contain;
  cursor: pointer;
}
``` 