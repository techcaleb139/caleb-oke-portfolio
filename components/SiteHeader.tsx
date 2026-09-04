import { nav, navAction, profile } from "../src/content/site.ts";

/* The mobile menu is a <details> element, so it opens and closes with no
   JavaScript. On desktop the toggle is hidden and the links sit inline. */
export default function SiteHeader() {
  return (
    <header className="siteHeader">
      <div className="shell headerBar">
        <a className="brand" href="#top">
          <span className="brandName">{profile.name}</span>
          <span className="brandRole">{profile.role}</span>
        </a>

        <nav className="navDesktop" aria-label="Main">
          {nav.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
          <a className="navAction" href={navAction.href}>{navAction.label}</a>
        </nav>

        <details className="navMobile">
          <summary aria-label="Menu">
            <span className="menuIcon" aria-hidden="true" />
          </summary>
          <nav className="navPanel" aria-label="Main">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
            <div className="navPanelAction">
              <a className="navAction" href={navAction.href}>{navAction.label}</a>
            </div>
            <SocialLinks className="navPanelSocial" />
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={className ? `socialLinks ${className}` : "socialLinks"}>
      <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href={profile.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
    </div>
  );
}
